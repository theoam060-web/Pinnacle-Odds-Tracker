import {
  db,
  oddsEventsTable,
  oddsMovementsTable,
  pinnacleMatchupsTable,
  pinnacleMarketsTable,
  pinnacleMarketMovementsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { fetchAllPinnacleData, fetchPinnacleOdds, parseMarketTypesFromEnv } from "./pinnacleClient";
import type { PollResult, NormalizedMarket, NormalizedMatchup } from "./pinnacleClient";
import { seedDatabase } from "./oddsGenerator";
import { startMockSimulator } from "./mockSimulator";
import {
  broadcastOddsDrop,
  broadcastOddsUpdate,
  broadcastMarketUpdate,
  type OddsDropEvent,
  type OddsEventUpdate,
  type MarketUpdate,
} from "./sseManager";
import { sendTelegramDrop } from "./telegramNotifier";

const FALLBACK_AFTER_EMPTY_POLLS = 3;

interface OddsLine {
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  changeAbsolute: number;
  direction: "drop" | "rise" | "stable";
}

interface StoredPrice {
  designation: string;
  points: number | null;
  americanPrice: number;
  decimalPrice: number;
  openingDecimalPrice: number;
  changePercent: number;
  direction: "drop" | "rise" | "stable";
}

interface PollerState {
  consecutiveEmpty: number;
  hasSeededFallback: boolean;
}

function calcChangePercent(opening: number, current: number): number {
  if (opening === 0) return 0;
  return parseFloat((((current - opening) / opening) * 100).toFixed(2));
}

function calcDirection(opening: number, current: number): "drop" | "rise" | "stable" {
  const diff = current - opening;
  if (Math.abs(diff) < 0.005) return "stable";
  return diff < 0 ? "drop" : "rise";
}

// ---------------------------------------------------------------------------
// Full-market persistence
// ---------------------------------------------------------------------------

async function persistMatchups(matchups: NormalizedMatchup[], now: Date): Promise<void> {
  for (const m of matchups) {
    const values = {
      id: m.id,
      parentId: m.parentId,
      type: m.type,
      sportId: m.sportId,
      sport: m.sport,
      leagueId: m.leagueId,
      league: m.league,
      leagueName: m.leagueName,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      startTime: m.startTime,
      isLive: m.isLive,
      isHighlighted: m.isHighlighted,
      status: m.status,
      participants: m.participants,
      periods: m.periods,
      totalMarketCount: m.totalMarketCount,
      lastUpdated: now,
    };

    await db
      .insert(pinnacleMatchupsTable)
      .values({ ...values, createdAt: now })
      .onConflictDoUpdate({
        target: pinnacleMatchupsTable.id,
        set: values,
      });
  }
}

async function persistMarkets(
  markets: NormalizedMarket[],
  now: Date,
): Promise<{ changed: number; drops: number }> {
  let changed = 0;
  let drops = 0;

  for (const market of markets) {
    const [existing] = await db
      .select()
      .from(pinnacleMarketsTable)
      .where(eq(pinnacleMarketsTable.id, market.id));

    const existingPrices = (existing?.prices ?? []) as StoredPrice[];

    const updatedPrices: StoredPrice[] = market.prices.map((p) => {
      const prev = existingPrices.find(
        (ep) => ep.designation === p.designation && ep.points === p.points,
      );
      const opening = prev?.openingDecimalPrice ?? p.decimalPrice;
      const current = p.decimalPrice;
      const changePercent = calcChangePercent(opening, current);
      const direction = calcDirection(opening, current);

      return {
        designation: p.designation,
        points: p.points,
        americanPrice: p.americanPrice,
        decimalPrice: current,
        openingDecimalPrice: opening,
        changePercent,
        direction,
      };
    });

    const dropValues = updatedPrices.filter((p) => p.direction === "drop").map((p) => p.changePercent);
    const riseValues = updatedPrices.filter((p) => p.direction === "rise").map((p) => p.changePercent);
    const biggestDrop = dropValues.length ? Math.min(...dropValues) : 0;
    const biggestRise = riseValues.length ? Math.max(...riseValues) : 0;

    const pricesChanged =
      !existing || JSON.stringify(existingPrices.map(p => p.decimalPrice).sort()) !==
        JSON.stringify(updatedPrices.map(p => p.decimalPrice).sort());

    const values = {
      matchupId: market.matchupId,
      marketKey: market.marketKey,
      sportId: market.sportId,
      sport: market.sport,
      leagueId: market.leagueId,
      league: market.league,
      leagueName: market.leagueName,
      homeTeam: market.homeTeam,
      awayTeam: market.awayTeam,
      startTime: market.startTime,
      isLive: market.isLive,
      type: market.type,
      period: market.period,
      isAlternate: market.isAlternate,
      status: market.status,
      cutoffAt: market.cutoffAt,
      version: market.version,
      side: market.side,
      prices: updatedPrices,
      maxRiskStake: market.maxRiskStake,
      biggestDrop,
      biggestRise,
      lastUpdated: now,
    };

    if (!existing) {
      await db
        .insert(pinnacleMarketsTable)
        .values({ id: market.id, ...values, createdAt: now })
        .onConflictDoNothing();
      changed++;
    } else if (pricesChanged || existing.status !== market.status || existing.version !== market.version) {
      await db
        .update(pinnacleMarketsTable)
        .set(values)
        .where(eq(pinnacleMarketsTable.id, market.id));
      changed++;
    }

    if (pricesChanged) {
      for (const price of updatedPrices) {
        await db.insert(pinnacleMarketMovementsTable).values({
          marketId: market.id,
          designation: price.designation,
          points: price.points,
          americanPrice: price.americanPrice,
          decimalPrice: price.decimalPrice,
          maxRiskStake: market.maxRiskStake,
          version: market.version,
          recordedAt: now,
        });
      }

      const update: MarketUpdate = {
        id: market.id,
        matchupId: market.matchupId,
        marketKey: market.marketKey,
        sport: market.sport,
        league: market.league,
        leagueName: market.leagueName,
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        type: market.type,
        period: market.period,
        isAlternate: market.isAlternate,
        status: market.status,
        prices: updatedPrices.map((p) => ({
          designation: p.designation,
          points: p.points,
          americanPrice: p.americanPrice,
          decimalPrice: p.decimalPrice,
        })),
        biggestDrop,
        biggestRise,
        lastUpdated: now.toISOString(),
      };
      broadcastMarketUpdate(update);
    }

    const prevBiggestDrop = existing?.biggestDrop ?? 0;
    if (biggestDrop < -2 && biggestDrop < prevBiggestDrop) {
      drops++;
      const droppedPrice = updatedPrices.filter((p) => p.direction === "drop").sort((a, b) => a.changePercent - b.changePercent)[0];
      if (droppedPrice) {
        const drop: OddsDropEvent = {
          eventId: market.id,
          homeTeam: market.homeTeam,
          awayTeam: market.awayTeam,
          sport: market.sport,
          league: market.league,
          leagueName: market.leagueName,
          selection: `${droppedPrice.designation}${droppedPrice.points !== null ? ` ${droppedPrice.points}` : ""}`,
          openingOdds: droppedPrice.openingDecimalPrice,
          currentOdds: droppedPrice.decimalPrice,
          changePercent: droppedPrice.changePercent,
          direction: "drop",
          detectedAt: now.toISOString(),
        };
        broadcastOddsDrop(drop);
        sendTelegramDrop(drop).catch((err) => logger.warn({ err }, "Telegram send failed"));
      }
    }
  }

  return { changed, drops };
}

// ---------------------------------------------------------------------------
// Legacy event-level persistence (for backward compat)
// ---------------------------------------------------------------------------

function getBiggestDrop(lines: OddsLine[]): number {
  const drops = lines.filter((l) => l.direction === "drop").map((l) => l.changePercent);
  return drops.length ? Math.min(...drops) : 0;
}

function getBiggestRise(lines: OddsLine[]): number {
  const rises = lines.filter((l) => l.direction === "rise").map((l) => l.changePercent);
  return rises.length ? Math.max(...rises) : 0;
}

async function persistLegacyEvents(
  events: Awaited<ReturnType<typeof fetchPinnacleOdds>>,
  now: Date,
  minDropPercent: number,
): Promise<void> {
  for (const shape of events) {
    const [existing] = await db
      .select()
      .from(oddsEventsTable)
      .where(eq(oddsEventsTable.id, shape.id));

    const updatedLines: OddsLine[] = shape.lines.map((newLine) => {
      if (!existing) return newLine;
      const existingLines = existing.lines as OddsLine[];
      const existingLine = existingLines.find((l) => l.selection === newLine.selection);
      if (!existingLine) return newLine;

      const openingOdds = existingLine.openingOdds;
      const currentOdds = newLine.currentOdds;
      const changeAbsolute = parseFloat((currentOdds - openingOdds).toFixed(3));
      const changePercent = calcChangePercent(openingOdds, currentOdds);
      const direction = calcDirection(openingOdds, currentOdds);
      return { selection: newLine.selection, openingOdds, currentOdds, changeAbsolute, changePercent, direction };
    });

    const biggestDrop = getBiggestDrop(updatedLines);
    const biggestRise = getBiggestRise(updatedLines);
    const prevBiggestDrop = existing?.biggestDrop ?? 0;
    const isNewDrop = biggestDrop < -minDropPercent && biggestDrop < prevBiggestDrop;
    const newDropAt = isNewDrop ? now : (existing?.newDropAt ?? null);

    const hasLineChanges =
      !existing ||
      JSON.stringify(existing.lines) !== JSON.stringify(updatedLines) ||
      existing.biggestDrop !== biggestDrop;

    if (!existing) {
      await db.insert(oddsEventsTable).values({
        id: shape.id,
        homeTeam: shape.homeTeam,
        awayTeam: shape.awayTeam,
        sport: shape.sport,
        league: shape.league,
        leagueName: shape.leagueName,
        commenceTime: shape.commenceTime,
        marketType: shape.marketType,
        lines: updatedLines,
        biggestDrop,
        biggestRise,
        newDropAt,
        lastUpdated: now,
      }).onConflictDoNothing();
    } else {
      await db.update(oddsEventsTable)
        .set({ homeTeam: shape.homeTeam, awayTeam: shape.awayTeam, commenceTime: shape.commenceTime, lines: updatedLines, biggestDrop, biggestRise, newDropAt, lastUpdated: now })
        .where(eq(oddsEventsTable.id, shape.id));
    }

    if (hasLineChanges) {
      const updatedEvent: OddsEventUpdate = {
        id: shape.id,
        homeTeam: shape.homeTeam,
        awayTeam: shape.awayTeam,
        sport: shape.sport,
        league: shape.league,
        leagueName: shape.leagueName,
        commenceTime: shape.commenceTime.toISOString(),
        marketType: shape.marketType,
        lines: updatedLines,
        biggestDrop,
        biggestRise,
        newDropAt: newDropAt ? newDropAt.toISOString() : null,
        lastUpdated: now.toISOString(),
      };
      broadcastOddsUpdate(updatedEvent);
    }

    if (isNewDrop) {
      const droppedLine = updatedLines.filter((l) => l.direction === "drop").sort((a, b) => a.changePercent - b.changePercent)[0];
      if (droppedLine) {
        const drop: OddsDropEvent = {
          eventId: shape.id,
          homeTeam: shape.homeTeam,
          awayTeam: shape.awayTeam,
          sport: shape.sport,
          league: shape.league,
          leagueName: shape.leagueName,
          selection: droppedLine.selection,
          openingOdds: droppedLine.openingOdds,
          currentOdds: droppedLine.currentOdds,
          changePercent: droppedLine.changePercent,
          direction: "drop",
          detectedAt: now.toISOString(),
        };
        broadcastOddsDrop(drop);
        sendTelegramDrop(drop).catch((err) => logger.warn({ err }, "Telegram send failed"));
      }
    }

    for (const line of updatedLines) {
      await db.insert(oddsMovementsTable).values({
        eventId: shape.id,
        selection: line.selection,
        odds: line.currentOdds,
        recordedAt: now,
      }).onConflictDoNothing();
    }
  }
}

// ---------------------------------------------------------------------------
// Main poll loop
// ---------------------------------------------------------------------------

async function pollOnce(minDropPercent: number, state: PollerState): Promise<void> {
  logger.info("Polling Pinnacle odds (full market)...");

  let allResults: PollResult[];
  try {
    allResults = await fetchAllPinnacleData();
  } catch (err) {
    logger.error({ err }, "Failed to fetch Pinnacle data — will retry next interval");
    state.consecutiveEmpty++;
    await maybeActivateFallback(state);
    return;
  }

  if (allResults.length === 0) {
    state.consecutiveEmpty++;
    await maybeActivateFallback(state);
    return;
  }

  state.consecutiveEmpty = 0;
  const now = new Date();
  let totalMarkets = 0;
  let totalChanged = 0;
  let totalDrops = 0;

  // Apply market type filter before heavy persistence to keep per-poll time manageable
  const marketTypeFilter = parseMarketTypesFromEnv();

  for (const result of allResults) {
    try {
      const filteredMarkets = result.markets.filter((m) => {
        if (m.period !== 0 || m.isAlternate || m.status !== "open") return false;
        if (marketTypeFilter && !marketTypeFilter.includes(m.type)) return false;
        return true;
      });

      const { changed, drops } = await persistMarkets(filteredMarkets, now);
      totalMarkets += filteredMarkets.length;
      totalChanged += changed;
      totalDrops += drops;
    } catch (err) {
      logger.warn({ err, sport: result.sport }, "Failed to persist markets");
    }
  }

  logger.info(
    { totalMarkets, totalChanged, totalDrops, sports: allResults.length },
    "Full market poll complete",
  );

  // Also update legacy event table for backward compat
  try {
    const legacyEvents = allResults.flatMap((r) => {
      const events: Awaited<ReturnType<typeof fetchPinnacleOdds>> = [];
      const seen = new Set<string>();
      for (const market of r.markets) {
        if (market.period !== 0 || market.isAlternate || market.status !== "open") continue;
        if (marketTypeFilter && !marketTypeFilter.includes(market.type)) continue;
        if (seen.has(market.id)) continue;
        seen.add(market.id);
        const lines = market.prices.map((p) => ({
          selection: `${p.designation}${p.points !== null ? ` ${p.points}` : ""}`,
          openingOdds: p.decimalPrice,
          currentOdds: p.decimalPrice,
          changePercent: 0,
          changeAbsolute: 0,
          direction: "stable" as const,
        }));
        if (lines.length === 0) continue;
        events.push({
          id: market.id,
          homeTeam: market.homeTeam,
          awayTeam: market.awayTeam,
          sport: market.sport,
          league: market.league,
          leagueName: market.leagueName,
          commenceTime: market.startTime,
          marketType: market.type === "team_total" ? "total" : market.type as "moneyline" | "spread" | "total" | "asian_handicap",
          lines,
        });
      }
      return events;
    });
    logger.info({ count: legacyEvents.length, marketTypeFilter }, "Persisting legacy events");
    await persistLegacyEvents(legacyEvents, now, minDropPercent);
  } catch (err) {
    logger.warn({ err }, "Failed to persist legacy events");
  }
}

async function maybeActivateFallback(state: PollerState): Promise<void> {
  if (state.hasSeededFallback) return;
  if (state.consecutiveEmpty < FALLBACK_AFTER_EMPTY_POLLS) {
    logger.warn(
      `Pinnacle API returned no data (${state.consecutiveEmpty}/${FALLBACK_AFTER_EMPTY_POLLS}) — waiting before activating mock fallback.`,
    );
    return;
  }
  logger.warn(`Pinnacle API unavailable for ${state.consecutiveEmpty} consecutive polls — activating mock fallback.`);
  await seedDatabase();
  startMockSimulator(30000);
  state.hasSeededFallback = true;
}

let pollerTimer: ReturnType<typeof setTimeout> | null = null;
const pollerState: PollerState = { consecutiveEmpty: 0, hasSeededFallback: false };

export function startOddsPoller(_apiKey: string, intervalMs: number, minDropPercent: number): void {
  logger.info({ intervalMs, minDropPercent }, "Starting Pinnacle full-market poller");

  const tick = async () => {
    try {
      await pollOnce(minDropPercent, pollerState);
    } catch (err) {
      logger.error({ err }, "Odds poll tick failed");
    } finally {
      pollerTimer = setTimeout(tick, intervalMs);
    }
  };

  tick();
}

export function stopOddsPoller(): void {
  if (pollerTimer !== null) {
    clearTimeout(pollerTimer);
    pollerTimer = null;
  }
}
