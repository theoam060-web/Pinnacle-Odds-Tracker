/**
 * Seed Stripe products and prices for SharpTracker plans.
 * Run once after connecting Stripe integration:
 *   pnpm --filter @workspace/scripts run seed-products
 *
 * Products:
 *   Silver — €34.99/mo  (moneyline + spread + total, 3 sports)
 *   Gold   — €84.99/mo  (all sports, all markets, player props, EV tracking)
 */

import Stripe from 'stripe';

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not set');

  const stripe = new Stripe(secretKey, { apiVersion: '2025-04-30' as any });

  // --- Silver ---
  const silver = await stripe.products.create({
    name: 'SharpTracker Silver',
    description: 'Dropping odds alerts, Bet Tracker, Bet Size Calculator — 3 sports, 3 markets each.',
    metadata: { plan: 'silver', tier: '1' },
  });
  const silverPrice = await stripe.prices.create({
    product: silver.id,
    currency: 'eur',
    unit_amount: 3499,
    recurring: { interval: 'month' },
  });
  console.log(`Silver created: product=${silver.id} price=${silverPrice.id}`);

  // --- Gold ---
  const gold = await stripe.products.create({
    name: 'SharpTracker Gold',
    description: 'Everything in Silver + all sports, all markets, player props, Pinnacle + 1 sharp book, live EV.',
    metadata: { plan: 'gold', tier: '2' },
  });
  const goldPrice = await stripe.prices.create({
    product: gold.id,
    currency: 'eur',
    unit_amount: 8499,
    recurring: { interval: 'month' },
  });
  console.log(`Gold created: product=${gold.id} price=${goldPrice.id}`);

  console.log('\nAdd these price IDs to PricingPage.tsx:');
  console.log(`  SILVER_PRICE_ID = "${silverPrice.id}"`);
  console.log(`  GOLD_PRICE_ID   = "${goldPrice.id}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
