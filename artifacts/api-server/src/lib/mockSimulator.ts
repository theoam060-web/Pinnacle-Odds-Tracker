import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq, like } from "drizzle-orm";
import { logger } from "./logger";
import { broadcastOddsDrop, type OddsDropEvent } from "./sseManager";
import { sendTelegramDrop } from "./telegramNotifier";

interface OddsLine {
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  changeAbsolute: number;
  direction: "drop" | "rise" | "stable";
}

function drift(current: number): number {
  // ±1.5% random drift, biased slightly toward drops to create interesting feed
  const biasDrop = Math.random() < 0.55 ? -1 : 1;
  const magnitude = Math.random() * 0.015;
  const factor = 1 + biasDrop * magnitude;
  return Math.max(1.05, Math.min(20, parseFloat((current * factor).toFixed(3))));
}

function calcDirection(opening: number, current: number): OddsLine["direction"] {
  const pct = ((current - opening) / opening) * 100;
  if (Math.abs(pct) < 0.05) return "stable";
  return pct < 0 ? "drop" : "rise";
}

export async function simulateTick(): Promise<void> {
  try {
    // Only update mock-generated events (evt-* prefix) — never touch live Pinnacle rows (pin-*)
    const events = await db
      .select()
      .from(oddsEventsTable)
      .where(like(oddsEventsTable.id, "evt-%"));

    const now = new Date();

    for (const event of events) {
      const existingLines = event.lines as OddsLine[];

      const updatedLines: OddsLine[] = existingLines.map(line => {
        const newCurrent = drift(line.currentOdds);
        const changeAbsolute = parseFloat((newCurrent - line.openingOdds).toFixed(3));
        const changePercent = parseFloat(
          (((newCurrent - line.openingOdds) / line.openingOdds) * 100).toFixed(2),
        );
        const direction = calcDirection(line.openingOdds, newCurrent);
        return { ...line, currentOdds: newCurrent, changeAbsolute, changePercent, direction };
      });

      const drops = updatedLines.filter(l => l.direction === "drop").map(l => l.changePercent);
      const rises = updatedLines.filter(l => l.direction === "rise").map(l => l.changePercent);
      const biggestDrop = drops.length ? Math.min(...drops) : 0;
      const biggestRise = rises.length ? Math.max(...rises) : 0;

      await db.update(oddsEventsTable)
        .set({ lines: updatedLines, biggestDrop, biggestRise, lastUpdated: now })
        .where(eq(oddsEventsTable.id, event.id));

      const prevBiggestDrop = (event.lines as OddsLine[])
        .filter(l => l.direction === "drop")
        .map(l => l.changePercent);
      const prevBiggest = prevBiggestDrop.length ? Math.min(...prevBiggestDrop) : 0;
      const MIN_NOTIFY_PERCENT = 2;
      if (biggestDrop < -MIN_NOTIFY_PERCENT && biggestDrop < prevBiggest) {
        const droppedLine = updatedLines
          .filter(l => l.direction === "drop")
          .sort((a, b) => a.changePercent - b.changePercent)[0];
        if (droppedLine) {
          const origLine = (event.lines as OddsLine[]).find(l => l.selection === droppedLine.selection);
          const drop: OddsDropEvent = {
            eventId: event.id,
            homeTeam: event.homeTeam,
            awayTeam: event.awayTeam,
            sport: event.sport,
            league: event.league,
            leagueName: event.leagueName,
            selection: droppedLine.selection,
            openingOdds: origLine?.currentOdds ?? droppedLine.openingOdds,
            currentOdds: droppedLine.currentOdds,
            changePercent: droppedLine.changePercent,
            direction: "drop",
            detectedAt: now.toISOString(),
          };
          broadcastOddsDrop(drop);
          sendTelegramDrop(drop).catch(err => logger.warn({ err }, "Telegram send failed"));
        }
      }

      for (const line of updatedLines) {
        // Fetch last limit for this selection to drift it
        const lastMovements = await db
          .select({ limit: oddsMovementsTable.limit })
          .from(oddsMovementsTable)
          .where(eq(oddsMovementsTable.eventId, event.id))
          .orderBy(oddsMovementsTable.id);
        const lastLimitRows = lastMovements.filter(m => m.limit != null);
        const lastLimit = lastLimitRows.length > 0 ? lastLimitRows[lastLimitRows.length - 1].limit! : 3000 + Math.random() * 2000;
        // Drift limit ±8%, biased slightly lower for drops
        const limitBias = line.direction === "drop" ? -1 : (Math.random() < 0.4 ? -1 : 1);
        const limitDrift = 1 + limitBias * Math.random() * 0.08;
        const newLimit = parseFloat(Math.max(100, lastLimit * limitDrift).toFixed(0));

        await db.insert(oddsMovementsTable).values({
          eventId: event.id,
          selection: line.selection,
          odds: line.currentOdds,
          limit: newLimit,
          recordedAt: now,
        });
      }
    }

    logger.debug({ events: events.length }, "Mock simulator tick complete");
  } catch (err) {
    logger.warn({ err }, "Mock simulator tick failed");
  }
}

let simulatorTimer: ReturnType<typeof setInterval> | null = null;

export function startMockSimulator(intervalMs = 30000): void {
  if (simulatorTimer) return;
  logger.info({ intervalMs }, "Starting mock odds simulator");
  setTimeout(() => {
    simulateTick();
    simulatorTimer = setInterval(simulateTick, intervalMs);
  }, 5000);
}
