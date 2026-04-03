import { logger } from "./logger";

const SPORT_MAP: Record<string, string> = {
  soccer: "Soccer",
  basketball: "Basketball",
  tennis: "Tennis",
  hockey: "Ice Hockey",
  football: "American Football",
  baseball: "Baseball",
};

export interface ResolveRequest {
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  sport: string;
  marketType: string;
  selection: string;
}

export interface ResolveResult {
  index: number;
  result: "win" | "loss" | "void" | null;
  homeScore: number | null;
  awayScore: number | null;
  matchedEvent: string | null;
}

interface SportsDbEvent {
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
}

// Cache fetched results to avoid redundant API calls per request
const dayCache = new Map<string, SportsDbEvent[]>();

async function fetchEventsForDay(date: string, sport: string): Promise<SportsDbEvent[]> {
  const key = `${date}::${sport}`;
  if (dayCache.has(key)) return dayCache.get(key)!;

  const sportsDbSport = SPORT_MAP[sport.toLowerCase()] ?? "Soccer";
  const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=${encodeURIComponent(sportsDbSport)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { events: SportsDbEvent[] | null };
    const events = json.events ?? [];
    dayCache.set(key, events);
    // Evict after 10 min so scores update if needed
    setTimeout(() => dayCache.delete(key), 10 * 60 * 1000);
    return events;
  } catch (err) {
    logger.warn({ err, url }, "resultsResolver: fetch failed");
    return [];
  }
}

/** Normalise team name for fuzzy comparison */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(fc|sc|cf|ac|rc|bk|af|afc|fk|sk|rk|united|city|town|athletic|atletico|real|club|de|du|los|las|el|la|the)\b/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word-overlap similarity in [0,1] */
function similarity(a: string, b: string): number {
  const wa = new Set(normalise(a).split(" ").filter(Boolean));
  const wb = new Set(normalise(b).split(" ").filter(Boolean));
  if (wa.size === 0 || wb.size === 0) return 0;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.max(wa.size, wb.size);
}

function matchEvent(events: SportsDbEvent[], homeTeam: string, awayTeam: string): SportsDbEvent | null {
  let bestScore = 0;
  let bestEvent: SportsDbEvent | null = null;

  for (const ev of events) {
    const score =
      (similarity(ev.strHomeTeam, homeTeam) + similarity(ev.strAwayTeam, awayTeam)) / 2;
    if (score > bestScore) {
      bestScore = score;
      bestEvent = ev;
    }
  }

  // Require at least 50% word overlap on average
  return bestScore >= 0.5 ? bestEvent : null;
}

/** Determine bet result from final scores and selection */
function resolveFromScores(
  homeScore: number,
  awayScore: number,
  marketType: string,
  selection: string,
): "win" | "loss" | "void" {
  const [dir, ...rest] = selection.trim().split(" ");
  const direction = dir.toLowerCase();
  const line = rest.length > 0 ? parseFloat(rest.join(" ")) : NaN;

  if (marketType === "moneyline") {
    if (homeScore === awayScore) {
      return direction === "draw" ? "win" : "loss";
    } else if (homeScore > awayScore) {
      return direction === "home" ? "win" : "loss";
    } else {
      return direction === "away" ? "win" : "loss";
    }
  }

  if (marketType === "spread") {
    // Positive line = home give handicap, negative = home receive
    if (isNaN(line)) return "void";
    const adjusted = homeScore + line;
    if (adjusted === awayScore) return "void"; // push
    if (direction === "home") {
      return adjusted > awayScore ? "win" : "loss";
    } else {
      // Away bet: away team must beat home + line
      return awayScore > homeScore + line ? "win" : "loss";
    }
  }

  if (marketType === "total") {
    if (isNaN(line)) return "void";
    const total = homeScore + awayScore;
    if (total === line) return "void"; // push
    if (direction === "over") return total > line ? "win" : "loss";
    return total < line ? "win" : "loss";
  }

  return "void";
}

const FINISHED_STATUSES = new Set(["Match Finished", "FT", "AET", "PEN", "Full Time", "Finished"]);

export async function resolveResults(requests: ResolveRequest[]): Promise<ResolveResult[]> {
  // Group by date+sport to minimise API calls
  const groups = new Map<string, number[]>();
  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    const date = req.commenceTime.slice(0, 10); // YYYY-MM-DD
    const key = `${date}::${req.sport}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(i);
  }

  // Pre-fetch all needed days in parallel
  await Promise.all(
    [...groups.keys()].map(key => {
      const [date, sport] = key.split("::");
      return fetchEventsForDay(date, sport);
    }),
  );

  const results: ResolveResult[] = [];

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    const date = req.commenceTime.slice(0, 10);
    const events = await fetchEventsForDay(date, req.sport);
    const match = matchEvent(events, req.homeTeam, req.awayTeam);

    if (!match) {
      results.push({ index: i, result: null, homeScore: null, awayScore: null, matchedEvent: null });
      continue;
    }

    const homeScore = match.intHomeScore !== null ? parseInt(match.intHomeScore, 10) : null;
    const awayScore = match.intAwayScore !== null ? parseInt(match.intAwayScore, 10) : null;
    // Consider finished if status says so OR if scores exist (some events have null status but valid scores)
    const scoresAvailable = homeScore !== null && awayScore !== null && !isNaN(homeScore) && !isNaN(awayScore);
    const finished = FINISHED_STATUSES.has(match.strStatus) || (match.strStatus === null && scoresAvailable);

    if (!finished || !scoresAvailable) {
      results.push({
        index: i,
        result: null,
        homeScore,
        awayScore,
        matchedEvent: `${match.strHomeTeam} vs ${match.strAwayTeam}`,
      });
      continue;
    }

    const betResult = resolveFromScores(homeScore, awayScore, req.marketType, req.selection);

    results.push({
      index: i,
      result: betResult,
      homeScore,
      awayScore,
      matchedEvent: `${match.strHomeTeam} vs ${match.strAwayTeam} (${homeScore}-${awayScore})`,
    });
  }

  return results;
}
