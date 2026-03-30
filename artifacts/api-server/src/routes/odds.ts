import { Router, type IRouter } from "express";
import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq, and, lte, gte, asc, desc } from "drizzle-orm";
import {
  GetOddsDropsQueryParams,
  GetOddsDropsResponse,
  GetOddsDropByIdParams,
  GetOddsDropByIdResponse,
  GetOddsSummaryResponse,
  GetTopMoversResponse,
} from "@workspace/api-zod";
import { formatEventForApi } from "../lib/oddsGenerator";

const router: IRouter = Router();

router.get("/odds/drops", async (req, res): Promise<void> => {
  const query = GetOddsDropsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { sport, league, minDrop, direction } = query.data;

  let rows = await db.select().from(oddsEventsTable).orderBy(desc(oddsEventsTable.lastUpdated));

  if (sport) {
    rows = rows.filter(r => r.sport === sport);
  }
  if (league) {
    rows = rows.filter(r => r.league === league);
  }
  if (minDrop !== undefined) {
    rows = rows.filter(r => Math.abs(r.biggestDrop) >= minDrop || Math.abs(r.biggestRise) >= minDrop);
  }
  if (direction === "drop") {
    rows = rows.filter(r => r.biggestDrop < -0.01);
  } else if (direction === "rise") {
    rows = rows.filter(r => r.biggestRise > 0.01);
  }

  const events = rows.map(formatEventForApi);
  res.json(GetOddsDropsResponse.parse(events));
});

router.get("/odds/drops/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOddsDropByIdParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(oddsEventsTable)
    .where(eq(oddsEventsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const movements = await db
    .select()
    .from(oddsMovementsTable)
    .where(eq(oddsMovementsTable.eventId, params.data.id))
    .orderBy(asc(oddsMovementsTable.recordedAt));

  const eventBase = formatEventForApi(row);
  const detail = {
    ...eventBase,
    movements: movements.map(m => ({
      timestamp: m.recordedAt.toISOString(),
      odds: m.odds,
      selection: m.selection,
    })),
  };

  res.json(GetOddsDropByIdResponse.parse(detail));
});

router.get("/odds/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(oddsEventsTable);
  const drops = rows.filter(r => r.biggestDrop < -0.01);
  const rises = rows.filter(r => r.biggestRise > 0.01);

  const allDrops = rows.map(r => r.biggestDrop).filter(d => d < -0.01);
  const avgDropPercent = allDrops.length
    ? parseFloat((allDrops.reduce((a, b) => a + b, 0) / allDrops.length).toFixed(2))
    : 0;

  const biggestDrop = allDrops.length ? Math.min(...allDrops) : 0;
  const allRises = rows.map(r => r.biggestRise).filter(r => r > 0.01);
  const biggestRise = allRises.length ? Math.max(...allRises) : 0;

  const summary = {
    totalEvents: rows.length,
    dropsCount: drops.length,
    risesCount: rises.length,
    avgDropPercent,
    biggestDrop,
    biggestRise,
    lastUpdated: new Date().toISOString(),
  };

  res.json(GetOddsSummaryResponse.parse(summary));
});

router.get("/odds/top-movers", async (_req, res): Promise<void> => {
  const rows = await db.select().from(oddsEventsTable).orderBy(desc(oddsEventsTable.lastUpdated));

  const sorted = [...rows].sort((a, b) => {
    const aMax = Math.max(Math.abs(a.biggestDrop), Math.abs(a.biggestRise));
    const bMax = Math.max(Math.abs(b.biggestDrop), Math.abs(b.biggestRise));
    return bMax - aMax;
  });

  const topMovers = sorted.slice(0, 10).map(formatEventForApi);
  res.json(GetTopMoversResponse.parse(topMovers));
});

export default router;
