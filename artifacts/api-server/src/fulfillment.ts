import { getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { logger } from './lib/logger';

export async function fulfillCheckout(sessionId: string): Promise<{
  alreadyFulfilled: boolean;
  plan?: string;
  email?: string;
}> {
  const stripe = await getUncachableStripeClient();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'line_items.data.price.product'],
  });

  if (session.payment_status !== 'paid') {
    logger.info({ sessionId, paymentStatus: session.payment_status }, 'Skipping fulfillment — not paid');
    return { alreadyFulfilled: false };
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id;

  if (!customerId) {
    logger.warn({ sessionId }, 'No customer on session — cannot fulfill');
    return { alreadyFulfilled: false };
  }

  // Resolve user via Stripe customerId first (Hosted Checkout flow);
  // fall back to client_reference_id (Payment Link flow, where we attach the
  // Clerk userId as client_reference_id and the customer is created fresh).
  const clientReferenceId =
    typeof session.client_reference_id === 'string' && session.client_reference_id.length > 0
      ? session.client_reference_id
      : undefined;

  let user = await storage.getUserByStripeCustomerId(customerId);

  if (!user && clientReferenceId) {
    user = await storage.getUser(clientReferenceId);
    if (user) {
      // SECURITY: client_reference_id is supplied via the Payment Link URL
      // and is therefore user-controlled. We only auto-link a fresh Stripe
      // customer to a user who does NOT yet have one. If the user already
      // has a different stripeCustomerId attached, refuse to overwrite —
      // overwriting would clobber their existing billing portal association
      // and could be a misdirected or malicious payment that grants the
      // wrong account a subscription.
      if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
        logger.warn(
          {
            sessionId,
            newCustomerId: customerId,
            existingCustomerId: user.stripeCustomerId,
            userId: user.id,
            clientReferenceId,
          },
          'Refusing to link Payment Link customer: user already has a different stripeCustomerId',
        );
        return { alreadyFulfilled: false };
      }
      if (!user.stripeCustomerId) {
        // First-time link — safe to attach this Stripe customer to the user
        // so future lifecycle webhooks (cancel, past_due, etc.) can resolve.
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
        logger.info(
          { sessionId, customerId, userId: user.id },
          'Resolved user via client_reference_id and linked Stripe customer',
        );
      }
    }
  }

  if (!user) {
    logger.warn(
      { sessionId, customerId, clientReferenceId },
      'No user found for customer or client_reference_id — cannot fulfill',
    );
    return { alreadyFulfilled: false };
  }

  if (user.stripeSubscriptionId && user.stripeSubscriptionId === subscriptionId) {
    logger.info({ sessionId, subscriptionId }, 'Already fulfilled — skipping');
    return { alreadyFulfilled: true };
  }

  await storage.updateUserStripeInfo(user.id, {
    stripeSubscriptionId: subscriptionId ?? undefined,
    subscriptionStatus: 'active',
  });

  const firstItem = session.line_items?.data?.[0];
  const product = (firstItem?.price as any)?.product;
  const planName: string = (typeof product === 'object' ? product?.name : null) ?? 'SharpTracker';

  logger.info({ sessionId, customerId, subscriptionId, planName }, 'Checkout fulfilled');

  return { alreadyFulfilled: false, plan: planName, email: session.customer_details?.email ?? undefined };
}
