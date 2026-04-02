import { Router, type IRouter } from "express";
import {
  db,
  pinnacleMatchupsTable,
  pinnacleMarketsTable,
  pinnacleMarketMovementsTable,
} from "@workspace/db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/markets", async (req, res): Promise<void> => {
  const {
    sport,
    league,
    matchupId,
    type,
    period,
    status,
    isAlternate,
    isLive,
    limit: limitStr,
    offset: offsetStr,
  } = req.query;

  const limit = Math.min(Number(limitStr) || 100, 500);
  const offset = Number(offsetStr) || 0;

  const conditions: ReturnType<typeof eq>[] = [];

  if (sport && typeof sport === "string") {
    conditions.push(eq(pinnacleMarketsTable.sport, sport));
  }
  if (league && typeof league === "string") {
    conditions.push(eq(pinnacleMarketsTable.league, league));
  }
  if (matchupId) {
    conditions.push(eq(pinnacleMarketsTable.matchupId, Number(matchupId)));
  }
  if (type && typeof type === "string") {
    conditions.push(eq(pinnacleMarketsTable.type, type));
  }
  if (period !== undefined && period !== "") {
    conditions.push(eq(pinnacleMarketsTable.period, Number(period)));
  }
  if (status && typeof status === "string") {
    conditions.push(eq(pinnacleMarketsTable.status, status));
  }
  if (isAlternate !== undefined) {
    conditions.push(eq(pinnacleMarketsTable.isAlternate, isAlternate === "true"));
  }
  if (isLive !== undefined) {
    conditions.push(eq(pinnacleMarketsTable.isLive, isLive === "true"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(pinnacleMarketsTable)
    .where(where)
    .orderBy(desc(pinnacleMarketsTable.lastUpdated))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pinnacleMarketsTable)
    .where(where);

  res.json({
    data: rows,
    total: countResult?.count ?? 0,
    limit,
    offset,
  });
});

router.get("/markets/stats", async (_req, res): Promise<void> => {
  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${pinnacleMarketsTable.status} = 'open')::int`,
      live: sql<number>`count(*) filter (where ${pinnacleMarketsTable.isLive} = true)::int`,
      withDrops: sql<number>`count(*) filter (where ${pinnacleMarketsTable.biggestDrop} < -1)::int`,
      withRises: sql<number>`count(*) filter (where ${pinnacleMarketsTable.biggestRise} > 1)::int`,
    })
    .from(pinnacleMarketsTable);

  const [sportCounts] = await db
    .select({
      sports: sql<string>`json_agg(json_build_object('sport', sport, 'count', cnt)) from (select sport, count(*)::int as cnt from pinnacle_markets group by sport order by cnt desc) sub -- `,
    })
    .from(sql`(select 1) x`);

  const sportsRaw = await db
    .select({
      sport: pinnacleMarketsTable.sport,
      count: sql<number>`count(*)::int`,
    })
    .from(pinnacleMarketsTable)
    .groupBy(pinnacleMarketsTable.sport)
    .orderBy(sql`count(*) desc`);

  const typeCounts = await db
    .select({
      type: pinnacleMarketsTable.type,
      count: sql<number>`count(*)::int`,
    })
    .from(pinnacleMarketsTable)
    .groupBy(pinnacleMarketsTable.type)
    .orderBy(sql`count(*) desc`);

  res.json({
    ...result,
    bySport: sportsRaw,
    byType: typeCounts,
    lastUpdated: new Date().toISOString(),
  });
});

router.get("/markets/:id", async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [market] = await db
    .select()
    .from(pinnacleMarketsTable)
    .where(eq(pinnacleMarketsTable.id, id));

  if (!market) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const movements = await db
    .select()
    .from(pinnacleMarketMovementsTable)
    .where(eq(pinnacleMarketMovementsTable.marketId, id))
    .orderBy(asc(pinnacleMarketMovementsTable.recordedAt));

  res.json({ market, movements });
});

router.get("/matchups", async (req, res): Promise<void> => {
  const { sport, league, isLive, type, limit: limitStr, offset: offsetStr } = req.query;

  const limit = Math.min(Number(limitStr) || 100, 500);
  const offset = Number(offsetStr) || 0;

  const conditions: ReturnType<typeof eq>[] = [];

  if (sport && typeof sport === "string") {
    conditions.push(eq(pinnacleMatchupsTable.sport, sport));
  }
  if (league && typeof league === "string") {
    conditions.push(eq(pinnacleMatchupsTable.league, league));
  }
  if (isLive !== undefined) {
    conditions.push(eq(pinnacleMatchupsTable.isLive, isLive === "true"));
  }
  if (type && typeof type === "string") {
    conditions.push(eq(pinnacleMatchupsTable.type, type as "matchup" | "special"));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(pinnacleMatchupsTable)
    .where(where)
    .orderBy(desc(pinnacleMatchupsTable.startTime))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pinnacleMatchupsTable)
    .where(where);

  res.json({
    data: rows,
    total: countResult?.count ?? 0,
    limit,
    offset,
  });
});

router.get("/matchups/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);

  const [matchup] = await db
    .select()
    .from(pinnacleMatchupsTable)
    .where(eq(pinnacleMatchupsTable.id, id));

  if (!matchup) {
    res.status(404).json({ error: "Matchup not found" });
    return;
  }

  const markets = await db
    .select()
    .from(pinnacleMarketsTable)
    .where(eq(pinnacleMarketsTable.matchupId, id))
    .orderBy(asc(pinnacleMarketsTable.period), asc(pinnacleMarketsTable.type));

  res.json({ matchup, markets });
});

export default router;
