import { usersTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export class Storage {
  async getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async createUser(id: string, email?: string) {
    const [user] = await db
      .insert(usersTable)
      .values({ id, email })
      .onConflictDoNothing()
      .returning();
    return user;
  }

  async getUserByEmail(email: string) {
    const result = await db.execute(sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`);
    return result.rows[0] || null;
  }

  async getUserByStripeCustomerId(customerId: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.stripeCustomerId, customerId));
    return user;
  }

  async getUserByStripeSubscriptionId(subscriptionId: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.stripeSubscriptionId, subscriptionId));
    return user;
  }

  async updateUserStripeInfo(
    userId: string,
    info: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string | null;
      subscriptionStatus?: string | null;
      subscriptionPlan?: string | null;
      trialUsed?: boolean;
    },
  ) {
    const [user] = await db
      .update(usersTable)
      .set(info)
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }

  async markTrialUsed(userId: string) {
    await db
      .update(usersTable)
      .set({ trialUsed: true })
      .where(eq(usersTable.id, userId));
  }

  async upsertUserFromStripe(
    userId: string,
    email: string | undefined,
    customerId: string,
    subscriptionId: string,
    subscriptionStatus: string,
    subscriptionPlan?: string | null,
    trialUsed?: boolean,
  ) {
    await db.insert(usersTable).values({ id: userId, email }).onConflictDoNothing();
    await db
      .update(usersTable)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus,
        ...(subscriptionPlan !== undefined ? { subscriptionPlan } : {}),
        ...(trialUsed !== undefined ? { trialUsed } : {}),
      })
      .where(eq(usersTable.id, userId));
  }

  async listPlans(): Promise<{ id: string; name: string; price: number; currency: string; interval: string; priceId: string }[]> {
    const result = await db.execute(sql`
      SELECT
        p.metadata->>'plan' AS id,
        p.name,
        pr.unit_amount AS price,
        pr.currency,
        pr.recurring->>'interval' AS interval,
        pr.id AS price_id
      FROM stripe.products p
      JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
        AND p.metadata->>'plan' IS NOT NULL
      ORDER BY pr.unit_amount ASC
    `);
    return result.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price),
      currency: r.currency,
      interval: r.interval ?? 'month',
      priceId: r.price_id,
    }));
  }

  async getPriceIdByPlan(plan: string): Promise<string | null> {
    try {
      const result = await db.execute(sql`
        SELECT pr.id AS price_id
        FROM stripe.products p
        JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = true
          AND p.metadata->>'plan' = ${plan}
        ORDER BY pr.unit_amount ASC
        LIMIT 1
      `);
      return (result.rows[0] as any)?.price_id ?? null;
    } catch {
      return null;
    }
  }

  async getPriceIdByPlanFromStripe(plan: string): Promise<string | null> {
    try {
      const { getUncachableStripeClient } = await import('./stripeClient.js');
      const stripe = await getUncachableStripeClient();
      const products = await stripe.products.search({
        query: `metadata['plan']:'${plan}' AND active:'true'`,
        limit: 1,
      });
      if (products.data.length === 0) return null;
      const productId = products.data[0].id;
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
        type: 'recurring',
        limit: 1,
      });
      return prices.data[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  async getSubscriptionPlanTier(
    subscriptionId: string,
  ): Promise<'silver' | 'gold' | 'platinum' | null> {
    try {
      const result = await db.execute(sql`
        SELECT prod.metadata->>'plan' AS plan_tier
        FROM stripe.subscription_items si
        JOIN stripe.prices pr ON pr.id = si.price
        JOIN stripe.products prod ON prod.id = pr.product
        WHERE si.subscription = ${subscriptionId}
        LIMIT 1
      `);
      const tier = (result.rows[0] as any)?.plan_tier as string | undefined;
      if (tier === 'silver' || tier === 'gold' || tier === 'platinum') return tier;
      return null;
    } catch {
      return null;
    }
  }
}

export const storage = new Storage();
