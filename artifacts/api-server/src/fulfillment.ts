import { stripeService, getPlanTierFromSub } from './stripeService.js';
import { storage } from './storage.js';
import { logger } from './lib/logger.js';

export async function fulfillCheckout(sessionId: string) {
  const session = await stripeService.retrieveSession(sessionId);

  const customerId =
    typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id;
  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id;

  if (!customerId || !subscriptionId) {
    throw new Error('Session missing customer or subscription');
  }

  const clerkUserId =
    session.client_reference_id ??
    (typeof session.customer === 'object'
      ? (session.customer as any)?.metadata?.clerkUserId
      : null);

  if (!clerkUserId) {
    throw new Error('Session missing client_reference_id (Clerk user ID)');
  }

  // Check if already fulfilled
  const existingUser = await storage.getUser(clerkUserId);
  if (existingUser?.stripeSubscriptionId === subscriptionId) {
    logger.info({ clerkUserId, subscriptionId }, 'Checkout already fulfilled');
    return {
      plan: existingUser.subscriptionPlan,
      status: existingUser.subscriptionStatus,
      alreadyFulfilled: true,
      trialActive: existingUser.subscriptionStatus === 'trialing',
    };
  }

  // Retrieve subscription to get actual status and plan tier
  const sub = await stripeService.retrieveSubscription(subscriptionId);
  const tier = getPlanTierFromSub(sub);
  // Use Stripe's actual status ('trialing', 'active', etc.)
  const status = sub.status ?? 'active';
  const isTrialing = status === 'trialing';

  const customerEmail =
    typeof session.customer === 'object' ? (session.customer as any)?.email : undefined;

  await storage.upsertUserFromStripe(
    clerkUserId,
    customerEmail,
    customerId,
    subscriptionId,
    status,
    tier,
    isTrialing ? true : undefined,
  );

  logger.info({ clerkUserId, subscriptionId, tier, status }, 'Checkout fulfilled');
  return {
    plan: tier,
    status,
    alreadyFulfilled: false,
    trialActive: isTrialing,
  };
}
