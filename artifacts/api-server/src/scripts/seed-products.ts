/**
 * Creates/updates Stripe products and prices for SharpTracker plans.
 * Run once: pnpm --filter @workspace/api-server run seed:stripe
 *
 * Products are identified by metadata.plan = 'silver' | 'gold' | 'platinum'.
 * Running multiple times is safe — existing products are updated in-place.
 */

import { getUncachableStripeClient } from '../stripeClient.js';

const PLANS = [
  {
    plan: 'silver',
    name: 'SharpTracker Silver',
    description: 'Essential dropping odds alerts for sharp bettors.',
    unitAmount: 3499, // €34.99
    currency: 'eur',
  },
  {
    plan: 'gold',
    name: 'SharpTracker Gold',
    description: 'Full odds coverage with Bet Tracker and EV analytics.',
    unitAmount: 8499, // €84.99
    currency: 'eur',
  },
  {
    plan: 'platinum',
    name: 'SharpTracker Platinum',
    description: 'Complete suite with push notifications and CLV tracking.',
    unitAmount: 11499, // €114.99
    currency: 'eur',
  },
] as const;

async function seed() {
  const stripe = await getUncachableStripeClient();

  for (const plan of PLANS) {
    // Find existing product with matching metadata
    let existingProductId: string | null = null;
    const products = await stripe.products.search({
      query: `metadata['plan']:'${plan.plan}'`,
      limit: 1,
    });

    if (products.data.length > 0) {
      existingProductId = products.data[0].id;
      // Update existing product
      await stripe.products.update(existingProductId, {
        name: plan.name,
        description: plan.description,
        active: true,
        metadata: { plan: plan.plan },
      });
      console.log(`✓ Updated product: ${plan.name} (${existingProductId})`);
    } else {
      // Create new product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { plan: plan.plan },
      });
      existingProductId = product.id;
      console.log(`✓ Created product: ${plan.name} (${existingProductId})`);
    }

    // Check if a matching active recurring price exists
    const prices = await stripe.prices.list({
      product: existingProductId,
      active: true,
      type: 'recurring',
      limit: 10,
    });

    const matchingPrice = prices.data.find(
      (p) => p.unit_amount === plan.unitAmount && p.currency === plan.currency,
    );

    if (matchingPrice) {
      console.log(`  ↳ Price already exists: ${matchingPrice.id} (${plan.unitAmount / 100} ${plan.currency.toUpperCase()}/month)`);
    } else {
      // Archive old prices first
      for (const oldPrice of prices.data) {
        await stripe.prices.update(oldPrice.id, { active: false });
        console.log(`  ↳ Archived old price: ${oldPrice.id}`);
      }

      // Create new price
      const price = await stripe.prices.create({
        product: existingProductId,
        unit_amount: plan.unitAmount,
        currency: plan.currency,
        recurring: { interval: 'month' },
      });
      console.log(`  ↳ Created price: ${price.id} (${plan.unitAmount / 100} ${plan.currency.toUpperCase()}/month)`);
    }
  }

  console.log('\n✅ Stripe products seeded successfully.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
