import { storage } from './storage';
import { getUncachableStripeClient } from './stripeClient';
import { logger } from './lib/logger';

export class StripeService {
  async createCustomer(email: string | undefined, userId: string) {
    const stripe = await getUncachableStripeClient();
    const params: any = { metadata: { userId } };
    if (email) params.email = email;
    return await stripe.customers.create(params);
  }

  async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  }

  async cancelSubscription(subscriptionId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  /**
   * Live Stripe recovery: looks up an active subscription for the given email
   * directly from the Stripe API. Called as a fallback when our DB has no
   * subscription linked for the user (e.g. webhook verification failed).
   * If an active subscription is found it is written back to our DB so future
   * calls hit the fast DB path.
   */
  async recoverSubscriptionByEmail(userId: string, email: string): Promise<{
    subscriptionId: string | null;
    customerId: string | null;
    status: string | null;
  }> {
    try {
      const stripe = await getUncachableStripeClient();

      // Search for Stripe customers with this email
      const customers = await stripe.customers.list({ email, limit: 10 });

      for (const customer of customers.data) {
        // Look for active or trialing subscriptions
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 5,
        });

        if (subs.data.length === 0) {
          // Try trialing too
          const trialSubs = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'trialing',
            limit: 5,
          });
          subs.data.push(...trialSubs.data);
        }

        if (subs.data.length > 0) {
          const sub = subs.data[0];
          logger.info(
            { userId, email, customerId: customer.id, subscriptionId: sub.id, status: sub.status },
            'Live Stripe recovery: found active subscription — writing to DB',
          );

          // Write back to DB so next call is fast
          await storage.upsertUserFromStripe(userId, email, customer.id, sub.id, 'active');

          return {
            subscriptionId: sub.id,
            customerId: customer.id,
            status: sub.status,
          };
        }
      }

      return { subscriptionId: null, customerId: null, status: null };
    } catch (err) {
      logger.error({ err, userId, email }, 'Live Stripe recovery failed');
      return { subscriptionId: null, customerId: null, status: null };
    }
  }

  /**
   * Look up subscription directly from Stripe for a known customerId.
   */
  async recoverSubscriptionByCustomerId(userId: string, customerId: string): Promise<{
    subscriptionId: string | null;
    status: string | null;
  }> {
    try {
      const stripe = await getUncachableStripeClient();
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 5,
      });
      if (subs.data.length === 0) {
        const trialSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'trialing',
          limit: 5,
        });
        subs.data.push(...trialSubs.data);
      }

      if (subs.data.length > 0) {
        const sub = subs.data[0];
        logger.info(
          { userId, customerId, subscriptionId: sub.id },
          'Live Stripe recovery (by customerId): writing subscription to DB',
        );
        await storage.updateUserStripeInfo(userId, {
          stripeSubscriptionId: sub.id,
          subscriptionStatus: 'active',
        });
        return { subscriptionId: sub.id, status: sub.status };
      }
      return { subscriptionId: null, status: null };
    } catch (err) {
      logger.error({ err, userId, customerId }, 'Live Stripe recovery by customerId failed');
      return { subscriptionId: null, status: null };
    }
  }
}

export const stripeService = new StripeService();
