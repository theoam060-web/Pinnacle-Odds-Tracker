import { pgTable, text, serial, timestamp, real, jsonb, integer, boolean, index, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ---------------------------------------------------------------------------
// Legacy event-level tables (kept for backward compat with existing routes)
// ---------------------------------------------------------------------------

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
  newDropAt: timestamp("new_drop_at", { withTimezone: true }),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const oddsMovementsTable = pgTable("odds_movements", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => oddsEventsTable.id),
  selection: text("selection").notNull(),
  odds: real("odds").notNull(),
  limit: real("limit"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Full-market tables
// ---------------------------------------------------------------------------

export const pinnacleMatchupsTable = pgTable("pinnacle_matchups", {
  id: integer("id").primaryKey(),
  parentId: integer("parent_id"),
  type: text("type").notNull().default("matchup"),
  sportId: integer("sport_id").notNull(),
  sport: text("sport").notNull(),
  leagueId: integer("league_id").notNull(),
  league: text("league").notNull(),
  leagueName: text("league_name").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  isLive: boolean("is_live").notNull().default(false),
  isHighlighted: boolean("is_highlighted").notNull().default(false),
  status: text("status").notNull().default("unknown"),
  participants: jsonb("participants").notNull().default([]),
  periods: jsonb("periods").notNull().default([]),
  totalMarketCount: integer("total_market_count").notNull().default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_matchups_sport").on(table.sportId),
  index("idx_matchups_league").on(table.leagueId),
  index("idx_matchups_start_time").on(table.startTime),
  index("idx_matchups_is_live").on(table.isLive),
]);

export const pinnacleMarketsTable = pgTable("pinnacle_markets", {
  id: text("id").primaryKey(),
  matchupId: integer("matchup_id").notNull().references(() => pinnacleMatchupsTable.id),
  marketKey: text("market_key").notNull(),
  sportId: integer("sport_id").notNull(),
  sport: text("sport").notNull(),
  leagueId: integer("league_id").notNull(),
  league: text("league").notNull(),
  leagueName: text("league_name").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  isLive: boolean("is_live").notNull().default(false),
  type: text("type").notNull(),
  period: integer("period").notNull().default(0),
  isAlternate: boolean("is_alternate").notNull().default(false),
  status: text("status").notNull().default("unknown"),
  cutoffAt: text("cutoff_at"),
  version: doublePrecision("version"),
  side: text("side"),
  prices: jsonb("prices").notNull(),
  maxRiskStake: real("max_risk_stake"),
  biggestDrop: real("biggest_drop").notNull().default(0),
  biggestRise: real("biggest_rise").notNull().default(0),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_markets_matchup").on(table.matchupId),
  index("idx_markets_sport").on(table.sportId),
  index("idx_markets_type").on(table.type),
  index("idx_markets_period").on(table.period),
  index("idx_markets_status").on(table.status),
  index("idx_markets_league").on(table.leagueId),
]);

export const pinnacleMarketMovementsTable = pgTable("pinnacle_market_movements", {
  id: serial("id").primaryKey(),
  marketId: text("market_id").notNull().references(() => pinnacleMarketsTable.id),
  designation: text("designation").notNull(),
  points: real("points"),
  americanPrice: integer("american_price").notNull(),
  decimalPrice: real("decimal_price").notNull(),
  maxRiskStake: real("max_risk_stake"),
  version: doublePrecision("version"),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_market_movements_market").on(table.marketId),
  index("idx_market_movements_recorded").on(table.recordedAt),
]);

// ---------------------------------------------------------------------------
// Zod schemas & types
// ---------------------------------------------------------------------------

export const insertOddsEventSchema = createInsertSchema(oddsEventsTable).omit({ createdAt: true });
export type InsertOddsEvent = z.infer<typeof insertOddsEventSchema>;
export type OddsEvent = typeof oddsEventsTable.$inferSelect;

export const insertOddsMovementSchema = createInsertSchema(oddsMovementsTable).omit({ id: true });
export type InsertOddsMovement = z.infer<typeof insertOddsMovementSchema>;
export type OddsMovement = typeof oddsMovementsTable.$inferSelect;

export type PinnacleMatchupRow = typeof pinnacleMatchupsTable.$inferSelect;
export type PinnacleMarketRow = typeof pinnacleMarketsTable.$inferSelect;
export type PinnacleMarketMovementRow = typeof pinnacleMarketMovementsTable.$inferSelect;
