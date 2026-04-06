// This file is updated by the Stripe integration after connecting.
// Until then, it reads STRIPE_SECRET_KEY from the environment.
import Stripe from 'stripe';

let _stripeCache: Stripe | null = null;

export async function getUncachableStripeClient(): Promise<Stripe> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'Stripe is not configured. Connect the Stripe integration or set STRIPE_SECRET_KEY.'
    );
  }
  return new Stripe(secretKey, { apiVersion: '2025-04-30' as any });
}

export async function getStripeSync() {
  const { StripeSync } = await import('stripe-replit-sync');
  const stripe = await getUncachableStripeClient();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL not set');
  return new StripeSync({ stripe, databaseUrl });
}
