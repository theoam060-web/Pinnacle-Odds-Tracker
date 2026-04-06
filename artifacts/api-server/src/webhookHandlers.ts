import { getStripeSync } from './stripeClient';
import { fulfillCheckout } from './fulfillment';
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

    // 2. Parse the event (already verified by stripeSync above) and run fulfillment
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
    } catch (err) {
      // Non-fatal: sync already succeeded; log and continue
      logger.error({ err }, 'Error running post-sync fulfillment');
    }
  }
}
