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

  const user = await storage.getUserByStripeCustomerId(customerId);
  if (!user) {
    logger.warn({ sessionId, customerId }, 'No user found for customer — cannot fulfill');
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
