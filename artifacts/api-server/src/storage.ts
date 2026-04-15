import { usersTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export class Storage {
  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY pr.unit_amount ASC
      `
    );
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async getSubscriptionPlanTier(subscriptionId: string): Promise<'silver' | 'gold' | 'platinum' | null> {
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

  async getUser(id: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    return user;
  }

  async createUser(id: string, email?: string) {
    const [user] = await db.insert(usersTable).values({ id, email }).onConflictDoNothing().returning();
    return user;
  }

  async getUserByStripeCustomerId(customerId: string) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.stripeCustomerId, customerId));
    return user;
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string }) {
    const [user] = await db.update(usersTable).set(info).where(eq(usersTable.id, userId)).returning();
    return user;
  }
}

export const storage = new Storage();
