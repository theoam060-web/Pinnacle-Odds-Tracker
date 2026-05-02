import { usersTable, cardFingerprintsTable, pushSubscriptionsTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';
import { db } from '@workspace/db';
import type webpush from 'web-push';

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

  /**
   * Checks whether a card fingerprint has already been used for a trial.
   * If it hasn't, records it and returns true (trial OK).
   * If it has, returns false (trial should be blocked).
   */
  async checkAndRecordCardFingerprint(
    fingerprint: string,
    clerkUserId: string,
    stripeCustomerId: string,
  ): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(cardFingerprintsTable)
      .where(eq(cardFingerprintsTable.fingerprint, fingerprint));

    if (existing) {
      return false;
    }

    await db
      .insert(cardFingerprintsTable)
      .values({ fingerprint, clerkUserId, stripeCustomerId })
      .onConflictDoNothing();

    return true;
  }

  async getUserNotificationsEnabled(userId: string): Promise<boolean> {
    const [user] = await db.select({ notificationsEnabled: usersTable.notificationsEnabled })
      .from(usersTable).where(eq(usersTable.id, userId));
    return user?.notificationsEnabled ?? true;
  }

  async setUserNotificationsEnabled(userId: string, enabled: boolean): Promise<void> {
    await db.update(usersTable).set({ notificationsEnabled: enabled }).where(eq(usersTable.id, userId));
  }

  async savePushSubscription(userId: string, sub: webpush.PushSubscription): Promise<void> {
    await db.insert(pushSubscriptionsTable).values({
      id: crypto.randomUUID(),
      userId,
      endpoint: sub.endpoint,
      subscription: sub as any,
    }).onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: { subscription: sub as any, userId },
    });
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.endpoint, endpoint));
  }

  async deleteAllPushSubscriptionsForUser(userId: string): Promise<void> {
    await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, userId));
  }

  async getPushSubscriptionsForUser(userId: string): Promise<webpush.PushSubscription[]> {
    const rows = await db.select({ subscription: pushSubscriptionsTable.subscription })
      .from(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.userId, userId));
    return rows.map(r => r.subscription as unknown as webpush.PushSubscription);
  }

  async getAllPushSubscriptions(): Promise<{ userId: string; sub: webpush.PushSubscription }[]> {
    const rows = await db.select({ userId: pushSubscriptionsTable.userId, subscription: pushSubscriptionsTable.subscription })
      .from(pushSubscriptionsTable);
    return rows.map(r => ({ userId: r.userId, sub: r.subscription as unknown as webpush.PushSubscription }));
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

      // 1) Search by plan metadata (preferred — most explicit)
      let productId: string | null = null;
      try {
        const byMeta = await stripe.products.search({
          query: `metadata['plan']:'${plan}' AND active:'true'`,
          limit: 1,
        });
        if (byMeta.data.length > 0) productId = byMeta.data[0].id;
      } catch { /* search API may not be available in all Stripe modes */ }

      // 2) Fallback: match product name case-insensitively (SharpTracker Silver → silver)
      if (!productId) {
        const all = await stripe.products.list({ active: true, limit: 100 });
        const match = all.data.find(p => p.name.toLowerCase().includes(plan.toLowerCase()));
        if (match) productId = match.id;
      }

      if (!productId) return null;

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
