import { Router, type IRouter } from "express";
import { db, betsTable } from "@workspace/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { formatBetForApi, calculateStats } from "../lib/betCalculations";

const router: IRouter = Router();

router.get("/bets/stats", async (_req, res): Promise<void> => {
  const bets = await db.select().from(betsTable);
  const stats = calculateStats(bets);
  res.json(stats);
});

router.get("/bets", async (req, res): Promise<void> => {
  const { result, dateFrom, dateTo } = req.query as Record<string, string | undefined>;

  const conditions = [];
  if (result) conditions.push(eq(betsTable.result, result));
  if (dateFrom) conditions.push(gte(betsTable.betDate, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(betsTable.betDate, new Date(dateTo)));

  const rows = await db
    .select()
    .from(betsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(betsTable.betDate));

  res.json(rows.map(formatBetForApi));
});

router.post("/bets", async (req, res): Promise<void> => {
  const { matchName, selection, sport, league, oddsValue, stake, result, closingOdds, notes, betDate } = req.body;

  if (!matchName || !selection || oddsValue == null || stake == null || !result) {
    res.status(400).json({ error: "matchName, selection, oddsValue, stake, and result are required" });
    return;
  }

  const [inserted] = await db
    .insert(betsTable)
    .values({
      matchName,
      selection,
      sport: sport ?? "",
      league: league ?? "",
      oddsValue: Number(oddsValue),
      stake: Number(stake),
      result,
      closingOdds: closingOdds != null ? Number(closingOdds) : null,
      notes: notes ?? null,
      betDate: betDate ? new Date(betDate) : new Date(),
    })
    .returning();

  res.status(201).json(formatBetForApi(inserted));
});

router.patch("/bets/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(betsTable).where(eq(betsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Bet not found" });
    return;
  }

  const { matchName, selection, sport, league, oddsValue, stake, result, closingOdds, notes, betDate } = req.body;

  const [updated] = await db
    .update(betsTable)
    .set({
      matchName: matchName ?? existing.matchName,
      selection: selection ?? existing.selection,
      sport: sport ?? existing.sport,
      league: league ?? existing.league,
      oddsValue: oddsValue != null ? Number(oddsValue) : existing.oddsValue,
      stake: stake != null ? Number(stake) : existing.stake,
      result: result ?? existing.result,
      closingOdds: closingOdds !== undefined ? (closingOdds != null ? Number(closingOdds) : null) : existing.closingOdds,
      notes: notes !== undefined ? notes : existing.notes,
      betDate: betDate ? new Date(betDate) : existing.betDate,
      updatedAt: new Date(),
    })
    .where(eq(betsTable.id, id))
    .returning();

  res.json(formatBetForApi(updated));
});

router.delete("/bets/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(betsTable).where(eq(betsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Bet not found" });
    return;
  }

  await db.delete(betsTable).where(eq(betsTable.id, id));
  res.status(204).send();
});

export default router;
