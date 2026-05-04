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
    trialEligible = false,
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
      ...(trialEligible
        ? { subscription_data: { trial_period_days: 14 } }
        : {}),
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

  async getSubscriptionPaymentFingerprint(subscriptionId: string): Promise<string | null> {
    try {
      const stripe = await getUncachableStripeClient();
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['default_payment_method'],
      });
      const pm = sub.default_payment_method as any;
      return pm?.card?.fingerprint ?? null;
    } catch (err) {
      logger.warn({ err, subscriptionId }, 'Could not retrieve payment method fingerprint');
      return null;
    }
  },

  async endTrialNow(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return stripe.subscriptions.update(subscriptionId, { trial_end: 'now' } as any);
  },

  /**
   * Check whether any Stripe customer at `email` (excluding `excludeCustomerId`)
   * has ever had a trialing or active subscription. Used to prevent trial abuse
   * when a user signs up with the same email via a different Clerk account.
   */
  async checkEmailHasUsedTrial(email: string, excludeCustomerId?: string): Promise<boolean> {
    try {
      const stripe = await getUncachableStripeClient();
      const customers = await stripe.customers.list({ email, limit: 10 });
      for (const customer of customers.data) {
        if (excludeCustomerId && customer.id === excludeCustomerId) continue;
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 5,
        });
        for (const sub of subs.data) {
          if (sub.trial_start != null) return true;
        }
      }
      return false;
    } catch (err) {
      logger.warn({ err, email }, 'checkEmailHasUsedTrial failed — assuming no trial used');
      return false;
    }
  },

  async recoverSubscriptionByCustomerId(userId: string, customerId: string) {
    try {
      const stripe = await getUncachableStripeClient();
      // List without deep expand (Stripe limits list expands to 4 levels max)
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });
      if (subs.data.length === 0) return { subscriptionId: null };

      // Retrieve individually with product expand (4 levels for single object)
      const sub = await stripe.subscriptions.retrieve(subs.data[0].id, {
        expand: ['items.data.price.product'],
      });
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
        // List without deep expand
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });
        if (subs.data.length > 0) {
          // Retrieve individually with product expand
          const sub = await stripe.subscriptions.retrieve(subs.data[0].id, {
            expand: ['items.data.price.product'],
          });
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

export function isAccessAllowed(
  status: string | null | undefined,
  opts?: {
    cancelAtPeriodEnd?: boolean | null;
    currentPeriodEnd?: number | null;
    trialEnd?: number | null;
  },
): boolean {
  if (status === 'active' || status === 'trialing') return true;

  const nowSec = Math.floor(Date.now() / 1000);

  // User cancelled but is still within their paid or trial period
  if (opts?.cancelAtPeriodEnd && opts.currentPeriodEnd && opts.currentPeriodEnd > nowSec) return true;

  // DB has 'cancelled' but live Stripe says the period hasn't expired yet
  if (status === 'cancelled' || status === 'canceled') {
    if (opts?.currentPeriodEnd && opts.currentPeriodEnd > nowSec) return true;
    if (opts?.trialEnd && opts.trialEnd > nowSec) return true;
  }

  return false;
}
