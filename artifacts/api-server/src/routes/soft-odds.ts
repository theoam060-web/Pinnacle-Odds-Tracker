import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ODDS_API_BASE = "https://odds.p.rapidapi.com/v4";
const RAPIDAPI_HOST = "odds.p.rapidapi.com";

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
    "soccer_sweden_allsvenskan",
    "soccer_sweden_superettan",
    "soccer_norway_eliteserien",
    "soccer_denmark_superliga",
    "soccer_finland_veikkausliiga",
    "soccer_austria_bundesliga",
    "soccer_switzerland_superleague",
    "soccer_belgium_first_div",
    "soccer_scotland_premiership",
    "soccer_greece_super_league",
    "soccer_czech_republic_liga",
    "soccer_poland_ekstraklasa",
    "soccer_russia_premier_league",
    "soccer_usa_mls",
  ],
  basketball: [
    "basketball_nba",
    "basketball_euroleague",
    "basketball_nba_preseason",
    "basketball_ncaab",
    "basketball_nbl",
    "basketball_eurocup",
    "basketball_spain_acb",
    "basketball_france_pro_a",
    "basketball_italy_lega_basket",
    "basketball_germany_bbl",
    "basketball_turkey_bsl",
    "basketball_russia_vbl",
    "basketball_greece_basket_league",
    "basketball_japan_b_league",
    "basketball_australia_nbl",
    "basketball_cba",
  ],
  hockey: [
    "icehockey_nhl",
    "icehockey_sweden_hockey_league",
    "icehockey_sweden_allsvenskan",
    "icehockey_finland_liiga",
    "icehockey_ahl",
    "icehockey_russia_khl",
    "icehockey_czech_extraliga",
    "icehockey_slovakia_extraliga",
    "icehockey_switzerland_nla",
    "icehockey_germany_del",
    "icehockey_austria_ahl",
  ],
  american_football: ["americanfootball_nfl", "americanfootball_ncaaf"],
  baseball: ["baseball_mlb", "baseball_npb", "baseball_kbo"],
  tennis: [],
  mma: ["mma_mixed_martial_arts"],
  boxing: ["boxing_boxing"],
  volleyball: [],
  handball: [],
  all: [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_italy_serie_a",
    "basketball_nba",
    "basketball_euroleague",
    "icehockey_nhl",
    "icehockey_sweden_hockey_league",
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

const sportCache = new Map<string, CacheEntry>();
const eventCache = new Map<string, { data: OddsApiEvent; fetchedAt: number }>();
const CACHE_TTL_MS = 60_000;

// Leagues The Odds API is known to cover (for user-facing messages)
const COVERED_SPORTS = new Set([
  "soccer", "basketball", "hockey", "american_football", "baseball", "mma", "boxing",
]);

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
  // One is a substring of the other
  if (na.includes(nb) || nb.includes(na)) return true;
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
  // Allow up to 3 hours difference — Pinnacle and The Odds API may store
  // kickoff times with different timezone offsets or rounding.
  if (Math.abs(targetMs - eventMs) > 3 * 60 * 60 * 1000) return false;

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
  const cached = sportCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    regions: "eu,uk,us,au",
    markets,
    bookmakers: bookmakers.join(","),
    oddsFormat: "decimal",
  });

  const url = `${ODDS_API_BASE}/sports/${sportKey}/odds?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": RAPIDAPI_HOST,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // 422 = invalid sport key — just return empty silently
    if (res.status === 422 || res.status === 404) {
      return [];
    }
    const text = await res.text();
    throw new Error(`The Odds API error ${res.status}: ${text}`);
  }

  const data: OddsApiEvent[] = await res.json() as OddsApiEvent[];
  sportCache.set(cacheKey, { data, fetchedAt: Date.now() });
  return data;
}

function makeEventCacheKey(
  homeTeam: string,
  awayTeam: string,
  commenceTime: string,
  bookmakers: string[],
  market: string,
): string {
  const t = new Date(commenceTime).getTime();
  return `${homeTeam.toLowerCase()}|${awayTeam.toLowerCase()}|${t}|${bookmakers.sort().join(",")}|${market}`;
}

/**
 * GET /compare — full bookmaker odds comparison for a given match.
 * Fetches ALL bookmakers from The Odds API (no filter) and returns them
 * with the best odds per outcome marked. Includes Pinnacle as a reference.
 */
router.get("/compare", async (req, res): Promise<void> => {
  const apiKey = process.env["ODDS_API_KEY"];
  if (!apiKey) {
    res.status(503).json({ error: "Bookmaker comparison temporarily unavailable." });
    return;
  }

  const { homeTeam, awayTeam, sport, commenceTime, marketType } =
    req.query as Record<string, string>;

  if (!homeTeam || !awayTeam || !sport || !commenceTime) {
    res.status(400).json({ error: "Missing required params: homeTeam, awayTeam, sport, commenceTime" });
    return;
  }

  const oddsMarket = MARKET_TYPE_MAP[marketType ?? "moneyline"] ?? "h2h";
  const sportKeys = SPORT_KEY_MAP[sport] ?? SPORT_KEY_MAP["all"] ?? [];

  if (sportKeys.length === 0) {
    res.json({ found: false, message: `No coverage for sport: ${sport}` });
    return;
  }

  // Fetch with ALL bookmakers (empty = all available) and eu+uk+us regions
  const allRegions = "eu,uk,us,au";
  let matchedEvent: OddsApiEvent | null = null;

  for (const sportKey of sportKeys) {
    try {
      // Use a separate cache key for "all bookmakers" fetches
      const cacheKey = `compare:${sportKey}:all:${oddsMarket}`;
      const cached = sportCache.get(cacheKey);
      let events: OddsApiEvent[];

      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        events = cached.data;
      } else {
        const params = new URLSearchParams({
          regions: allRegions,
          markets: oddsMarket,
          oddsFormat: "decimal",
        });
        const url = `${ODDS_API_BASE}/sports/${sportKey}/odds?${params.toString()}`;
        const resp = await fetch(url, {
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        });
        if (!resp.ok) {
          if (resp.status === 422 || resp.status === 404) continue;
          throw new Error(`Odds API ${resp.status}`);
        }
        events = await resp.json() as OddsApiEvent[];
        sportCache.set(cacheKey, { data: events, fetchedAt: Date.now() });
      }

      const found = events.find(e => eventMatches(e, homeTeam, awayTeam, commenceTime));
      if (found) {
        matchedEvent = found;
        break;
      }
    } catch (err) {
      logger.warn({ err, sportKey }, "Compare fetch failed for sport key");
    }
  }

  if (!matchedEvent) {
    res.json({ found: false, message: "Match not found in The Odds API." });
    return;
  }

  // Build outcome list from all bookmakers
  const outcomeNames = new Set<string>();
  for (const bm of matchedEvent.bookmakers) {
    const market = bm.markets.find(m => m.key === oddsMarket);
    if (market) {
      for (const o of market.outcomes) outcomeNames.add(o.name);
    }
  }
  const outcomes = [...outcomeNames];

  // Find best odds per outcome across all bookmakers
  const bestOdds = new Map<string, { price: number; bookmakerKey: string; bookmakerTitle: string }>();
  for (const bm of matchedEvent.bookmakers) {
    const market = bm.markets.find(m => m.key === oddsMarket);
    if (!market) continue;
    for (const o of market.outcomes) {
      const current = bestOdds.get(o.name);
      if (!current || o.price > current.price) {
        bestOdds.set(o.name, { price: o.price, bookmakerKey: bm.key, bookmakerTitle: bm.title });
      }
    }
  }

  // Build bookmaker rows — Pinnacle first
  const bookmakerRows = matchedEvent.bookmakers
    .sort((a, b) => {
      if (a.key === "pinnacle") return -1;
      if (b.key === "pinnacle") return 1;
      return a.title.localeCompare(b.title);
    })
    .map(bm => {
      const market = bm.markets.find(m => m.key === oddsMarket);
      const oddsMap: Record<string, { price: number; isBest: boolean; margin: number | null }> = {};

      for (const outcomeName of outcomes) {
        const o = market?.outcomes.find(x => x.name === outcomeName);
        if (o) {
          const best = bestOdds.get(outcomeName);
          const isBest = best?.bookmakerKey === bm.key;
          const pinnacleRow = matchedEvent!.bookmakers.find(b => b.key === "pinnacle");
          const pinnacleMarket = pinnacleRow?.markets.find(m => m.key === oddsMarket);
          const pinnacleOutcome = pinnacleMarket?.outcomes.find(x => x.name === outcomeName);
          const margin = pinnacleOutcome
            ? parseFloat((((o.price - pinnacleOutcome.price) / pinnacleOutcome.price) * 100).toFixed(1))
            : null;
          oddsMap[outcomeName] = { price: o.price, isBest, margin };
        }
      }

      return {
        key: bm.key,
        title: bm.title,
        isPinnacle: bm.key === "pinnacle",
        lastUpdate: bm.last_update,
        odds: oddsMap,
      };
    });

  res.json({
    found: true,
    homeTeam: matchedEvent.home_team,
    awayTeam: matchedEvent.away_team,
    sportTitle: matchedEvent.sport_title,
    commenceTime: matchedEvent.commence_time,
    marketType: oddsMarket,
    outcomes,
    bookmakers: bookmakerRows,
    bestOdds: Object.fromEntries(bestOdds),
  });
});

router.get("/soft-odds", async (req, res): Promise<void> => {
  const apiKey = process.env["ODDS_API_KEY"];
  if (!apiKey) {
    res.status(503).json({
      error: "Bookmaker comparison temporarily unavailable.",
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

  // If this sport has no league keys at all, tell the user immediately
  if (sportKeys.length === 0) {
    res.json({
      found: false,
      bookmakers: bookmakerKeys.map(key => ({ key, title: key, available: false, outcomes: null })),
      message: `The Odds API does not cover ${sport} odds comparison. Supported sports: soccer, basketball, hockey, baseball, american football.`,
      notCovered: true,
    });
    return;
  }

  const evtCacheKey = makeEventCacheKey(homeTeam, awayTeam, commenceTime, bookmakerKeys, oddsMarket);
  const cachedEvt = eventCache.get(evtCacheKey);
  let matchedEvent: OddsApiEvent | null = null;

  if (cachedEvt && Date.now() - cachedEvt.fetchedAt < CACHE_TTL_MS) {
    matchedEvent = cachedEvt.data;
  } else {
    for (const sportKey of sportKeys) {
      try {
        const events = await fetchSportOdds(sportKey, bookmakerKeys, oddsMarket, apiKey);
        const found = events.find(e => eventMatches(e, homeTeam, awayTeam, commenceTime));
        if (found) {
          matchedEvent = found;
          eventCache.set(evtCacheKey, { data: found, fetchedAt: Date.now() });
          break;
        }
      } catch (err) {
        logger.warn({ err, sportKey }, "The Odds API fetch failed for sport key");
      }
    }
  }

  if (!matchedEvent) {
    const isCovered = COVERED_SPORTS.has(sport);
    res.json({
      found: false,
      bookmakers: bookmakerKeys.map(key => ({ key, title: key, available: false, outcomes: null })),
      message: isCovered
        ? `This league isn't covered by The Odds API — only major leagues are supported.`
        : `The Odds API doesn't cover ${sport}. Supported sports: soccer, basketball, hockey, baseball.`,
      notCovered: !isCovered,
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
