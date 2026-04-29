import { Router, type IRouter } from 'express';
import { storage } from '../storage.js';
import { stripeService } from '../stripeService.js';
import { fulfillCheckout } from '../fulfillment.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { getStripePublishableKey } from '../stripeClient.js';
import { logger } from '../lib/logger.js';

const router: IRouter = Router();

// Public key for Stripe.js on the frontend
router.get('/stripe/publishable-key', async (_req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (err: any) {
    res.status(500).json({ error: 'Stripe not configured' });
  }
});

// List available plans from stripe.products DB (populated by stripe-replit-sync)
router.get('/stripe/plans', async (_req, res) => {
  try {
    const plans = await storage.listPlans();
    res.json({ plans });
  } catch (err: any) {
    // Gracefully return static plans when DB is not yet synced
    res.json({
      plans: [
        { id: 'silver', name: 'Silver', price: 3499, currency: 'eur', interval: 'month' },
        { id: 'gold',   name: 'Gold',   price: 8499, currency: 'eur', interval: 'month' },
        { id: 'platinum', name: 'Platinum', price: 11499, currency: 'eur', interval: 'month' },
      ],
    });
  }
});

// Create a Stripe Checkout Session
router.post('/stripe/checkout', requireAuth, async (req: any, res) => {
  const { plan, redirectAfter } = req.body as { plan: string; redirectAfter?: string };
  if (!plan) return res.status(400).json({ error: 'plan required' });

  try {
    const userEmail: string | undefined = req.userEmail;
    let user = await storage.getUser(req.userId);
    if (!user) user = await storage.createUser(req.userId, userEmail);

    // Ensure Stripe customer exists
    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(user?.email ?? userEmail, req.userId);
      await storage.updateUserStripeInfo(req.userId, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }

    // Resolve price ID — first try DB, then Stripe API directly
    let priceId = await storage.getPriceIdByPlan(plan);
    if (!priceId) {
      priceId = await storage.getPriceIdByPlanFromStripe(plan);
    }
    if (!priceId) {
      return res.status(400).json({ error: `No active price found for plan: ${plan}. Make sure Stripe products are seeded.` });
    }

    const host = req.headers.host || '';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const baseUrl = `${proto}://${host}`;
    const appBase = `${baseUrl}/app/`;
    const successUrl = `${appBase}?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = redirectAfter ? `${baseUrl}${redirectAfter}` : `${baseUrl}/pricing`;

    const session = await stripeService.createCheckoutSession(customerId, priceId, successUrl, cancelUrl, req.userId);
    res.json({ url: session.url });
  } catch (err: any) {
    const detail = err?.raw?.message ?? err?.message ?? 'Failed to create checkout session';
    logger.error({ err }, '[stripe/checkout] error');
    res.status(500).json({ error: detail });
  }
});

// Fulfill a checkout session (called when user returns from Stripe)
router.get('/stripe/checkout/session', async (req, res) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) return res.status(400).json({ error: 'session_id required' });
  try {
    const result = await fulfillCheckout(sessionId);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    logger.error({ err }, '[stripe/checkout/session] error');
    res.status(500).json({ error: err.message ?? 'Failed to fulfill session' });
  }
});

// Open Stripe Customer Portal (manage/cancel subscription)
router.post('/stripe/portal', requireAuth, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user?.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }
    const host = req.headers.host || '';
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const returnUrl = `${proto}://${host}/app/`;
    const session = await stripeService.createCustomerPortalSession(user.stripeCustomerId, returnUrl);
    res.json({ url: session.url });
  } catch (err: any) {
    logger.error({ err }, '[stripe/portal] error');
    res.status(500).json({ error: err.message ?? 'Failed to open portal' });
  }
});

// Get current user's subscription info
router.get('/stripe/subscription', requireAuth, async (req: any, res) => {
  try {
    let user = await storage.getUser(req.userId);

    // Live recovery: if DB has no subscription, try to recover from Stripe
    if (!user?.stripeSubscriptionId) {
      const email: string | undefined = req.userEmail;
      if (user?.stripeCustomerId) {
        const recovered = await stripeService.recoverSubscriptionByCustomerId(req.userId, user.stripeCustomerId);
        if (recovered.subscriptionId) user = await storage.getUser(req.userId);
      } else if (email) {
        const recovered = await stripeService.recoverSubscriptionByEmail(req.userId, email);
        if (recovered.subscriptionId) user = await storage.getUser(req.userId);
      }
    }

    if (!user?.stripeSubscriptionId) {
      return res.json({ subscription: null, planTier: null });
    }

    if (user.subscriptionStatus !== 'active') {
      return res.json({
        subscription: { status: user.subscriptionStatus ?? 'unknown' },
        planTier: null,
      });
    }

    // Get plan tier from DB or stored field
    const planTier =
      user.subscriptionPlan ??
      (await storage.getSubscriptionPlanTier(user.stripeSubscriptionId));

    res.json({
      subscription: { status: 'active', id: user.stripeSubscriptionId },
      planTier,
    });
  } catch (err) {
    logger.error({ err }, '[stripe/subscription] error');
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
