import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const betsTable = pgTable("bets", {
  id: serial("id").primaryKey(),
  matchName: text("match_name").notNull(),
  selection: text("selection").notNull(),
  sport: text("sport").notNull().default(""),
  league: text("league").notNull().default(""),
  oddsValue: real("odds_value").notNull(),
  stake: real("stake").notNull(),
  result: text("result").notNull().default("pending"),
  closingOdds: real("closing_odds"),
  notes: text("notes"),
  betDate: timestamp("bet_date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBetSchema = createInsertSchema(betsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const selectBetSchema = createSelectSchema(betsTable);

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof betsTable.$inferSelect;
