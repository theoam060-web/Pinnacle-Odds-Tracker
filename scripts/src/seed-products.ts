/**
 * Seed Stripe products and prices for SharpTracker plans.
 * Run once after connecting Stripe integration:
 *   pnpm --filter @workspace/scripts tsx src/seed-products.ts
 */

import Stripe from 'stripe';

async function getStripeSecretKey(): Promise<string> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (hostname && xReplitToken) {
    const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
    const env = isProduction ? 'production' : 'development';
    const url = new URL(`https://${hostname}/api/v2/connection`);
    url.searchParams.set('include_secrets', 'true');
    url.searchParams.set('connector_names', 'stripe');
    url.searchParams.set('environment', env);
    const r = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'X-Replit-Token': xReplitToken },
    });
    const d = await r.json();
    const key = d.items?.[0]?.settings?.secret;
    if (key) return key;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set and Replit connector unavailable');
  return key;
}

async function main() {
  const secretKey = await getStripeSecretKey();
  const stripe = new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' as any });

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
  console.log(`✅ Silver: product=${silver.id}  price=${silverPrice.id}`);

  // --- Gold ---
  const gold = await stripe.products.create({
    name: 'SharpTracker Gold',
    description: 'Everything in Silver + all sports, all markets, player props, live EV & closing EV.',
    metadata: { plan: 'gold', tier: '2' },
  });
  const goldPrice = await stripe.prices.create({
    product: gold.id,
    currency: 'eur',
    unit_amount: 8499,
    recurring: { interval: 'month' },
  });
  console.log(`✅ Gold:   product=${gold.id}  price=${goldPrice.id}`);

  console.log('\nProducts seeded. The Stripe integration will sync them to the DB automatically.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
