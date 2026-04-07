import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

const SPORT_KEY_MAP: Record<string, string[]> = {
  soccer: [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_italy_serie_a",
    "soccer_uefa_champs_league",
    "soccer_uefa_europa_league",
    "soccer_netherlands_eredivisie",
    "soccer_portugal_primeira_liga",
    "soccer_turkey_super_league",
    "soccer_brazil_campeonato",
    "soccer_argentina_primera_division",
  ],
  basketball: ["basketball_nba", "basketball_euroleague", "basketball_nba_preseason"],
  hockey: ["icehockey_nhl"],
  american_football: ["americanfootball_nfl", "americanfootball_ncaaf"],
  baseball: ["baseball_mlb"],
  tennis: [],
  mma: ["mma_mixed_martial_arts"],
  boxing: ["boxing_boxing"],
  all: [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "basketball_nba",
    "icehockey_nhl",
    "americanfootball_nfl",
    "baseball_mlb",
  ],
};

const MARKET_TYPE_MAP: Record<string, string> = {
  moneyline: "h2h",
  spread: "spreads",
  total: "totals",
  team_total: "totals",
  draw_no_bet: "h2h",
  btts: "h2h",
  corners: "h2h",
  bookings: "h2h",
};

interface CacheEntry {
  data: OddsApiEvent[];
  fetchedAt: number;
}

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatchTeam(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return true;
  const wordsA = na.split(" ");
  const wordsB = nb.split(" ");
  const shared = wordsA.filter(w => w.length > 2 && wordsB.includes(w));
  return shared.length >= Math.min(1, Math.min(wordsA.length, wordsB.length));
}

function eventMatches(
  event: OddsApiEvent,
  homeTeam: string,
  awayTeam: string,
  commenceTime: string,
): boolean {
  const targetMs = new Date(commenceTime).getTime();
  const eventMs = new Date(event.commence_time).getTime();
  if (Math.abs(targetMs - eventMs) > 5 * 60 * 1000) return false;

  const homeMatch =
    fuzzyMatchTeam(event.home_team, homeTeam) ||
    fuzzyMatchTeam(event.away_team, homeTeam);
  const awayMatch =
    fuzzyMatchTeam(event.away_team, awayTeam) ||
    fuzzyMatchTeam(event.home_team, awayTeam);

  return homeMatch && awayMatch;
}

async function fetchSportOdds(
  sportKey: string,
  bookmakers: string[],
  markets: string,
  apiKey: string,
): Promise<OddsApiEvent[]> {
  const cacheKey = `${sportKey}:${bookmakers.sort().join(",")}:${markets}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    apiKey,
    regions: "eu,uk,us",
    markets,
    bookmakers: bookmakers.join(","),
    oddsFormat: "decimal",
  });

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 422) {
      return [];
    }
    const text = await res.text();
    throw new Error(`The Odds API error ${res.status}: ${text}`);
  }

  const data: OddsApiEvent[] = await res.json() as OddsApiEvent[];
  cache.set(cacheKey, { data, fetchedAt: Date.now() });
  return data;
}

router.get("/soft-odds", async (req, res): Promise<void> => {
  const apiKey = process.env["ODDS_API_KEY"];
  if (!apiKey) {
    res.status(503).json({
      error: "ODDS_API_KEY not configured",
      message:
        "Add your The Odds API key as the ODDS_API_KEY environment variable to enable bookmaker comparison.",
    });
    return;
  }

  const { homeTeam, awayTeam, sport, commenceTime, bookmakers: bookmakersParam, marketType } =
    req.query as Record<string, string>;

  if (!homeTeam || !awayTeam || !sport || !commenceTime) {
    res.status(400).json({ error: "Missing required params: homeTeam, awayTeam, sport, commenceTime" });
    return;
  }

  const bookmakerKeys = bookmakersParam
    ? bookmakersParam.split(",").map(b => b.trim()).filter(Boolean)
    : [];

  if (bookmakerKeys.length === 0) {
    res.json({
      found: false,
      bookmakers: [],
      message: "No bookmakers configured. Add bookmakers in Alert Configurations.",
    });
    return;
  }

  const oddsMarket = MARKET_TYPE_MAP[marketType ?? "moneyline"] ?? "h2h";
  const sportKeys = SPORT_KEY_MAP[sport] ?? SPORT_KEY_MAP["all"] ?? [];

  let matchedEvent: OddsApiEvent | null = null;

  for (const sportKey of sportKeys) {
    try {
      const events = await fetchSportOdds(sportKey, bookmakerKeys, oddsMarket, apiKey);
      const found = events.find(e => eventMatches(e, homeTeam, awayTeam, commenceTime));
      if (found) {
        matchedEvent = found;
        break;
      }
    } catch (err) {
      logger.warn({ err, sportKey }, "The Odds API fetch failed for sport key");
    }
  }

  if (!matchedEvent) {
    res.json({
      found: false,
      bookmakers: bookmakerKeys.map(key => ({
        key,
        title: key,
        available: false,
        outcomes: null,
      })),
      message: "Event not found in The Odds API for the configured bookmakers.",
    });
    return;
  }

  const pinnacleOddsFromFeed = req.query["pinnacleOdds"]
    ? parseFloat(req.query["pinnacleOdds"] as string)
    : null;

  const resultBookmakers = bookmakerKeys.map(key => {
    const bm = matchedEvent!.bookmakers.find(b => b.key === key);
    if (!bm) {
      return { key, title: key, available: false, outcomes: null };
    }

    const market = bm.markets.find(m => m.key === oddsMarket);
    if (!market) {
      return { key, title: bm.title, available: false, outcomes: null };
    }

    const outcomes = market.outcomes.map(o => {
      const delta =
        pinnacleOddsFromFeed != null && pinnacleOddsFromFeed > 1
          ? ((o.price - pinnacleOddsFromFeed) / pinnacleOddsFromFeed) * 100
          : null;
      return { name: o.name, price: o.price, point: o.point ?? null, delta };
    });

    return { key, title: bm.title, available: true, outcomes };
  });

  res.json({
    found: true,
    eventTitle: `${matchedEvent.home_team} vs ${matchedEvent.away_team}`,
    sportTitle: matchedEvent.sport_title,
    bookmakers: resultBookmakers,
  });
});

export default router;
