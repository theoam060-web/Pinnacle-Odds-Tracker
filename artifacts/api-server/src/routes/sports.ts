import { Router, type IRouter } from "express";
import { db, oddsEventsTable } from "@workspace/db";
import { GetLeaguesBySportParams, GetLeaguesBySportResponse, GetSportsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const sportIcons: Record<string, string> = {
  soccer: "⚽",
  basketball: "🏀",
  tennis: "🎾",
  hockey: "🏒",
  baseball: "⚾",
  american_football: "🏈",
  football: "🏈",
  mma: "🥋",
  boxing: "🥊",
};

router.get("/sports", async (_req, res): Promise<void> => {
  const rows = await db.select().from(oddsEventsTable);
  const counts = new Map<string, number>();

  for (const row of rows) {
    counts.set(row.sport, (counts.get(row.sport) ?? 0) + 1);
  }

  const sports = [...counts.entries()]
    .map(([slug, eventCount]) => {
      const name = slug
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      return {
        slug,
        name,
        icon: sportIcons[slug] ?? "🎯",
        eventCount,
      };
    })
    .sort((a, b) => b.eventCount - a.eventCount);

  res.json(GetSportsResponse.parse(sports));
});

router.get("/sports/:sportSlug/leagues", async (req, res): Promise<void> => {
  const params = GetLeaguesBySportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(oddsEventsTable);
  const byLeague = new Map<string, { slug: string; name: string; sport: string; country: string; eventCount: number }>();
  for (const row of rows) {
    if (row.sport !== params.data.sportSlug) continue;
    const existing = byLeague.get(row.league);
    if (existing) {
      existing.eventCount += 1;
      continue;
    }
    byLeague.set(row.league, {
      slug: row.league,
      name: row.leagueName,
      sport: row.sport,
      country: "Unknown",
      eventCount: 1,
    });
  }

  const leagues = [...byLeague.values()].sort((a, b) => b.eventCount - a.eventCount);
  res.json(GetLeaguesBySportResponse.parse(leagues));
});

export default router;
