/**
 * Idempotent seed for SharpTracker Stripe products.
 * Run with:
 *   pnpm --filter @workspace/api-server seed:stripe
 *
 * Steps:
 *  1. Calls runMigrations() to ensure the stripe.* DB schema exists.
 *  2. Calls getStripeSync() to get the StripeSync singleton.
 *  3. Creates Silver / Gold products + prices only if absent (idempotent).
 *  4. Calls syncProducts() then backfillPrices() to populate the DB.
 *  5. Queries stripe.products / stripe.prices to verify DB rows.
 *  6. Fetches /api/stripe/products to confirm the API response.
 */

import { getStripeSync, getUncachableStripeClient } from '../stripeClient.js';
import { runMigrations } from 'stripe-replit-sync';

interface PlanDefinition {
  readonly metaKey: string;
  readonly name: string;
  readonly description: string;
  readonly metadata: Record<string, string>;
  readonly unit_amount: number;
  readonly currency: string;
}

interface DbProductRow {
  product_id: string;
  product_name: string;
  price_id: string;
  unit_amount: number;
  currency: string;
}

interface ApiProduct {
  name: string;
  metadata: Record<string, string>;
  prices: { id: string; unit_amount: number }[];
}

interface ApiProductsResponse {
  data: ApiProduct[];
}

const PLANS: PlanDefinition[] = [
  {
    metaKey: 'silver',
    name: 'SharpTracker Silver',
    description: 'Dropping odds alerts, Bet Size Calculator — 3 alert configs, 3 sports, 3 markets each. Only members Telegram group.',
    metadata: { plan: 'silver', tier: '1' },
    unit_amount: 3499, // €34.99/month
    currency: 'eur',
  },
  {
    metaKey: 'gold',
    name: 'SharpTracker Gold',
    description: 'Everything in Silver + 9 alert configs, all sports, all markets, Bet Tracker & Bet Stats, live EV & closing EV.',
    metadata: { plan: 'gold', tier: '2' },
    unit_amount: 8499, // €84.99/month
    currency: 'eur',
  },
  {
    metaKey: 'platinum',
    name: 'SharpTracker Platinum',
    description: 'Everything in Gold + 20 alert configs, bookmaker comparison, push notifications, Current CLV & Current CV.',
    metadata: { plan: 'platinum', tier: '3' },
    unit_amount: 11499, // €114.99/month
    currency: 'eur',
  },
];

type StripeClient = Awaited<ReturnType<typeof getUncachableStripeClient>>;

async function ensureProduct(
  stripe: StripeClient,
  plan: PlanDefinition,
): Promise<{ productId: string; priceId: string }> {
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
      (p) =>
        p.currency === plan.currency &&
        p.recurring?.interval === 'month' &&
        p.unit_amount === plan.unit_amount,
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

  return { productId, priceId };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');

  // 1. Run migrations — creates stripe.* schema if absent
  console.log('Running stripe-replit-sync migrations…');
  await runMigrations({ databaseUrl });
  console.log('Migrations complete.\n');

  // 2. Initialise StripeSync singleton
  console.log('Initialising StripeSync…');
  const sync = await getStripeSync();
  console.log('StripeSync ready.\n');

  const stripe = await getUncachableStripeClient();

  // 3. Idempotently ensure Silver and Gold products + prices exist in Stripe
  const priceIds: string[] = [];
  for (const plan of PLANS) {
    const { priceId } = await ensureProduct(stripe, plan);
    priceIds.push(priceId);
  }

  // 4. Sync products and backfill prices into the DB
  console.log('Syncing products from Stripe into DB…');
  await sync.syncProducts();
  console.log('Products synced.');

  const accounts = await sync.postgresClient.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error(
      'No StripeSync accounts found — backfillPrices cannot run. ' +
      'Ensure the Stripe integration is fully configured and a connected account exists.',
    );
  }
  const accountId = String(accounts[0].id);
  console.log(`Backfilling ${priceIds.length} price(s): ${priceIds.join(', ')}`);
  await sync.backfillPrices(priceIds, accountId);
  console.log('Prices synced.');
  console.log('Sync complete.\n');

  // 5. DB verification
  console.log('DB verification (stripe schema):\n');
  const result = await sync.postgresClient.query(`
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

  const rows = result.rows as DbProductRow[];
  if (rows.length === 0) {
    console.log('ℹ  No rows found after sync — check Stripe connection.');
  } else {
    for (const row of rows) {
      const euros = (row.unit_amount / 100).toFixed(2);
      console.log(`  ${row.product_name}`);
      console.log(`    product_id = ${row.product_id}`);
      console.log(`    price_id   = ${row.price_id}`);
      console.log(`    amount     = €${euros}/${row.currency.toUpperCase()}/month`);
      console.log();
    }
  }

  // 6. API spot-check
  const port = process.env.PORT ?? 8080;
  console.log(`/api/stripe/products (http://localhost:${port}):`);
  try {
    const res = await fetch(`http://localhost:${port}/api/stripe/products`);
    const json = (await res.json()) as ApiProductsResponse;
    if (json.data?.length) {
      for (const p of json.data) {
        console.log(`  ${p.name} — ${p.prices?.length ?? 0} price(s), plan=${p.metadata?.plan}`);
      }
    } else {
      console.log('  (no products returned — webhook sync may still be pending)');
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
