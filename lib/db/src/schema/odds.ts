import { pgTable, text, serial, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const oddsEventsTable = pgTable("odds_events", {
  id: text("id").primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  sport: text("sport").notNull(),
  league: text("league").notNull(),
  leagueName: text("league_name").notNull(),
  commenceTime: timestamp("commence_time", { withTimezone: true }).notNull(),
  marketType: text("market_type").notNull(),
  lines: jsonb("lines").notNull(),
  biggestDrop: real("biggest_drop").notNull().default(0),
  biggestRise: real("biggest_rise").notNull().default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const oddsMovementsTable = pgTable("odds_movements", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => oddsEventsTable.id),
  selection: text("selection").notNull(),
  odds: real("odds").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOddsEventSchema = createInsertSchema(oddsEventsTable).omit({ createdAt: true });
export type InsertOddsEvent = z.infer<typeof insertOddsEventSchema>;
export type OddsEvent = typeof oddsEventsTable.$inferSelect;

export const insertOddsMovementSchema = createInsertSchema(oddsMovementsTable).omit({ id: true });
export type InsertOddsMovement = z.infer<typeof insertOddsMovementSchema>;
export type OddsMovement = typeof oddsMovementsTable.$inferSelect;
