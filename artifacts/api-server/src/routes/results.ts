import { Router, type IRouter } from "express";
import { resolveResults, type ResolveRequest } from "../lib/resultsResolver";
import { db, oddsEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

interface OddsLine {
  selection: string;
  currentOdds: number;
  openingOdds: number;
}

/**
 * POST /api/results/check
 * Body: { bets: ResolveRequest[] }
 * Returns: resolved results per-index with win/loss/void/null
 */
router.post("/results/check", async (req, res): Promise<void> => {
  const { bets } = req.body as { bets?: ResolveRequest[] };

  if (!Array.isArray(bets) || bets.length === 0) {
    res.status(400).json({ error: "bets array is required" });
    return;
  }

  if (bets.length > 50) {
    res.status(400).json({ error: "Maximum 50 bets per request" });
    return;
  }

  const results = await resolveResults(bets);
  res.json({ results });
});

/**
 * POST /api/odds/closing-odds
 * Body: { bets: { eventId: string; selection: string }[] }
 * Returns the last-recorded Pinnacle odds for each event+selection pair
 * — i.e. the closing line captured at kick-off.
 */
router.post("/odds/closing-odds", async (req, res): Promise<void> => {
  const { bets } = req.body as { bets?: { eventId: string; selection: string }[] };

  if (!Array.isArray(bets) || bets.length === 0) {
    res.status(400).json({ error: "bets array is required" });
    return;
  }

  if (bets.length > 50) {
    res.status(400).json({ error: "Maximum 50 bets per request" });
    return;
  }

  // Fetch all unique events at once
  const uniqueEventIds = [...new Set(bets.map(b => b.eventId))];
  const eventRows = await Promise.all(
    uniqueEventIds.map(id => db.select().from(oddsEventsTable).where(eq(oddsEventsTable.id, id))),
  );
  const eventMap = new Map<string, OddsLine[]>();
  for (let i = 0; i < uniqueEventIds.length; i++) {
    const row = eventRows[i][0];
    if (row) eventMap.set(uniqueEventIds[i], row.lines as OddsLine[]);
  }

  const results = bets.map((bet, index) => {
    const lines = eventMap.get(bet.eventId);
    if (!lines) return { index, closingOdds: null };

    const selNorm = bet.selection.trim().toLowerCase();
    const selDir = selNorm.split(" ")[0];

    // Exact match first, then direction-only fallback
    const line =
      lines.find(l => l.selection.toLowerCase() === selNorm) ??
      lines.find(l => l.selection.toLowerCase().split(" ")[0] === selDir);

    return {
      index,
      closingOdds: line ? line.currentOdds : null,
    };
  });

  res.json({ results });
});

export default router;
