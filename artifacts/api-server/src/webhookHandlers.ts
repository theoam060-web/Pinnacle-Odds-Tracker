import { getStripeSync } from './stripeClient';
import { fulfillCheckout } from './fulfillment';
import { storage } from './storage';
import { logger } from './lib/logger';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // 1. Sync Stripe data into the database (stripe-replit-sync)
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // 2. Parse the event (already verified by stripeSync above) and run fulfillment / lifecycle
    try {
      const event = JSON.parse(payload.toString('utf8'));
      const type: string = event?.type ?? '';

      if (
        type === 'checkout.session.completed' ||
        type === 'checkout.session.async_payment_succeeded'
      ) {
        const sessionId: string | undefined = event?.data?.object?.id;
        if (sessionId) {
          logger.info({ sessionId, eventType: type }, 'Running fulfillment for checkout session');
          await fulfillCheckout(sessionId);
        }
      }

      if (type === 'customer.subscription.updated') {
        const sub = event?.data?.object;
        const subscriptionId: string | undefined = sub?.id;
        const status: string | undefined = sub?.status;
        if (subscriptionId && status) {
          const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
          if (user) {
            const subscriptionStatus =
              status === 'active' || status === 'trialing' ? 'active' :
              status === 'past_due' ? 'past_due' :
              status === 'canceled' || status === 'cancelled' ? 'cancelled' :
              null;
            await storage.updateUserStripeInfo(user.id, { subscriptionStatus });
            logger.info({ subscriptionId, status, subscriptionStatus, userId: user.id }, 'Subscription status updated');
          }
        }
      }

      if (type === 'customer.subscription.deleted') {
        const sub = event?.data?.object;
        const subscriptionId: string | undefined = sub?.id;
        if (subscriptionId) {
          const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
          if (user) {
            await storage.updateUserStripeInfo(user.id, { subscriptionStatus: 'cancelled' });
            logger.info({ subscriptionId, userId: user.id }, 'Subscription cancelled — access revoked');
          }
        }
      }

      if (type === 'invoice.payment_failed') {
        const invoice = event?.data?.object;
        const subscriptionId: string | undefined =
          typeof invoice?.subscription === 'string' ? invoice.subscription : invoice?.subscription?.id;
        if (subscriptionId) {
          const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
          if (user) {
            await storage.updateUserStripeInfo(user.id, { subscriptionStatus: 'past_due' });
            logger.info({ subscriptionId, userId: user.id }, 'Invoice payment failed — status set to past_due');
          }
        }
      }

      if (type === 'invoice.payment_succeeded') {
        const invoice = event?.data?.object;
        const subscriptionId: string | undefined =
          typeof invoice?.subscription === 'string' ? invoice.subscription : invoice?.subscription?.id;
        if (subscriptionId) {
          const user = await storage.getUserByStripeSubscriptionId(subscriptionId);
          if (user && user.subscriptionStatus === 'past_due') {
            await storage.updateUserStripeInfo(user.id, { subscriptionStatus: 'active' });
            logger.info({ subscriptionId, userId: user.id }, 'Invoice payment recovered — status set to active');
          }
        }
      }
    } catch (err) {
      // Non-fatal: sync already succeeded; log and continue
      logger.error({ err }, 'Error running post-sync fulfillment/lifecycle handler');
    }
  }
}
