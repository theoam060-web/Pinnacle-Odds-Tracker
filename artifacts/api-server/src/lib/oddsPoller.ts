import {
  db,
  oddsEventsTable,
  oddsMovementsTable,
  pinnacleMatchupsTable,
  pinnacleMarketsTable,
  pinnacleMarketMovementsTable,
} from "@workspace/db";
import { eq, like, gt } from "drizzle-orm";
import { logger } from "./logger";
import { fetchAllPinnacleData, fetchPinnacleOdds, parseMarketTypesFromEnv } from "./pinnacleClient";
import type { PollResult, NormalizedMarket, NormalizedMatchup } from "./pinnacleClient";
import { seedDatabase, purgeStaleEvents } from "./oddsGenerator";
import { startMockSimulator } from "./mockSimulator";
import { startOddsApiPoller } from "./oddsApiPoller";
import {
  broadcastOddsDrop,
  broadcastOddsUpdate,
  broadcastMarketUpdate,
  type OddsDropEvent,
  type OddsEventUpdate,
  type MarketUpdate,
} from "./sseManager";
import { sendTelegramDrop } from "./telegramNotifier";
import { sendPushToAll } from "../routes/push";

const FALLBACK_AFTER_EMPTY_POLLS = 999;

// In-memory price cache: marketId → Map<designation+points, lastPolledDecimalPrice>
// This lets us detect poll-to-poll drops without a DB round-trip or FK dependency.
const priceCache = new Map<string, Map<string, number>>();

// Tracks total active market count across all sports (updated each poll cycle)
let lastActiveMarketCount = 0;
export function getActiveMarketCount(): number { return lastActiveMarketCount; }

interface OddsLine {
  selection: string;
  openingOdds: number;
  prevPolledOdds: number; // odds from the previous poll cycle — used for fresh-move detection
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
  prevDecimalPrice?: number; // last-polled price for poll-to-poll drop detection
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
  minDropPercent: number,
): Promise<{ changed: number; drops: number; dropEvents: OddsDropEvent[] }> {
  let changed = 0;
  let drops = 0;
  const dropEvents: OddsDropEvent[] = [];

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
        // prevDecimalPrice tracks the last-polled price for poll-to-poll detection
        prevDecimalPrice: prev?.decimalPrice ?? current,
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

    // A drop alert fires when odds actually moved DOWN in this poll cycle
    // (prevDecimalPrice → current), not just from opening. This avoids
    // re-alerting on stale historical drops every poll.
    if (existing && pricesChanged) {
      for (const price of updatedPrices) {
        const prevPrice = price.prevDecimalPrice ?? price.openingDecimalPrice;
        const pollDrop = calcChangePercent(prevPrice, price.decimalPrice);
        if (pollDrop < -minDropPercent) {
          drops++;
          const drop: OddsDropEvent = {
            eventId: market.id,
            homeTeam: market.homeTeam,
            awayTeam: market.awayTeam,
            sport: market.sport,
            league: market.league,
            leagueName: market.leagueName,
            selection: `${price.designation}${price.points !== null ? ` ${price.points}` : ""}`,
            openingOdds: price.openingDecimalPrice,
            currentOdds: price.decimalPrice,
            changePercent: price.changePercent, // opening→current for display
            direction: "drop",
            detectedAt: now.toISOString(),
          };
          dropEvents.push(drop);
          sendTelegramDrop(drop).catch((err) => logger.warn({ err }, "Telegram send failed"));
          break; // one alert per market per poll is enough
        }
      }
    }
  }

  return { changed, drops, dropEvents };
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

type LegacyEventShape = Awaited<ReturnType<typeof fetchPinnacleOdds>>[number] & {
  maxRiskStake?: number | null;
};

async function persistLegacyEvents(
  events: LegacyEventShape[],
  now: Date,
  minDropPercent: number,
): Promise<OddsDropEvent[]> {
  const collectedDrops: OddsDropEvent[] = [];
  for (const shape of events) {
    const [existing] = await db
      .select()
      .from(oddsEventsTable)
      .where(eq(oddsEventsTable.id, shape.id));

    const existingLines = existing ? (existing.lines as OddsLine[]) : null;

    const updatedLines: OddsLine[] = shape.lines.map((newLine) => {
      if (!existing || !existingLines) return { ...newLine, prevPolledOdds: newLine.currentOdds };
      const newDesignation = newLine.selection.split(" ")[0];
      const existingLine =
        existingLines.find((l) => l.selection === newLine.selection) ??
        existingLines.find((l) => l.selection.split(" ")[0] === newDesignation);
      if (!existingLine) return { ...newLine, prevPolledOdds: newLine.currentOdds };

      const openingOdds = existingLine.openingOdds;
      const prevPolledOdds = existingLine.currentOdds; // what it was last poll
      const currentOdds = newLine.currentOdds;
      const changeAbsolute = parseFloat((currentOdds - openingOdds).toFixed(3));
      const changePercent = calcChangePercent(openingOdds, currentOdds);
      const direction = calcDirection(openingOdds, currentOdds);
      return { selection: newLine.selection, openingOdds, prevPolledOdds, currentOdds, changeAbsolute, changePercent, direction };
    });

    const biggestDrop = getBiggestDrop(updatedLines);
    const biggestRise = getBiggestRise(updatedLines);
    const prevBiggestDrop = existing?.biggestDrop ?? 0;
    const persistedBiggestDrop = Math.min(prevBiggestDrop, biggestDrop);

    // A drop is only actionable if the odds ACTUALLY MOVED DOWN in THIS poll cycle.
    // No cooldown — update newDropAt on every fresh poll-to-poll drop so the REST
    // endpoint always returns the most recent drop timestamp.
    const hasFreshPollDrop = existing != null && updatedLines.some(
      (l) => calcChangePercent(l.prevPolledOdds, l.currentOdds) < -minDropPercent,
    );
    const isNewDrop = hasFreshPollDrop && biggestDrop < -minDropPercent;
    const newDropAt = isNewDrop ? now : (existing?.newDropAt ?? null);

    const hasLineChanges =
      !existing ||
      JSON.stringify(existing.lines) !== JSON.stringify(updatedLines) ||
      existing.biggestDrop !== persistedBiggestDrop;

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
        biggestDrop: persistedBiggestDrop,
        biggestRise,
        newDropAt,
        lastUpdated: now,
      }).onConflictDoNothing();
    } else {
      await db.update(oddsEventsTable)
        .set({ homeTeam: shape.homeTeam, awayTeam: shape.awayTeam, commenceTime: shape.commenceTime, lines: updatedLines, biggestDrop: persistedBiggestDrop, biggestRise, newDropAt, lastUpdated: now })
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
        biggestDrop: persistedBiggestDrop,
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
        collectedDrops.push(drop);
        sendTelegramDrop(drop).catch((err) => logger.warn({ err }, "Telegram send failed"));
      }
    }

    for (const line of updatedLines) {
      // Only store a movement tick when odds actually changed from the previously recorded value
      const prevLine = existingLines
        ? existingLines.find(
            (l) =>
              l.selection === line.selection ||
              l.selection.split(" ")[0] === line.selection.split(" ")[0],
          )
        : null;
      const oddsChanged =
        !existing ||
        !prevLine ||
        Math.abs((prevLine.currentOdds - line.currentOdds) / (prevLine.currentOdds || 1)) > 0.0002;

      if (!oddsChanged) continue;

      await db.insert(oddsMovementsTable).values({
        eventId: shape.id,
        selection: line.selection,
        odds: line.currentOdds,
        limit: shape.maxRiskStake ?? null,
        recordedAt: now,
      }).onConflictDoNothing();
    }
  }
  return collectedDrops;
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

  const marketTypeFilter = parseMarketTypesFromEnv();

  logger.info({ sports: allResults.length }, "Full market poll complete");

  // --- Build two market sets ---
  // activeMarkets: ALL pre-match open markets (all periods + alternates) for drop detection + count
  // primaryMarkets: period=0 non-alternate only, for DB persistence (limits write volume)
  const activeMarkets: NormalizedMarket[] = [];
  const primaryMarkets: NormalizedMarket[] = [];
  for (const r of allResults) {
    for (const market of r.markets) {
      if (market.status !== "open") continue;
      if (market.isLive) continue;
      if (market.startTime <= now) continue;
      if (marketTypeFilter && !marketTypeFilter.includes(market.type)) continue;
      activeMarkets.push(market);
      if (market.period === 0 && !market.isAlternate) {
        primaryMarkets.push(market);
      }
    }
  }
  lastActiveMarketCount = activeMarkets.length;

  // --- Detect drops using in-memory price cache (poll-to-poll comparison) ---
  // priceCache tracks the last-polled decimalPrice per market/selection so we can
  // detect drops that actually happened in this poll cycle — not stale opening→current gaps.
  const freshDropEvents: OddsDropEvent[] = [];

  for (const market of activeMarkets) {
    const marketPriceMap = priceCache.get(market.id) ?? new Map<string, number>();
    const isFirstSeen = !priceCache.has(market.id);

    for (const price of market.prices) {
      const key = `${price.designation}|${price.points}`;
      const prevPrice = marketPriceMap.get(key) ?? price.decimalPrice;
      const pollDrop = calcChangePercent(prevPrice, price.decimalPrice);

      // Always update cache with current price (regardless of whether it's a drop)
      marketPriceMap.set(key, price.decimalPrice);

      // Only fire on a genuinely fresh poll-to-poll downward move (not first-seen)
      if (!isFirstSeen && pollDrop < -minDropPercent) {
        freshDropEvents.push({
          eventId: market.id,
          homeTeam: market.homeTeam,
          awayTeam: market.awayTeam,
          sport: market.sport,
          league: market.league,
          leagueName: market.leagueName,
          selection: `${price.designation}${price.points !== null ? ` ${price.points}` : ""}`,
          openingOdds: prevPrice,
          currentOdds: price.decimalPrice,
          changePercent: pollDrop,
          direction: "drop",
          detectedAt: now.toISOString(),
        });
        // One alert per market per poll is enough
        break;
      }
    }

    priceCache.set(market.id, marketPriceMap);
  }

  // --- Persist legacy events table (REST API / odds_events table) ---
  // Only persist primary markets (period=0, non-alternate) to keep DB write volume manageable.
  // Drop detection runs against the full activeMarkets set via priceCache.
  try {
    const legacyEvents = primaryMarkets.map((market) => {
      const lines = market.prices.map((p) => ({
        selection: `${p.designation}${p.points !== null ? ` ${p.points}` : ""}`,
        openingOdds: p.decimalPrice,
        currentOdds: p.decimalPrice,
        changePercent: 0,
        changeAbsolute: 0,
        direction: "stable" as const,
      }));
      return {
        id: market.id,
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        sport: market.sport,
        league: market.league,
        leagueName: market.leagueName,
        commenceTime: market.startTime,
        marketType: market.type as "moneyline" | "spread" | "total" | "team_total" | "asian_handicap",
        lines,
        maxRiskStake: market.maxRiskStake,
      };
    });
    logger.info({ count: legacyEvents.length, marketTypeFilter }, "Persisting legacy events");
    const legacyDrops = await persistLegacyEvents(legacyEvents, now, minDropPercent);
    // Merge legacy drops with priceCache drops — either path may catch a move
    freshDropEvents.push(...legacyDrops);
  } catch (err) {
    logger.warn({ err }, "Failed to persist legacy events");
  }

  // --- Broadcast drops — deduplicate per market with 60s cooldown ---
  try {
    const nowMs = Date.now();
    const MARKET_DEDUP_MS = 60_000;

    // Deduplicate: one alert per market per 60s, keep biggest drop per match
    const bestPerMatch = new Map<string, OddsDropEvent>();
    for (const drop of freshDropEvents) {
      const marketKey = drop.eventId;
      if (nowMs - (matchBroadcastCooldown.get(marketKey) ?? 0) < MARKET_DEDUP_MS) continue;
      const matchKey = `${drop.homeTeam}|${drop.awayTeam}|${drop.sport}`;
      const existing = bestPerMatch.get(matchKey);
      if (!existing || drop.changePercent < existing.changePercent) {
        bestPerMatch.set(matchKey, { ...drop, eventId: marketKey });
      }
    }

    // Take top 20 biggest movers, stagger broadcasts by 200ms
    const eligible = [...bestPerMatch.values()]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 20);

    for (const drop of eligible) {
      matchBroadcastCooldown.set(drop.eventId, nowMs);
    }

    if (eligible.length > 0) {
      logger.info({ total: freshDropEvents.length, matches: bestPerMatch.size, broadcasting: eligible.length }, "Broadcasting fresh drops");
      const STAGGER_MS = 200;
      eligible.forEach((drop, i) => {
        setTimeout(() => {
          broadcastOddsDrop(drop);
          sendTelegramDrop(drop).catch((err) => logger.warn({ err }, "Telegram send failed"));
          sendPushToAll({
            title: `⚡ ${drop.homeTeam} vs ${drop.awayTeam}`,
            body: `${drop.selection} · Pinnacle ▼ ${Math.abs(drop.changePercent).toFixed(1)}%  (${drop.currentOdds.toFixed(2)})`,
            sport: drop.sport,
            market: drop.selection,
            bookmaker: "Pinnacle",
            drop: parseFloat(Math.abs(drop.changePercent).toFixed(2)),
            tag: `drop-${drop.eventId}`,
            url: "/app/",
          });
        }, i * STAGGER_MS);
      });
    }
  } catch (err) {
    logger.warn({ err }, "Failed to broadcast drops");
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
// Per-match broadcast cooldown — key: "homeTeam|awayTeam|sport", value: last broadcast ms
const matchBroadcastCooldown = new Map<string, number>();

async function activateMockMode(): Promise<void> {
  logger.info("MOCK_MODE=true — seeding database with mock events and starting simulator");
  await purgeStaleEvents();
  await seedDatabase();
  // Stamp all seeded events with newDropAt=now so they pass the 2-hour feed filter
  await db
    .update(oddsEventsTable)
    .set({ newDropAt: new Date() })
    .where(like(oddsEventsTable.id, "evt-%"));
  logger.info("Mock events seeded and stamped with fresh newDropAt");
  startMockSimulator(15000); // tick every 15s for a lively demo feed
}

export function startOddsPoller(_apiKey: string, intervalMs: number, minDropPercent: number): void {
  // If MOCK_MODE is enabled, seed mock data immediately and skip any real polling
  if (process.env["MOCK_MODE"] === "true") {
    logger.info({ intervalMs, minDropPercent }, "MOCK_MODE active — using simulator instead of live data");
    purgeStaleEvents().catch(err => logger.warn({ err }, "Startup stale-event purge failed"));
    activateMockMode().catch(err => logger.error({ err }, "Mock mode activation failed"));
    return;
  }

  // If ODDS_API_KEY is set, use The Odds API poller (Pinnacle via RapidAPI)
  // This is the preferred fallback when the native Pinnacle guest API is IP-blocked.
  const oddsApiKey = process.env["ODDS_API_KEY"];
  if (oddsApiKey) {
    logger.info(
      { intervalMs: 300_000, minDropPercent },
      "ODDS_API_KEY detected — using The Odds API poller (Pinnacle odds via RapidAPI)",
    );
    // Use 5-minute intervals to be credit-efficient (overrides the default 20s)
    startOddsApiPoller(oddsApiKey, 300_000, minDropPercent);
    return;
  }

  // Fallback: native Pinnacle guest API poller
  logger.info({ intervalMs, minDropPercent }, "Starting Pinnacle full-market poller");

  // Purge stale events immediately on startup, then every hour.
  purgeStaleEvents().catch(err => logger.warn({ err }, "Startup stale-event purge failed"));
  setInterval(() => {
    purgeStaleEvents().catch(err => logger.warn({ err }, "Periodic stale-event purge failed"));
  }, 60 * 60 * 1000);

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
