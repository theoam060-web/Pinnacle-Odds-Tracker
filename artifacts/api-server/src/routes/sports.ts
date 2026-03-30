import { Router, type IRouter } from "express";
import { GetLeaguesBySportParams, GetLeaguesBySportResponse, GetSportsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const sportsData = [
  { slug: "soccer", name: "Football", icon: "⚽", eventCount: 48 },
  { slug: "basketball", name: "Basketball", icon: "🏀", eventCount: 32 },
  { slug: "tennis", name: "Tennis", icon: "🎾", eventCount: 28 },
  { slug: "hockey", name: "Ice Hockey", icon: "🏒", eventCount: 21 },
  { slug: "baseball", name: "Baseball", icon: "⚾", eventCount: 15 },
  { slug: "american_football", name: "American Football", icon: "🏈", eventCount: 12 },
  { slug: "boxing", name: "Boxing", icon: "🥊", eventCount: 6 },
  { slug: "mma", name: "MMA", icon: "🥋", eventCount: 8 },
];

const leaguesData: Record<string, Array<{ slug: string; name: string; sport: string; country: string; eventCount: number }>> = {
  soccer: [
    { slug: "premier_league", name: "Premier League", sport: "soccer", country: "England", eventCount: 10 },
    { slug: "la_liga", name: "La Liga", sport: "soccer", country: "Spain", eventCount: 9 },
    { slug: "bundesliga", name: "Bundesliga", sport: "soccer", country: "Germany", eventCount: 9 },
    { slug: "serie_a", name: "Serie A", sport: "soccer", country: "Italy", eventCount: 10 },
    { slug: "ligue_1", name: "Ligue 1", sport: "soccer", country: "France", eventCount: 10 },
    { slug: "champions_league", name: "UEFA Champions League", sport: "soccer", country: "Europe", eventCount: 8 },
  ],
  basketball: [
    { slug: "nba", name: "NBA", sport: "basketball", country: "USA", eventCount: 15 },
    { slug: "euroleague", name: "EuroLeague", sport: "basketball", country: "Europe", eventCount: 8 },
    { slug: "ncaa", name: "NCAA Men's", sport: "basketball", country: "USA", eventCount: 9 },
  ],
  tennis: [
    { slug: "atp", name: "ATP Tour", sport: "tennis", country: "International", eventCount: 16 },
    { slug: "wta", name: "WTA Tour", sport: "tennis", country: "International", eventCount: 12 },
  ],
  hockey: [
    { slug: "nhl", name: "NHL", sport: "hockey", country: "USA/Canada", eventCount: 14 },
    { slug: "khl", name: "KHL", sport: "hockey", country: "Russia", eventCount: 7 },
  ],
  baseball: [
    { slug: "mlb", name: "MLB", sport: "baseball", country: "USA", eventCount: 15 },
  ],
  american_football: [
    { slug: "nfl", name: "NFL", sport: "american_football", country: "USA", eventCount: 12 },
  ],
  boxing: [
    { slug: "wbc", name: "WBC", sport: "boxing", country: "International", eventCount: 3 },
    { slug: "wba", name: "WBA", sport: "boxing", country: "International", eventCount: 3 },
  ],
  mma: [
    { slug: "ufc", name: "UFC", sport: "mma", country: "International", eventCount: 8 },
  ],
};

router.get("/sports", async (_req, res): Promise<void> => {
  res.json(GetSportsResponse.parse(sportsData));
});

router.get("/sports/:sportSlug/leagues", async (req, res): Promise<void> => {
  const params = GetLeaguesBySportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const leagues = leaguesData[params.data.sportSlug] ?? [];
  res.json(GetLeaguesBySportResponse.parse(leagues));
});

export default router;
