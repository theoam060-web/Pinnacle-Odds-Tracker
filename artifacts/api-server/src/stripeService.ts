import { getUncachableStripeClient } from './stripeClient.js';
import { storage } from './storage.js';
import { logger } from './lib/logger.js';

export const stripeService = {
  async createCustomer(email: string | undefined, clerkUserId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.customers.create({
      email,
      metadata: { clerkUserId },
    });
  },

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    clerkUserId: string,
  ) {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: clerkUserId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });
  },

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  },

  async cancelSubscription(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.subscriptions.cancel(subscriptionId);
  },

  async retrieveSession(sessionId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });
  },

  async retrieveSubscription(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price.product'] });
  },

  async recoverSubscriptionByCustomerId(userId: string, customerId: string) {
    try {
      const stripe = await getUncachableStripeClient();
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
        expand: ['data.items.data.price.product'],
      });
      if (subs.data.length === 0) return { subscriptionId: null };

      const sub = subs.data[0];
      const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
      const tier = getPlanTierFromSub(sub);

      await storage.updateUserStripeInfo(userId, {
        stripeSubscriptionId: sub.id,
        subscriptionStatus: status,
        subscriptionPlan: tier,
      });
      logger.info({ userId, subId: sub.id, tier }, 'Recovered subscription by customerId');
      return { subscriptionId: sub.id, tier };
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to recover subscription by customerId');
      return { subscriptionId: null };
    }
  },

  async recoverSubscriptionByEmail(userId: string, email: string) {
    try {
      const stripe = await getUncachableStripeClient();
      const customers = await stripe.customers.list({ email, limit: 5 });
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
          expand: ['data.items.data.price.product'],
        });
        if (subs.data.length > 0) {
          const sub = subs.data[0];
          const status = sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status;
          const tier = getPlanTierFromSub(sub);
          await storage.updateUserStripeInfo(userId, {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: sub.id,
            subscriptionStatus: status,
            subscriptionPlan: tier,
          });
          logger.info({ userId, subId: sub.id, tier }, 'Recovered subscription by email');
          return { subscriptionId: sub.id, tier };
        }
      }
      return { subscriptionId: null };
    } catch (err) {
      logger.warn({ err, userId }, 'Failed to recover subscription by email');
      return { subscriptionId: null };
    }
  },
};

export function getPlanTierFromSub(sub: any): 'silver' | 'gold' | 'platinum' | null {
  try {
    const items = sub.items?.data ?? [];
    for (const item of items) {
      const product = item.price?.product;
      const meta = typeof product === 'object' ? product?.metadata : null;
      const plan = meta?.plan;
      if (plan === 'silver' || plan === 'gold' || plan === 'platinum') return plan;
    }
    return null;
  } catch {
    return null;
  }
}

export function isAccessAllowed(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
