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

  // Check if already fulfilled
  const user = await storage.getUser(clerkUserId);
  if (user?.stripeSubscriptionId === subscriptionId) {
    logger.info({ clerkUserId, subscriptionId }, 'Checkout already fulfilled');
    const sub = await stripeService.retrieveSubscription(subscriptionId);
    const tier = getPlanTierFromSub(sub);
    // Update the tier in DB if the webhook saved it without one
    if (tier && !user.subscriptionPlan) {
      await storage.updateUserStripeInfo(clerkUserId, { subscriptionPlan: tier });
      logger.info({ clerkUserId, tier }, 'Backfilled missing plan tier on already-fulfilled checkout');
    }
    return { plan: tier, trialActive: sub.status === 'trialing', alreadyFulfilled: true };
  }

  // Retrieve subscription to get plan tier and real status
  let sub = await stripeService.retrieveSubscription(subscriptionId);
  const tier = getPlanTierFromSub(sub);
  let trialActive = sub.status === 'trialing';
  let status = sub.status === 'active' || sub.status === 'trialing' ? sub.status : (sub.status ?? 'active');

  const customerEmail =
    typeof session.customer === 'object' ? (session.customer as any)?.email : undefined;

  // --- Card fingerprint check (prevents trial abuse across new accounts) ---
  if (trialActive) {
    const fingerprint = await stripeService.getSubscriptionPaymentFingerprint(subscriptionId);
    if (fingerprint) {
      const fingerprintOk = await storage.checkAndRecordCardFingerprint(
        fingerprint,
        clerkUserId,
        customerId,
      );
      if (!fingerprintOk) {
        // This card has already been used for a trial on another account — strip the trial
        logger.warn(
          { clerkUserId, subscriptionId, fingerprint },
          'Card fingerprint already used for a trial — ending trial immediately',
        );
        try {
          await stripeService.endTrialNow(subscriptionId);
          // Re-fetch so we get the updated status ('active' after trial ends)
          sub = await stripeService.retrieveSubscription(subscriptionId);
          status = sub.status;
          trialActive = false;
        } catch (err) {
          logger.error({ err, subscriptionId }, 'Failed to end trial for duplicate card');
        }
      }
    } else {
      // Could not retrieve fingerprint — log but do not block (fail open to avoid false positives)
      logger.warn({ clerkUserId, subscriptionId }, 'Could not retrieve card fingerprint for trial check');
    }
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

  // Mark trial as used so they can't claim another one via the same account
  if (trialActive) {
    await storage.markTrialUsed(clerkUserId);
  }

  logger.info({ clerkUserId, subscriptionId, tier, trialActive }, 'Checkout fulfilled');
  return { plan: tier, trialActive, alreadyFulfilled: false };
}
