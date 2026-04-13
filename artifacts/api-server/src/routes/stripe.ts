import { Router, type IRouter } from 'express';
import { getAuth } from '@clerk/express';
import { storage } from '../storage';
import { stripeService } from '../stripeService';
import { fulfillCheckout } from '../fulfillment';

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
};

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
  const { priceId, redirectAfter } = req.body;
  if (!priceId) return res.status(400).json({ error: 'priceId required' });
  try {
    let user = await storage.getUser(req.userId);
    if (!user) {
      const auth = getAuth(req);
      user = await storage.createUser(req.userId, auth?.sessionClaims?.email as string | undefined);
    }

    let customerId = user?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(user?.email ?? req.userId, req.userId);
      await storage.updateUserStripeInfo(req.userId, { stripeCustomerId: customer.id });
      customerId = customer.id;
    }

    const host = req.headers.host || '';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    // redirectAfter lets the client control where to go after fulfillment on the success page
    const redirectParam = redirectAfter
      ? `&redirect=${encodeURIComponent(redirectAfter)}`
      : '';
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}${redirectParam}`;
    const cancelUrl = redirectAfter ? `${baseUrl}${redirectAfter}` : `${baseUrl}/pricing`;

    const session = await stripeService.createCheckoutSession(customerId, priceId, successUrl, cancelUrl);

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to create checkout session' });
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
    const returnUrl = `${proto}://${host}/`;

    const session = await stripeService.createCustomerPortalSession(user.stripeCustomerId, returnUrl);
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Failed to create portal session' });
  }
});

router.get('/stripe/subscription', requireAuth, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.userId);
    if (!user?.stripeSubscriptionId) return res.json({ subscription: null, planTier: null });
    const [sub, planTier] = await Promise.all([
      storage.getSubscription(user.stripeSubscriptionId),
      storage.getSubscriptionPlanTier(user.stripeSubscriptionId),
    ]);
    res.json({ subscription: sub, planTier });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
