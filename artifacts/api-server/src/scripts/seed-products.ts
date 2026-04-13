/**
 * Idempotent seed for SharpTracker Stripe products.
 * Run with:
 *   pnpm --filter @workspace/api-server seed:stripe
 *
 * Steps:
 *  1. Calls runMigrations() to ensure the stripe.* DB schema exists.
 *  2. Calls getStripeSync() to get the StripeSync singleton.
 *  3. Creates Silver / Gold products + prices only if absent (idempotent).
 *  4. Calls syncProducts() to pull all Stripe products into the DB.
 *  5. Queries stripe.products / stripe.prices to verify the result.
 *  6. Fetches /api/stripe/products to confirm the API response.
 */

import { getStripeSync, getUncachableStripeClient } from '../stripeClient.js';
import { runMigrations } from 'stripe-replit-sync';

const PLANS = [
  {
    metaKey: 'silver',
    name: 'SharpTracker Silver',
    description: 'Dropping odds alerts, Bet Tracker, Bet Size Calculator — 3 sports, 3 markets each.',
    metadata: { plan: 'silver', tier: '1' },
    unit_amount: 3499, // €34.99/month
    currency: 'eur',
  },
  {
    metaKey: 'gold',
    name: 'SharpTracker Gold',
    description: 'Everything in Silver + all sports, all markets, player props, live EV & closing EV.',
    metadata: { plan: 'gold', tier: '2' },
    unit_amount: 8499, // €84.99/month
    currency: 'eur',
  },
] as const;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');

  // 1. Run migrations to ensure the stripe.* DB schema exists
  console.log('Running stripe-replit-sync migrations…');
  await runMigrations({ databaseUrl });
  console.log('Migrations complete.\n');

  // 2. Get the StripeSync singleton (also inits the pool)
  console.log('Initialising StripeSync…');
  const sync = await getStripeSync();
  console.log('StripeSync ready.\n');

  const stripe = await getUncachableStripeClient();

  for (const plan of PLANS) {
    // 3. Idempotency — search by metadata.plan to avoid duplicates
    const existing = await stripe.products.search({
      query: `metadata['plan']:'${plan.metaKey}' AND active:'true'`,
      limit: 1,
    });

    let productId: string;
    let priceId: string;

    if (existing.data.length > 0) {
      const prod = existing.data[0];
      productId = prod.id;
      console.log(`⏭  ${plan.name} already exists — product=${productId}`);

      const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
      const matchPrice = prices.data.find(
        p => p.currency === plan.currency && p.recurring?.interval === 'month'
      );
      if (matchPrice) {
        priceId = matchPrice.id;
        console.log(`   price=${priceId} (existing)\n`);
      } else {
        const newPrice = await stripe.prices.create({
          product: productId,
          currency: plan.currency,
          unit_amount: plan.unit_amount,
          recurring: { interval: 'month' },
        });
        priceId = newPrice.id;
        console.log(`   price=${priceId} (created)\n`);
      }
    } else {
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { ...plan.metadata },
      });
      productId = product.id;

      const price = await stripe.prices.create({
        product: productId,
        currency: plan.currency,
        unit_amount: plan.unit_amount,
        recurring: { interval: 'month' },
      });
      priceId = price.id;

      console.log(`✅ Created ${plan.name}`);
      console.log(`   product=${productId}  price=${priceId}\n`);
    }
  }

  // 4. Sync Stripe → DB: products + prices
  console.log('Syncing products from Stripe into DB…');
  await sync.syncProducts();
  console.log('Products synced.');

  // Backfill prices for all active SharpTracker products
  const accounts = await sync.postgresClient.getAllAccounts();
  if (accounts.length > 0) {
    const accountId = accounts[0].id as string;
    const priceIds: string[] = [];
    for (const plan of PLANS) {
      const prices = await stripe.prices.list({ active: true, limit: 10 });
      for (const price of prices.data) {
        const prod = await stripe.products.retrieve(price.product as string).catch(() => null);
        if (prod && (prod as any).metadata?.plan === plan.metaKey) {
          priceIds.push(price.id);
        }
      }
    }
    if (priceIds.length > 0) {
      console.log(`Backfilling ${priceIds.length} price(s): ${priceIds.join(', ')}`);
      await sync.backfillPrices(priceIds, accountId);
      console.log('Prices synced.');
    }
  }
  console.log('Sync complete.\n');

  // 5. Verify via DB query
  console.log('DB verification (stripe schema):\n');
  const { rows } = await sync.postgresClient.query(`
    SELECT
      p.id         AS product_id,
      p.name       AS product_name,
      pr.id        AS price_id,
      pr.unit_amount,
      pr.currency
    FROM stripe.products p
    JOIN stripe.prices pr ON pr.product = p.id
    WHERE p.active = true
      AND pr.active = true
      AND pr.type = 'recurring'
    ORDER BY pr.unit_amount ASC
  `);

  if (rows.length === 0) {
    console.log('ℹ  No rows found after sync — check Stripe connection.');
  } else {
    for (const row of rows as any[]) {
      const euros = (row.unit_amount / 100).toFixed(2);
      console.log(`  ${row.product_name}`);
      console.log(`    product_id = ${row.product_id}`);
      console.log(`    price_id   = ${row.price_id}`);
      console.log(`    amount     = €${euros}/${row.currency.toUpperCase()}/month`);
      console.log();
    }
  }

  // 6. Check /api/stripe/products endpoint
  const port = process.env.PORT ?? 8080;
  console.log(`/api/stripe/products (http://localhost:${port}):`);
  try {
    const res = await fetch(`http://localhost:${port}/api/stripe/products`);
    const json = await res.json() as { data: any[] };
    if (json.data?.length) {
      for (const p of json.data) {
        console.log(`  ${p.name} — ${p.prices?.length ?? 0} price(s), plan=${p.metadata?.plan}`);
      }
    } else {
      console.log('  (no products returned — webhook sync still pending)');
    }
  } catch {
    console.log('  (API not reachable from script context)');
  }

  console.log('\nSeed complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
