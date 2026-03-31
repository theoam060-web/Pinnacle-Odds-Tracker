import { logger } from "./logger";

const BASE_URL = "https://pinnacle-odds.p.rapidapi.com";

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFromPinnacle(path: string, apiKey: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": "pinnacle-odds.p.rapidapi.com",
      "Accept-Encoding": "gzip",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinnacle API error ${response.status}: ${text}`);
  }

  return response.json();
}

const SPORT_IDS: Record<string, number> = {
  soccer: 29,
  basketball: 4,
  tennis: 33,
  hockey: 19,
  american_football: 15,
  baseball: 3,
};

const LEAGUE_NAME_TO_SLUG: Record<string, string> = {
  "England - Premier League": "premier_league",
  "Premier League": "premier_league",
  "Spain - La Liga": "la_liga",
  "La Liga": "la_liga",
  "Germany - Bundesliga": "bundesliga",
  "Bundesliga": "bundesliga",
  "Italy - Serie A": "serie_a",
  "Serie A": "serie_a",
  "France - Ligue 1": "ligue_1",
  "Ligue 1": "ligue_1",
  "UEFA Champions League": "champions_league",
  "Europe - UEFA Champions League": "champions_league",
  "NBA": "nba",
  "USA - NBA": "nba",
  "EuroLeague": "euroleague",
  "USA - NCAA Basketball": "ncaa",
  "ATP": "atp",
  "WTA": "wta",
  "NHL": "nhl",
  "USA - NHL": "nhl",
  "USA - MLB": "mlb",
  "MLB": "mlb",
  "USA - NFL": "nfl",
  "NFL": "nfl",
  "UFC": "ufc",
};

function leagueNameToSlug(name: string): string {
  const direct = LEAGUE_NAME_TO_SLUG[name];
  if (direct) return direct;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

interface PinnacleApiPeriod {
  number: number;
  moneyline?: { home: number; draw?: number; away: number };
  spreads?: Array<{ hdp: number; home: number; away: number }>;
  totals?: Array<{ points: number; over: number; under: number }>;
}

interface PinnacleApiEvent {
  id: number;
  starts: string;
  home: string;
  away: string;
  periods?: PinnacleApiPeriod[];
}

interface PinnacleApiLeague {
  id: number;
  name: string;
  events?: PinnacleApiEvent[];
}

interface PinnacleApiResponse {
  sport_id: number;
  last?: number;
  leagues?: PinnacleApiLeague[];
  events?: PinnacleApiEvent[];
}

export interface NormalizedEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  commenceTime: Date;
  marketType: "moneyline" | "spread" | "total" | "asian_handicap";
  lines: Array<{
    selection: string;
    openingOdds: number;
    currentOdds: number;
    changePercent: number;
    changeAbsolute: number;
    direction: "drop" | "rise" | "stable";
  }>;
}

function extractPeriod(periods: PinnacleApiPeriod[] | undefined): PinnacleApiPeriod | undefined {
  if (!periods || periods.length === 0) return undefined;
  return periods.find(p => p.number === 0) ?? periods[0];
}

function buildOddsLine(
  selection: string,
  price: number,
): NormalizedEvent["lines"][number] {
  const odds = parseFloat(price.toFixed(3));
  return {
    selection,
    openingOdds: odds,
    currentOdds: odds,
    changePercent: 0,
    changeAbsolute: 0,
    direction: "stable",
  };
}

function normalizeEvent(
  ev: PinnacleApiEvent,
  sportSlug: string,
  leagueName: string,
): NormalizedEvent | null {
  const period = extractPeriod(ev.periods);
  if (!period) return null;

  let lines: NormalizedEvent["lines"] = [];
  let marketType: NormalizedEvent["marketType"] = "moneyline";

  if (period.moneyline) {
    const ml = period.moneyline;
    lines = [buildOddsLine(ev.home, ml.home), buildOddsLine(ev.away, ml.away)];
    if (ml.draw !== undefined && ml.draw > 0) {
      lines.push(buildOddsLine("Draw", ml.draw));
    }
    marketType = "moneyline";
  } else if (period.spreads && period.spreads.length > 0) {
    const s = period.spreads[0];
    lines = [
      buildOddsLine(`${ev.home} ${s.hdp >= 0 ? "+" : ""}${s.hdp}`, s.home),
      buildOddsLine(`${ev.away} ${-s.hdp >= 0 ? "+" : ""}${-s.hdp}`, s.away),
    ];
    marketType = "spread";
  } else if (period.totals && period.totals.length > 0) {
    const t = period.totals[0];
    lines = [
      buildOddsLine(`Over ${t.points}`, t.over),
      buildOddsLine(`Under ${t.points}`, t.under),
    ];
    marketType = "total";
  }

  if (lines.length === 0) return null;

  return {
    id: `pin-${ev.id}`,
    homeTeam: ev.home,
    awayTeam: ev.away,
    sport: sportSlug,
    league: leagueNameToSlug(leagueName),
    leagueName,
    commenceTime: new Date(ev.starts),
    marketType,
    lines,
  };
}

export async function fetchPinnacleOdds(apiKey: string): Promise<NormalizedEvent[]> {
  const results: NormalizedEvent[] = [];
  const sportSlugs = Object.keys(SPORT_IDS);

  for (let i = 0; i < sportSlugs.length; i++) {
    const sportSlug = sportSlugs[i];
    const sportId = SPORT_IDS[sportSlug];

    if (i > 0) {
      await delay(1200);
    }

    try {
      const data = await fetchFromPinnacle(
        `/kit/v1/markets?sport_id=${sportId}&is_live=false&odds_format=decimal`,
        apiKey,
      ) as PinnacleApiResponse;

      if (data.leagues && Array.isArray(data.leagues)) {
        for (const league of data.leagues) {
          if (!league.events) continue;
          for (const ev of league.events) {
            const normalized = normalizeEvent(ev, sportSlug, league.name);
            if (normalized) results.push(normalized);
          }
        }
      } else if (data.events && Array.isArray(data.events)) {
        for (const ev of data.events) {
          const normalized = normalizeEvent(ev, sportSlug, sportSlug);
          if (normalized) results.push(normalized);
        }
      }

      logger.info({ sportSlug, count: results.length }, "Fetched sport odds");
    } catch (err) {
      logger.warn({ err, sportSlug }, "Failed to fetch Pinnacle odds for sport");
    }
  }

  return results;
}
