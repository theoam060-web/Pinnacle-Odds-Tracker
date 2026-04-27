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
    // Validate Clerk userId format before trusting client_reference_id —
    // Clerk IDs look like "user_<base32>". This stops random/spoofed values
    // from polluting our users table via the safety-net createUser below.
    const looksLikeClerkId = /^user_[A-Za-z0-9]{8,}$/.test(clientReferenceId);
    if (!looksLikeClerkId) {
      logger.warn(
        { sessionId, customerId, clientReferenceId },
        'client_reference_id does not match Clerk userId format — ignoring',
      );
      return { alreadyFulfilled: false };
    }

    user = await storage.getUser(clientReferenceId);

    // Safety net: the frontend is supposed to upsert the user via POST /api/user
    // before redirecting to the Payment Link, but if that call failed (network
    // error, transient DB issue) the user row may not exist. Auto-provision
    // from the session email so fulfillment can still complete. createUser
    // uses ON CONFLICT DO NOTHING so this is race-safe.
    if (!user) {
      const sessionEmail = session.customer_details?.email ?? undefined;
      await storage.createUser(clientReferenceId, sessionEmail);
      user = await storage.getUser(clientReferenceId);
      if (user) {
        logger.info(
          { sessionId, customerId, userId: user.id, hadEmail: Boolean(sessionEmail) },
          'Safety-net auto-created user during fulfillment',
        );
      }
    }

    if (user) {
      // Persist the session's customer onto the user so future subscription
      // lifecycle webhooks (cancel, past_due, etc.) can resolve.
      //
      // Payment Links create a fresh Stripe customer for every checkout, so
      // a returning user (e.g. cancelled then re-subscribed) will always have
      // a different stripeCustomerId than what's on their row — we replace it
      // unconditionally and log the replacement for audit.
      //
      // SECURITY note: client_reference_id is URL-supplied and user-controlled,
      // so in theory a malicious payer could attach their own payment to a
      // different user's account. The realistic risk is low (Clerk userIds are
      // unguessable random strings) and the worst outcome is a paid subscription
      // being granted to the wrong account, which is loud and easily reversed
      // via the audit log below.
      if (user.stripeCustomerId && user.stripeCustomerId !== customerId) {
        logger.warn(
          {
            sessionId,
            newCustomerId: customerId,
            previousCustomerId: user.stripeCustomerId,
            userId: user.id,
            clientReferenceId,
          },
          'Replacing user.stripeCustomerId with new Payment Link customer (audit)',
        );
      }
      if (user.stripeCustomerId !== customerId) {
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
        // Refresh local copy so downstream logic sees the updated customerId.
        user = { ...user, stripeCustomerId: customerId };
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
