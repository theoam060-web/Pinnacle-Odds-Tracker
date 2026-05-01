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
    (typeof session.customer === 'object' ? (session.customer as any)?.metadata?.clerkUserId : null);

  if (!clerkUserId) {
    throw new Error('Session missing client_reference_id (Clerk user ID)');
  }

  // Retrieve subscription to get plan tier and real status
  const sub = await stripeService.retrieveSubscription(subscriptionId);
  const tier = getPlanTierFromSub(sub);
  const trialActive = sub.status === 'trialing';
  // Store actual status so access-gate can distinguish trialing vs active
  const status = sub.status === 'active' || sub.status === 'trialing' ? sub.status : (sub.status ?? 'active');

  const customerEmail =
    typeof session.customer === 'object' ? (session.customer as any)?.email : undefined;

  // Check if already fulfilled
  const user = await storage.getUser(clerkUserId);
  if (user?.stripeSubscriptionId === subscriptionId) {
    logger.info({ clerkUserId, subscriptionId }, 'Checkout already fulfilled');
    return { plan: tier, trialActive, alreadyFulfilled: true };
  }

  await storage.upsertUserFromStripe(
    clerkUserId,
    customerEmail,
    customerId,
    subscriptionId,
    status,
    tier,
    trialActive ? true : undefined,
  );

  // Mark trial as used so they can't claim another one
  if (trialActive) {
    await storage.markTrialUsed(clerkUserId);
  }

  logger.info({ clerkUserId, subscriptionId, tier, trialActive }, 'Checkout fulfilled');
  return { plan: tier, trialActive, alreadyFulfilled: false };
}
