/**
 * The Odds API poller — polls Pinnacle odds via RapidAPI (odds.p.rapidapi.com)
 * when the native Pinnacle guest-API is blocked or unavailable.
 *
 * Credit usage: 1 credit per sport key per call.
 * Default config: 4 sport keys × 1 call per poll = 4 credits/poll.
 * At 5-min intervals: 4 × 12 = 48 credits/hour → 500 credits ≈ 10 hours.
 */

import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq, like } from "drizzle-orm";
import { logger } from "./logger";
import {
  broadcastOddsDrop,
  broadcastOddsUpdate,
  type OddsDropEvent,
  type OddsEventUpdate,
} from "./sseManager";
import { sendTelegramDrop } from "./telegramNotifier";
import { purgeStaleEvents } from "./oddsGenerator";

const RAPIDAPI_BASE = "https://odds.p.rapidapi.com/v4";
const RAPIDAPI_HOST = "odds.p.rapidapi.com";

// Sports to monitor — ordered by relevance for live-drop detection.
// Currently active in April: NBA playoffs, NHL playoffs, EPL, MLB opening.
const DEFAULT_SPORT_KEYS = [
  "basketball_nba",
  "icehockey_nhl",
  "soccer_epl",
  "baseball_mlb",
];

// Markets to monitor.
// h2h only = 1 credit per sport per call. Adding spreads/totals multiplies cost by 2–3×.
// Use "h2h" for credit-efficient testing; add "h2h,spreads,totals" once credits are topped up.
const MARKETS = process.env["ODDS_API_MARKETS"] ?? "h2h";

// Map The Odds API market keys → our internal marketType
const MARKET_TYPE_MAP: Record<string, "moneyline" | "spread" | "total"> = {
  h2h: "moneyline",
  spreads: "spread",
  totals: "total",
};

// Map sport key → sport name
const SPORT_NAME_MAP: Record<string, string> = {
  basketball_nba: "basketball",
  basketball_ncaab: "basketball",
  icehockey_nhl: "hockey",
  soccer_epl: "soccer",
  soccer_spain_la_liga: "soccer",
  soccer_germany_bundesliga: "soccer",
  soccer_france_ligue_one: "soccer",
  soccer_italy_serie_a: "soccer",
  soccer_usa_mls: "soccer",
  soccer_brazil_campeonato: "soccer",
  soccer_argentina_primera_division: "soccer",
  soccer_sweden_allsvenskan: "soccer",
  soccer_norway_eliteserien: "soccer",
  soccer_denmark_superliga: "soccer",
  soccer_netherlands_eredivisie: "soccer",
  soccer_portugal_primeira_liga: "soccer",
  soccer_turkey_super_league: "soccer",
  soccer_austria_bundesliga: "soccer",
  soccer_switzerland_superleague: "soccer",
  soccer_belgium_first_div: "soccer",
  soccer_scotland_premiership: "soccer",
  soccer_greece_super_league: "soccer",
  soccer_czech_republic_liga: "soccer",
  soccer_poland_ekstraklasa: "soccer",
  soccer_russia_premier_league: "soccer",
  soccer_uefa_champs_league: "soccer",
  soccer_uefa_europa_league: "soccer",
  baseball_mlb: "baseball",
  baseball_npb: "baseball",
  americanfootball_nfl: "american_football",
  americanfootball_ncaaf: "american_football",
  mma_mixed_martial_arts: "mma",
  boxing_boxing: "boxing",
};

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
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

interface NormalizedEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  commenceTime: Date;
  marketType: "moneyline" | "spread" | "total";
  lines: Array<{
    selection: string;
    openingOdds: number;
    currentOdds: number;
    changePercent: number;
    changeAbsolute: number;
    direction: "drop" | "rise" | "stable";
    prevPolledOdds: number;
  }>;
}

// In-memory snapshot: eventId-marketType → Map<selection, lastPrice>
const priceSnapshot = new Map<string, Map<string, number>>();

let totalCreditUsed = 0;
let pollerTimer: ReturnType<typeof setTimeout> | null = null;

function calcChangePercent(opening: number, current: number): number {
  if (opening === 0) return 0;
  return parseFloat((((current - opening) / opening) * 100).toFixed(2));
}

function calcDirection(opening: number, current: number): "drop" | "rise" | "stable" {
  const diff = current - opening;
  if (Math.abs(diff) < 0.005) return "stable";
  return diff < 0 ? "drop" : "rise";
}

function leagueName(sportKey: string): { league: string; leagueName: string } {
  const map: Record<string, { league: string; leagueName: string }> = {
    basketball_nba: { league: "nba", leagueName: "NBA" },
    basketball_ncaab: { league: "ncaab", leagueName: "NCAA Basketball" },
    icehockey_nhl: { league: "nhl", leagueName: "NHL" },
    soccer_epl: { league: "epl", leagueName: "Premier League" },
    soccer_spain_la_liga: { league: "laliga", leagueName: "La Liga" },
    soccer_germany_bundesliga: { league: "bundesliga", leagueName: "Bundesliga" },
    soccer_france_ligue_one: { league: "ligue1", leagueName: "Ligue 1" },
    soccer_italy_serie_a: { league: "seriea", leagueName: "Serie A" },
    soccer_usa_mls: { league: "mls", leagueName: "MLS" },
    soccer_brazil_campeonato: { league: "brasileirao", leagueName: "Brasileirão" },
    soccer_argentina_primera_division: { league: "primeraa", leagueName: "Liga Profesional" },
    soccer_sweden_allsvenskan: { league: "allsvenskan", leagueName: "Allsvenskan" },
    soccer_norway_eliteserien: { league: "eliteserien", leagueName: "Eliteserien" },
    soccer_denmark_superliga: { league: "superliga", leagueName: "Superliga" },
    soccer_netherlands_eredivisie: { league: "eredivisie", leagueName: "Eredivisie" },
    soccer_portugal_primeira_liga: { league: "primeirad", leagueName: "Primeira Liga" },
    soccer_turkey_super_league: { league: "superslig", leagueName: "Süper Lig" },
    soccer_austria_bundesliga: { league: "austriabundesliga", leagueName: "Austrian Bundesliga" },
    soccer_switzerland_superleague: { league: "swisssuper", leagueName: "Swiss Super League" },
    soccer_belgium_first_div: { league: "jupilerleague", leagueName: "Jupiler Pro League" },
    soccer_scotland_premiership: { league: "scotprem", leagueName: "Scottish Premiership" },
    soccer_greece_super_league: { league: "greeksuper", leagueName: "Super League Greece" },
    soccer_czech_republic_liga: { league: "czliga", leagueName: "Czech Liga" },
    soccer_poland_ekstraklasa: { league: "ekstraklasa", leagueName: "Ekstraklasa" },
    soccer_russia_premier_league: { league: "rpl", leagueName: "Russian Premier League" },
    soccer_uefa_champs_league: { league: "ucl", leagueName: "UEFA Champions League" },
    soccer_uefa_europa_league: { league: "uel", leagueName: "UEFA Europa League" },
    baseball_mlb: { league: "mlb", leagueName: "MLB" },
    baseball_npb: { league: "npb", leagueName: "NPB" },
    americanfootball_nfl: { league: "nfl", leagueName: "NFL" },
    americanfootball_ncaaf: { league: "ncaaf", leagueName: "NCAAF" },
    mma_mixed_martial_arts: { league: "mma", leagueName: "MMA" },
    boxing_boxing: { league: "boxing", leagueName: "Boxing" },
  };
  return map[sportKey] ?? { league: sportKey, leagueName: sportKey };
}

async function fetchSportOdds(sportKey: string, apiKey: string): Promise<OddsApiEvent[]> {
  const params = new URLSearchParams({
    regions: "eu",
    markets: MARKETS,
    bookmakers: "pinnacle",
    oddsFormat: "decimal",
  });

  const url = `${RAPIDAPI_BASE}/sports/${sportKey}/odds?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  // Log remaining credits from response headers
  const remaining = res.headers.get("x-ratelimit-requests-remaining");
  const used = res.headers.get("x-ratelimit-requests-used");
  if (remaining !== null) {
    logger.info({ sportKey, remaining, used }, "The Odds API credit status");
  }

  if (!res.ok) {
    if (res.status === 422 || res.status === 404) return []; // unknown sport key
    if (res.status === 401 || res.status === 403) {
      throw new Error(`The Odds API auth failed (${res.status}) — check ODDS_API_KEY`);
    }
    if (res.status === 429) {
      throw new Error("The Odds API rate limit hit — slow down polling");
    }
    const text = await res.text();
    throw new Error(`The Odds API error ${res.status}: ${text.slice(0, 200)}`);
  }

  totalCreditUsed++;
  return res.json() as Promise<OddsApiEvent[]>;
}

function normalizeEvents(events: OddsApiEvent[], sportKey: string): NormalizedEvent[] {
  const { league, leagueName: leagueNameStr } = leagueName(sportKey);
  const sport = SPORT_NAME_MAP[sportKey] ?? "other";
  const now = Date.now();
  const results: NormalizedEvent[] = [];

  for (const ev of events) {
    const commenceTime = new Date(ev.commence_time);
    // Skip events that have already started (pre-match only)
    if (commenceTime.getTime() <= now) continue;

    const pinnacle = ev.bookmakers.find(b => b.key === "pinnacle");
    if (!pinnacle) continue;

    for (const market of pinnacle.markets) {
      const marketType = MARKET_TYPE_MAP[market.key];
      if (!marketType) continue;

      // Build a stable event ID from Odds API event ID + market key
      const eventId = `oa-${ev.id}-${market.key}`;

      const lines = market.outcomes.map(o => {
        const selection = o.point !== undefined
          ? `${o.name} ${o.point > 0 ? "+" : ""}${o.point}`
          : o.name.toLowerCase();
        return {
          selection,
          openingOdds: o.price,
          currentOdds: o.price,
          changePercent: 0,
          changeAbsolute: 0,
          direction: "stable" as const,
          prevPolledOdds: o.price,
        };
      });

      results.push({
        id: eventId,
        homeTeam: ev.home_team,
        awayTeam: ev.away_team,
        sport,
        league,
        leagueName: leagueNameStr,
        commenceTime,
        marketType,
        lines,
      });
    }
  }

  return results;
}

async function persistAndDetect(
  events: NormalizedEvent[],
  now: Date,
  minDropPercent: number,
): Promise<OddsDropEvent[]> {
  const drops: OddsDropEvent[] = [];

  for (const ev of events) {
    const snapshotKey = ev.id;
    const snap = priceSnapshot.get(snapshotKey);
    const isFirstSeen = !snap;

    const [existing] = await db
      .select()
      .from(oddsEventsTable)
      .where(eq(oddsEventsTable.id, ev.id));

    type StoredLine = {
      selection: string;
      openingOdds: number;
      currentOdds: number;
      prevPolledOdds: number;
      changePercent: number;
      changeAbsolute: number;
      direction: "drop" | "rise" | "stable";
    };
    const storedLines = existing ? (existing.lines as StoredLine[]) : null;

    const updatedLines = ev.lines.map(line => {
      const storedLine = storedLines?.find(l => l.selection === line.selection);
      const prevSnap = snap?.get(line.selection);

      const openingOdds = storedLine?.openingOdds ?? line.currentOdds;
      const prevPolledOdds = storedLine?.currentOdds ?? line.currentOdds;
      const currentOdds = line.currentOdds;

      const changePercent = calcChangePercent(openingOdds, currentOdds);
      const changeAbsolute = parseFloat((currentOdds - openingOdds).toFixed(3));
      const direction = calcDirection(openingOdds, currentOdds);

      // Poll-to-poll drop detection
      const pollDrop = prevSnap !== undefined
        ? calcChangePercent(prevSnap, currentOdds)
        : 0;

      return {
        selection: line.selection,
        openingOdds,
        prevPolledOdds,
        currentOdds,
        changePercent,
        changeAbsolute,
        direction,
        pollDrop,
      };
    });

    // Update snapshot
    const newSnap = new Map<string, number>();
    updatedLines.forEach(l => newSnap.set(l.selection, l.currentOdds));
    priceSnapshot.set(snapshotKey, newSnap);

    const biggestDrop = Math.min(0, ...updatedLines.map(l => l.changePercent));
    const biggestRise = Math.max(0, ...updatedLines.map(l => l.changePercent));
    const prevBiggestDrop = existing?.biggestDrop ?? 0;
    const persistedBiggestDrop = Math.min(prevBiggestDrop, biggestDrop);

    // Detect fresh poll-to-poll drops (not first-seen)
    let isNewDrop = false;
    if (!isFirstSeen && existing) {
      const freshDropLines = updatedLines.filter(
        l => l.pollDrop < -minDropPercent,
      );
      if (freshDropLines.length > 0) {
        isNewDrop = true;
      }
    }

    const newDropAt = isNewDrop ? now : (existing?.newDropAt ?? null);

    // Persist event
    const linesForDb = updatedLines.map(({ pollDrop: _p, ...l }) => l);

    if (!existing) {
      await db.insert(oddsEventsTable).values({
        id: ev.id,
        homeTeam: ev.homeTeam,
        awayTeam: ev.awayTeam,
        sport: ev.sport,
        league: ev.league,
        leagueName: ev.leagueName,
        commenceTime: ev.commenceTime,
        marketType: ev.marketType,
        lines: linesForDb,
        biggestDrop: persistedBiggestDrop,
        biggestRise,
        newDropAt,
        lastUpdated: now,
      }).onConflictDoNothing();
    } else {
      const hasChanges = JSON.stringify(existing.lines) !== JSON.stringify(linesForDb);
      if (hasChanges || isNewDrop) {
        await db.update(oddsEventsTable).set({
          homeTeam: ev.homeTeam,
          awayTeam: ev.awayTeam,
          commenceTime: ev.commenceTime,
          lines: linesForDb,
          biggestDrop: persistedBiggestDrop,
          biggestRise,
          newDropAt,
          lastUpdated: now,
        }).where(eq(oddsEventsTable.id, ev.id));
      }
    }

    // Store movements when odds changed
    for (const line of updatedLines) {
      const storedLine = storedLines?.find(l => l.selection === line.selection);
      const oddsChanged = !storedLine ||
        Math.abs(storedLine.currentOdds - line.currentOdds) > 0.0005;
      if (oddsChanged) {
        await db.insert(oddsMovementsTable).values({
          eventId: ev.id,
          selection: line.selection,
          odds: line.currentOdds,
          limit: null, // The Odds API doesn't provide stake limits
          recordedAt: now,
        }).onConflictDoNothing();
      }
    }

    // Broadcast SSE update
    const update: OddsEventUpdate = {
      id: ev.id,
      homeTeam: ev.homeTeam,
      awayTeam: ev.awayTeam,
      sport: ev.sport,
      league: ev.league,
      leagueName: ev.leagueName,
      commenceTime: ev.commenceTime.toISOString(),
      marketType: ev.marketType,
      lines: linesForDb,
      biggestDrop: persistedBiggestDrop,
      biggestRise,
      newDropAt: newDropAt ? newDropAt.toISOString() : null,
      lastUpdated: now.toISOString(),
    };
    broadcastOddsUpdate(update);

    // Fire drop alert
    if (isNewDrop) {
      const freshDropLines = updatedLines
        .filter(l => l.pollDrop < -minDropPercent)
        .sort((a, b) => a.pollDrop - b.pollDrop);
      const droppedLine = freshDropLines[0];
      if (droppedLine) {
        const drop: OddsDropEvent = {
          eventId: ev.id,
          homeTeam: ev.homeTeam,
          awayTeam: ev.awayTeam,
          sport: ev.sport,
          league: ev.league,
          leagueName: ev.leagueName,
          selection: droppedLine.selection,
          openingOdds: droppedLine.openingOdds,
          currentOdds: droppedLine.currentOdds,
          changePercent: droppedLine.changePercent,
          direction: "drop",
          detectedAt: now.toISOString(),
        };
        drops.push(drop);
        broadcastOddsDrop(drop);
        sendTelegramDrop(drop).catch(err => logger.warn({ err }, "Telegram drop notification failed"));
      }
    }
  }

  return drops;
}

async function pollOddsApi(
  apiKey: string,
  sportKeys: string[],
  minDropPercent: number,
): Promise<void> {
  logger.info({ sports: sportKeys.length, totalCreditUsed }, "The Odds API poll starting…");
  const now = new Date();

  let totalEvents = 0;
  let totalDrops = 0;

  for (const sportKey of sportKeys) {
    try {
      const raw = await fetchSportOdds(sportKey, apiKey);
      const normalized = normalizeEvents(raw, sportKey);
      totalEvents += normalized.length;

      const drops = await persistAndDetect(normalized, now, minDropPercent);
      totalDrops += drops.length;

      if (drops.length > 0) {
        logger.info(
          { sportKey, events: normalized.length, drops: drops.length },
          "Odds drops detected via The Odds API",
        );
      }

      // Small delay between sport requests to be polite to the API
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      logger.warn({ err, sportKey }, "The Odds API fetch failed for sport key");
    }
  }

  logger.info(
    { totalEvents, totalDrops, totalCreditUsed, sports: sportKeys.length },
    "The Odds API poll complete",
  );
}

/**
 * Start the The Odds API poller.
 * Only runs when ODDS_API_KEY is set and MOCK_MODE=false.
 */
export function startOddsApiPoller(
  apiKey: string,
  intervalMs: number,
  minDropPercent: number,
): void {
  // Parse custom sport keys from env, or use defaults
  const sportKeysEnv = process.env["ODDS_API_SPORT_KEYS"];
  const sportKeys = sportKeysEnv
    ? sportKeysEnv.split(",").map(s => s.trim()).filter(Boolean)
    : DEFAULT_SPORT_KEYS;

  const creditEstimatePerHour = Math.round((sportKeys.length * (3_600_000 / intervalMs)));
  logger.info(
    {
      intervalMs,
      minDropPercent,
      sports: sportKeys,
      estimatedCreditsPerHour: creditEstimatePerHour,
    },
    "Starting The Odds API poller (Pinnacle odds via RapidAPI)",
  );

  // Purge stale events on startup and hourly
  purgeStaleEvents().catch(err => logger.warn({ err }, "Startup stale-event purge failed"));
  setInterval(() => {
    purgeStaleEvents().catch(err => logger.warn({ err }, "Periodic stale-event purge failed"));
  }, 60 * 60 * 1000);

  const tick = async () => {
    try {
      await pollOddsApi(apiKey, sportKeys, minDropPercent);
    } catch (err) {
      logger.error({ err }, "The Odds API poll tick failed");
    } finally {
      pollerTimer = setTimeout(tick, intervalMs);
    }
  };

  tick();
}

export function stopOddsApiPoller(): void {
  if (pollerTimer !== null) {
    clearTimeout(pollerTimer);
    pollerTimer = null;
  }
}
