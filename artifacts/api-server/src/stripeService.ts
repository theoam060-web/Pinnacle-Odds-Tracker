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
    withTrial: boolean = false,
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
      // Always require card — even during trial
      payment_method_collection: 'always',
      ...(withTrial
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

  /**
   * Check whether an email address has already been used for a free trial.
   * Looks at all Stripe customers with that email for any trialing or
   * previously-trialed subscription.
   */
  async checkEmailHasUsedTrial(email: string, excludeCustomerId?: string): Promise<boolean> {
    try {
      const stripe = await getUncachableStripeClient();
      const customers = await stripe.customers.list({ email, limit: 10 });
      for (const customer of customers.data) {
        if (excludeCustomerId && customer.id === excludeCustomerId) continue;
        // List ALL subscriptions (any status) to catch cancelled trials
        const subs = await stripe.subscriptions.list({ customer: customer.id, limit: 10 });
        for (const sub of subs.data) {
          if (sub.trial_start != null) return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Check whether a specific customer has already had a trial
   */
  async customerHasUsedTrial(customerId: string): Promise<boolean> {
    try {
      const stripe = await getUncachableStripeClient();
      const subs = await stripe.subscriptions.list({ customer: customerId, limit: 20 });
      return subs.data.some((s) => s.trial_start != null);
    } catch {
      return false;
    }
  },

  async recoverSubscriptionByCustomerId(userId: string, customerId: string) {
    try {
      const stripe = await getUncachableStripeClient();
      // List without deep expansion (Stripe limits list expand to 4 levels;
      // data.items.data.price.product is 5 levels and throws an error).
      // We get the sub ID from the list, then retrieve it separately with the
      // allowed expansion depth.
      const [activeSubs, trialingSubs] = await Promise.all([
        stripe.subscriptions.list({ customer: customerId, status: 'active',   limit: 1 }),
        stripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 1 }),
      ]);

      const listSub = activeSubs.data[0] ?? trialingSubs.data[0];
      if (!listSub) return { subscriptionId: null };

      // Retrieve the full subscription with product metadata
      const sub = await stripe.subscriptions.retrieve(listSub.id, {
        expand: ['items.data.price.product'],
      });

      const tier = getPlanTierFromSub(sub);
      await storage.updateUserStripeInfo(userId, {
        stripeSubscriptionId: sub.id,
        subscriptionStatus: sub.status,
        subscriptionPlan: tier,
      });
      logger.info({ userId, subId: sub.id, tier, status: sub.status }, 'Recovered subscription by customerId');
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
        // List without deep expansion to stay within Stripe's 4-level limit
        const [activeSubs, trialingSubs] = await Promise.all([
          stripe.subscriptions.list({ customer: customer.id, status: 'active',   limit: 1 }),
          stripe.subscriptions.list({ customer: customer.id, status: 'trialing', limit: 1 }),
        ]);

        const listSub = activeSubs.data[0] ?? trialingSubs.data[0];
        if (listSub) {
          // Retrieve with product expansion (single-resource retrieve allows 3+ levels)
          const sub = await stripe.subscriptions.retrieve(listSub.id, {
            expand: ['items.data.price.product'],
          });
          const tier = getPlanTierFromSub(sub);
          await storage.updateUserStripeInfo(userId, {
            stripeCustomerId: customer.id,
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            subscriptionPlan: tier,
          });
          logger.info({ userId, subId: sub.id, tier, status: sub.status }, 'Recovered subscription by email');
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

/** Returns true for statuses that grant app access */
export function isAccessAllowed(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
