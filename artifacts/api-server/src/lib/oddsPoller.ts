import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { fetchPinnacleOdds } from "./pinnacleClient";
import { seedDatabase } from "./oddsGenerator";
import { startMockSimulator } from "./mockSimulator";

const FALLBACK_AFTER_EMPTY_POLLS = 3;

interface OddsLine {
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  changeAbsolute: number;
  direction: "drop" | "rise" | "stable";
}

interface PollerState {
  consecutiveEmpty: number;
  hasSeededFallback: boolean;
}

function calcChangePercent(opening: number, current: number): number {
  if (opening === 0) return 0;
  return parseFloat(((current - opening) / opening * 100).toFixed(2));
}

function calcDirection(opening: number, current: number): "drop" | "rise" | "stable" {
  const diff = current - opening;
  if (Math.abs(diff) < 0.005) return "stable";
  return diff < 0 ? "drop" : "rise";
}

function getBiggestDrop(lines: OddsLine[]): number {
  const drops = lines.filter(l => l.direction === "drop").map(l => l.changePercent);
  return drops.length ? Math.min(...drops) : 0;
}

function getBiggestRise(lines: OddsLine[]): number {
  const rises = lines.filter(l => l.direction === "rise").map(l => l.changePercent);
  return rises.length ? Math.max(...rises) : 0;
}

async function pollOnce(
  apiKey: string,
  minDropPercent: number,
  state: PollerState,
): Promise<void> {
  logger.info("Polling Pinnacle odds...");

  let events;
  try {
    events = await fetchPinnacleOdds(apiKey);
  } catch (err) {
    logger.error({ err }, "Failed to fetch Pinnacle odds — will retry next interval");
    state.consecutiveEmpty++;
    await maybeActivateFallback(state);
    return;
  }

  const now = new Date();
  let upserted = 0;

  for (const shape of events) {
    const [existing] = await db
      .select()
      .from(oddsEventsTable)
      .where(eq(oddsEventsTable.id, shape.id));

    const updatedLines: OddsLine[] = shape.lines.map(newLine => {
      if (!existing) return newLine;

      const existingLines = existing.lines as OddsLine[];
      const existingLine = existingLines.find(l => l.selection === newLine.selection);

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

    for (const line of updatedLines) {
      await db.insert(oddsMovementsTable).values({
        eventId: shape.id,
        selection: line.selection,
        odds: line.currentOdds,
        recordedAt: now,
      }).onConflictDoNothing();
    }

    upserted++;
  }

  logger.info({ upserted, total: events.length }, "Pinnacle poll complete");

  if (events.length === 0) {
    state.consecutiveEmpty++;
    await maybeActivateFallback(state);
  } else {
    state.consecutiveEmpty = 0;
  }
}

async function maybeActivateFallback(state: PollerState): Promise<void> {
  const n = state.consecutiveEmpty;
  if (state.hasSeededFallback) return;

  if (n < FALLBACK_AFTER_EMPTY_POLLS) {
    logger.warn(
      `Pinnacle API returned no data (${n}/${FALLBACK_AFTER_EMPTY_POLLS}) — ` +
      "waiting for consistent unavailability before activating mock fallback.",
    );
    return;
  }

  logger.warn(
    `Pinnacle API unavailable for ${n} consecutive polls — ` +
    "seeding mock data and starting live simulator as fallback.",
  );
  await seedDatabase();
  startMockSimulator(30000);
  state.hasSeededFallback = true;
}

let pollerTimer: ReturnType<typeof setTimeout> | null = null;
const pollerState: PollerState = { consecutiveEmpty: 0, hasSeededFallback: false };

export function startOddsPoller(apiKey: string, intervalMs: number, minDropPercent: number): void {
  logger.info({ intervalMs, minDropPercent }, "Starting Pinnacle odds poller");

  const tick = async () => {
    try {
      await pollOnce(apiKey, minDropPercent, pollerState);
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
