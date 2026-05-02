import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const cardFingerprintsTable = pgTable("card_fingerprints", {
  fingerprint: text("fingerprint").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
