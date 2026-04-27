import { Router, type IRouter } from 'express';
import { storage } from '../storage';
import { stripeService } from '../stripeService';
import { fulfillCheckout } from '../fulfillment';
import { requireAuth } from '../middlewares/requireAuth';

const router: IRouter = Router();

router.get('/stripe/products', async (_req, res) => {
  try {
    const rows = await storage.listProductsWithPrices();
    const productsMap = new Map<string, any>();
    for (const row of rows) {
      if (!productsMap.has(row.product_id as string)) {
        productsMap.set(row.product_id as string, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          metadata: row.product_metadata,
          prices: [],
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id as string).prices.push({
          id: row.price_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
        });
      }
    }
    res.json({ data: Array.from(productsMap.values()) });
  } catch (err: any) {
    if (err?.message?.includes('stripe') || err?.code === '3F000' || err?.code === '42P01') {
      return res.json({ data: [] });
    }
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/stripe/checkout', requireAuth, async (req: any, res) => {
  const { plan, priceId: rawPriceId, redirectAfter } = req.body;
  if (!plan && !rawPriceId) return res.status(400).json({ error: 'plan or priceId required' });

  // Resolve priceId server-side when caller sends a plan name
  let priceId = rawPriceId as string | null | undefined;
  if (plan && !priceId) {
    priceId = await storage.getPriceIdByPlan(plan);
    if (!priceId) return res.status(400).json({ error: `No active price found for plan: ${plan}` });
  }
  try {
    const userEmail: string | undefined = req.userEmail;
    let user = await storage.getUser(req.userId);
    if (!user) {
      user = await storage.createUser(req.userId, userEmail);
    }

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      // Use stored email, fallback to JWT email — never use userId as email
      const emailForStripe = user?.email ?? userEmail;
      const customer = await stripeService.createCustomer(emailForStripe, req.userId);
      await storage.updateUserStripeInfo(req.userId, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }

    const host = req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    // Success URL lands back in the app itself (at /app/) with the session_id as a query param.
    // The SubscriptionGate on the frontend reads this, calls /api/stripe/checkout/session to
    // fulfill the checkout immediately, then clears the param from the URL.
    const appBase = `${baseUrl}/app/`;
    const successUrl = `${appBase}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = redirectAfter ? `${baseUrl}${redirectAfter}` : `${appBase}`;

    const session = await stripeService.createCheckoutSession(customerId, priceId, successUrl, cancelUrl);

    res.json({ url: session.url });
  } catch (err: any) {
    const detail = err?.raw?.message ?? err?.message ?? 'Failed to create checkout session';
    console.error('[stripe/checkout] error:', detail, err?.raw ?? err);
    res.status(500).json({ error: detail });
  }
});

// Called by the success page — fulfills the checkout session and returns plan info
router.get('/stripe/checkout/session', async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) return res.status(400).json({ error: 'session_id required' });
  try {
    const result = await fulfillCheckout(sessionId);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to fulfill session' });
  }
});

router.post('/stripe/portal', requireAuth, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user?.stripeCustomerId) return res.status(400).json({ error: 'No subscription found' });

    const host = req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const returnUrl = `${proto}://${host}/app/`;

    const session = await stripeService.createCustomerPortalSession(user.stripeCustomerId, returnUrl);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to create portal session' });
  }
});

router.post('/stripe/cancel', requireAuth, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user?.stripeCustomerId) return res.status(400).json({ error: 'No subscription found' });

    const subscriptionId = user.stripeSubscriptionId;
    if (!subscriptionId) return res.status(400).json({ error: 'No active subscription found' });

    const updated = await stripeService.cancelSubscription(subscriptionId);
    res.json({ ok: true, subscription: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to cancel subscription' });
  }
});

router.get('/stripe/subscription', requireAuth, async (req: any, res) => {
  try {
    let user = await storage.getUser(req.userId);

    // ── Live Stripe recovery ────────────────────────────────────────────────
    // If our DB has no subscription linked (webhook may have failed), hit the
    // Stripe API directly to recover the subscription. This handles the case
    // where a user paid but the webhook verification failed.
    if (!user?.stripeSubscriptionId) {
      const email: string | undefined = req.userEmail;

      if (user?.stripeCustomerId) {
        // Fast path: we know the customer, just look for active subs
        const recovered = await stripeService.recoverSubscriptionByCustomerId(req.userId, user.stripeCustomerId);
        if (recovered.subscriptionId) {
          user = await storage.getUser(req.userId);
        }
      } else if (email) {
        // Slow path: look up by email (webhook-failure scenario)
        const recovered = await stripeService.recoverSubscriptionByEmail(req.userId, email);
        if (recovered.subscriptionId) {
          user = await storage.getUser(req.userId);
        }
      }
    }

    if (!user?.stripeSubscriptionId) return res.json({ subscription: null, planTier: null });

    // Strict gate: only grant access when subscriptionStatus is explicitly 'active'.
    // All other values (null, 'cancelled', 'past_due', etc.) return planTier: null.
    // Pre-migration users without a status are backfilled at server startup, so
    // null here reliably means "no active subscription."
    if (user.subscriptionStatus !== 'active') {
      return res.json({ subscription: { status: user.subscriptionStatus ?? 'unknown' }, planTier: null });
    }

    const [sub, planTier] = await Promise.all([
      storage.getSubscription(user.stripeSubscriptionId),
      storage.getSubscriptionPlanTier(user.stripeSubscriptionId),
    ]);

    // If the DB subscription tables are not yet synced (stripe-replit-sync lag),
    // fall back to a basic active response so the user isn't locked out.
    if (!sub) {
      return res.json({
        subscription: { status: 'active', id: user.stripeSubscriptionId },
        planTier: planTier ?? 'silver',
      });
    }

    res.json({ subscription: sub, planTier });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
