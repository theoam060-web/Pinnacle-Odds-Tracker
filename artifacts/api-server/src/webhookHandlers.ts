import { getStripeSync, getStripeSecretKey } from './stripeClient.js';
import { storage } from './storage.js';
import { getPlanTierFromSub } from './stripeService.js';
import { logger } from './lib/logger.js';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(body: Buffer, sig: string) {
    let webhookSecret = '';
    try {
      const sync = await getStripeSync();
      webhookSecret = sync.webhookSecret ?? '';
    } catch {
      webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    }

    const secretKey = await getStripeSecretKey();
    const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });

    let event: Stripe.Event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err: any) {
        throw new Error(`Webhook signature verification failed: ${err.message}`);
      }
    } else {
      event = JSON.parse(body.toString()) as Stripe.Event;
    }

    logger.info({ type: event.type }, 'Stripe webhook received');

    // Forward to stripe-replit-sync for DB mirror
    try {
      const sync = await getStripeSync();
      await sync.handleWebhookEvent(event);
    } catch (err) {
      logger.warn({ err }, 'stripe-replit-sync handleWebhookEvent failed — continuing');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await WebhookHandlers.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await WebhookHandlers.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await WebhookHandlers.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await WebhookHandlers.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        break;
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const clerkUserId = session.client_reference_id;
    const customerId =
      typeof session.customer === 'string' ? session.customer : (session.customer as any)?.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as any)?.id;

    if (!clerkUserId || !customerId || !subscriptionId) {
      logger.warn({ sessionId: session.id }, 'checkout.session.completed missing required fields');
      return;
    }

    // Fetch the subscription to get real status and plan tier
    const secretKey = await getStripeSecretKey();
    const stripe = new Stripe(secretKey, { apiVersion: '2025-08-27.basil' as any });
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const status = sub.status; // 'trialing' or 'active'
    const tier = getPlanTierFromSub(sub);
    const isTrialing = status === 'trialing';

    await storage.upsertUserFromStripe(
      clerkUserId,
      undefined,
      customerId,
      subscriptionId,
      status,
      tier,
      isTrialing ? true : undefined, // mark trial as used if trialing
    );

    logger.info({ clerkUserId, subscriptionId, status, tier }, 'Checkout fulfilled via webhook');
  }

  private static async handleSubscriptionUpdated(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : (sub.customer as any)?.id;
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    // Store the actual Stripe status value (trialing, active, past_due, canceled, etc.)
    const tier = getPlanTierFromSub(sub);

    await storage.updateUserStripeInfo(user.id, {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionPlan: tier,
    });
    logger.info({ userId: user.id, status: sub.status, tier }, 'Subscription updated via webhook');
  }

  private static async handleSubscriptionDeleted(sub: Stripe.Subscription) {
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : (sub.customer as any)?.id;
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateUserStripeInfo(user.id, {
      stripeSubscriptionId: null,
      subscriptionStatus: 'canceled',
      subscriptionPlan: null,
    });
    logger.info({ userId: user.id }, 'Subscription canceled via webhook');
  }

  private static async handleInvoicePaid(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as any)?.id;
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    // Only update to active if the current status isn't already active/trialing
    if (user.subscriptionStatus !== 'active') {
      await storage.updateUserStripeInfo(user.id, { subscriptionStatus: 'active' });
      logger.info({ userId: user.id }, 'Subscription set to active via invoice.paid');
    }
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId =
      typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as any)?.id;
    if (!customerId) return;

    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    await storage.updateUserStripeInfo(user.id, { subscriptionStatus: 'past_due' });
    logger.warn({ userId: user.id }, 'Payment failed — marked past_due');
  }
}
