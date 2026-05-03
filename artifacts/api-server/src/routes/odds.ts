import { Router, type IRouter } from "express";
import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq, and, asc, desc, gt, isNotNull } from "drizzle-orm";
import {
  GetOddsDropsQueryParams,
  GetOddsDropsResponse,
  GetOddsDropByIdParams,
  GetOddsDropByIdResponse,
  GetOddsSummaryResponse,
  GetTopMoversResponse,
} from "@workspace/api-zod";
import { formatEventForApi } from "../lib/oddsGenerator";
import { getActiveMarketCount } from "../lib/oddsPoller";
import { registerSSEClient, unregisterSSEClient } from "../lib/sseManager";

const router: IRouter = Router();

const ENV_MIN_DROP_PERCENT = parseFloat(process.env["MIN_DROP_PERCENT"] ?? "2");

// ---------------------------------------------------------------------------
// Simple in-memory TTL cache
// ---------------------------------------------------------------------------
interface CacheEntry { data: unknown; expiresAt: number }
const _cache = new Map<string, CacheEntry>();

function cacheGet<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown, ttlMs: number): void {
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.get("/odds/drops", async (req, res): Promise<void> => {
  const query = GetOddsDropsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { sport, league, minDrop, direction } = query.data;
  const effectiveMinDrop = minDrop ?? ENV_MIN_DROP_PERCENT;

  // Cache key includes all filter params so each unique combination is cached
  const cacheKey = `drops:${sport ?? ""}:${league ?? ""}:${effectiveMinDrop}:${direction ?? ""}`;
  const cached = cacheGet<unknown[]>(cacheKey);
  if (cached) { res.json(cached); return; }

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Push time-based filtering to the database — avoids loading entire table
  let rows = await db
    .select()
    .from(oddsEventsTable)
    .where(
      and(
        isNotNull(oddsEventsTable.newDropAt),
        gt(oddsEventsTable.newDropAt, twoHoursAgo),
        gt(oddsEventsTable.commenceTime, now),
      ),
    )
    .orderBy(desc(oddsEventsTable.lastUpdated));

  rows = rows.filter(r => r.homeTeam !== "Unknown" && r.awayTeam !== "Unknown");

  if (sport) rows = rows.filter(r => r.sport === sport);
  if (league) rows = rows.filter(r => r.league === league);
  rows = rows.filter(
    r => Math.abs(r.biggestDrop) >= effectiveMinDrop || Math.abs(r.biggestRise) >= effectiveMinDrop,
  );
  if (direction === "drop") rows = rows.filter(r => r.biggestDrop < -0.01);
  else if (direction === "rise") rows = rows.filter(r => r.biggestRise > 0.01);

  const events = GetOddsDropsResponse.parse(rows.map(formatEventForApi));
  cacheSet(cacheKey, events, 10_000); // 10 s cache — real-time feel, but no hammering
  res.json(events);
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
      limit: m.limit ?? null,
    })),
  };

  res.json(GetOddsDropByIdResponse.parse(detail));
});

router.get("/odds/summary", async (_req, res): Promise<void> => {
  const cached = cacheGet<unknown>("summary");
  if (cached) { res.json(cached); return; }

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
    monitoringCount: getActiveMarketCount() || rows.length,
    dropsCount: drops.length,
    risesCount: rises.length,
    avgDropPercent,
    biggestDrop,
    biggestRise,
    lastUpdated: new Date().toISOString(),
  };

  const parsed = GetOddsSummaryResponse.parse(summary);
  cacheSet("summary", parsed, 30_000); // 30 s — sidebar refreshes every 60 s
  res.json(parsed);
});

router.get("/odds/top-movers", async (_req, res): Promise<void> => {
  const cached = cacheGet<unknown>("top-movers");
  if (cached) { res.json(cached); return; }

  const rows = await db
    .select()
    .from(oddsEventsTable)
    .orderBy(desc(oddsEventsTable.lastUpdated));

  const filtered = rows.filter(
    r => Math.abs(r.biggestDrop) >= ENV_MIN_DROP_PERCENT || Math.abs(r.biggestRise) >= ENV_MIN_DROP_PERCENT,
  );

  const sorted = [...filtered].sort((a, b) => {
    const aMax = Math.max(Math.abs(a.biggestDrop), Math.abs(a.biggestRise));
    const bMax = Math.max(Math.abs(b.biggestDrop), Math.abs(b.biggestRise));
    return bMax - aMax;
  });

  const topMovers = GetTopMoversResponse.parse(sorted.slice(0, 10).map(formatEventForApi));
  cacheSet("top-movers", topMovers, 30_000);
  res.json(topMovers);
});

router.get("/odds/stream", (req, res): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(": connected\n\n");

  const clientId = registerSSEClient(res);

  const keepAlive = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    unregisterSSEClient(clientId);
  });
});

export default router;
