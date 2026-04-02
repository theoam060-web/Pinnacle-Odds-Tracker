import { logger } from "./logger";

const APP_CONFIG_URL = "https://www.pinnacle.com/config/app.json";
const DEFAULT_GUEST_ROOT = "https://guest.api.arcadia.pinnacle.com";
const DEFAULT_API_VERSION = "0.1";
const CONFIG_CACHE_MS = 10 * 60 * 1000;
const SPORT_DISCOVERY_TTL_MS = 2 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;
const INTER_SPORT_DELAY_MS = 300;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type MarketType = "moneyline" | "spread" | "total" | "team_total";

export interface NormalizedMarket {
  id: string;
  matchupId: number;
  marketKey: string;
  sportId: number;
  sport: string;
  leagueId: number;
  league: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  isLive: boolean;
  type: MarketType;
  period: number;
  isAlternate: boolean;
  status: string;
  cutoffAt: string | null;
  version: number | null;
  side: string | null;
  prices: NormalizedPrice[];
  maxRiskStake: number | null;
  rawKey: string;
}

export interface NormalizedPrice {
  designation: string;
  points: number | null;
  americanPrice: number;
  decimalPrice: number;
  participantId: number | null;
}

export interface NormalizedMatchup {
  id: number;
  parentId: number | null;
  type: "matchup" | "special";
  sportId: number;
  sport: string;
  leagueId: number;
  league: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  isLive: boolean;
  isHighlighted: boolean;
  status: string;
  participants: PinnacleParticipant[];
  periods: PinnaclePeriod[];
  totalMarketCount: number;
}

export interface PollResult {
  matchups: NormalizedMatchup[];
  markets: NormalizedMarket[];
  sportId: number;
  sport: string;
  fetchedAt: Date;
}

// ---------------------------------------------------------------------------
// Internal Pinnacle response types
// ---------------------------------------------------------------------------

interface PinnacleAppConfig {
  api?: {
    haywire?: {
      apiVersion?: string;
      apiKey?: string;
      routes?: {
        curacao?: { guestRoot?: string };
      };
    };
  };
}

interface PinnacleGuestConfig {
  apiKey: string;
  guestRoot: string;
  apiVersion: string;
}

interface PinnacleSport {
  id: number;
  name: string;
  matchupCount?: number;
  isFeatured?: boolean;
  isHidden?: boolean;
  primaryMarketType?: string;
}

export interface PinnacleParticipant {
  alignment?: "home" | "away" | "neutral";
  name: string;
  id?: number;
  order?: number;
  rotation?: number;
  state?: Record<string, unknown>;
  stats?: Array<Record<string, unknown>>;
}

export interface PinnaclePeriod {
  period: number;
  cutoffAt?: string | null;
  status?: string;
  hasMoneyline?: boolean;
  hasSpread?: boolean;
  hasTotal?: boolean;
  hasTeamTotal?: boolean;
}

interface PinnacleLeagueRef {
  id: number;
  name: string;
  group?: string;
  sport?: {
    id: number;
    name: string;
    primaryMarketType?: string;
  };
}

interface PinnacleMatchupRaw {
  id: number;
  parentId?: number | null;
  type?: "matchup" | "special";
  startTime?: string;
  isLive?: boolean;
  isHighlighted?: boolean;
  status?: string;
  league?: PinnacleLeagueRef;
  participants?: PinnacleParticipant[];
  parent?: {
    id?: number;
    participants?: PinnacleParticipant[];
    startTime?: string;
    isLive?: boolean;
  } | null;
  periods?: PinnaclePeriod[];
  totalMarketCount?: number;
}

interface PinnacleMarketPrice {
  designation?: string;
  points?: number;
  price: number;
  participantId?: number;
}

interface PinnacleMarketRaw {
  key: string;
  matchupId: number;
  period: number;
  isAlternate?: boolean;
  status?: string;
  type: string;
  side?: string;
  cutoffAt?: string;
  version?: number;
  prices: PinnacleMarketPrice[];
  limits?: Array<{ amount: number; type: string }>;
}

// ---------------------------------------------------------------------------
// Config discovery & caching
// ---------------------------------------------------------------------------

let configCache: { expiresAt: number; value: PinnacleGuestConfig } | null = null;
let sportsCatalogCache: { expiresAt: number; value: PinnacleSport[] } | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function fetchJsonWithRetry<T>(
  url: string,
  headers: Record<string, string>,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);
      const response = await fetch(url, {
        headers: { ...headers, "Accept-Encoding": "gzip" },
        signal: abortController.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Pinnacle API ${response.status} for ${url}: ${text.slice(0, 200)}`);
      }
      return (await response.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }
  throw lastError;
}

async function discoverGuestConfig(): Promise<PinnacleGuestConfig> {
  const now = Date.now();
  if (configCache && configCache.expiresAt > now) {
    return configCache.value;
  }

  const configuredKey = process.env["PINNACLE_API_KEY"]?.trim();
  if (configuredKey) {
    const value: PinnacleGuestConfig = {
      apiKey: configuredKey,
      guestRoot: process.env["PINNACLE_GUEST_ROOT"] ?? DEFAULT_GUEST_ROOT,
      apiVersion: DEFAULT_API_VERSION,
    };
    configCache = { expiresAt: now + CONFIG_CACHE_MS, value };
    return value;
  }

  try {
    const config = await fetchJsonWithRetry<PinnacleAppConfig>(APP_CONFIG_URL, {}, 1);
    const apiVersion = config.api?.haywire?.apiVersion ?? DEFAULT_API_VERSION;
    const apiKey = config.api?.haywire?.apiKey ?? "";
    const guestRoot = config.api?.haywire?.routes?.curacao?.guestRoot ?? DEFAULT_GUEST_ROOT;
    if (!apiKey) throw new Error("Missing guest API key in frontend config");
    const value = { apiKey, guestRoot, apiVersion };
    configCache = { expiresAt: now + CONFIG_CACHE_MS, value };
    return value;
  } catch (err) {
    logger.warn({ err }, "Failed to discover Pinnacle guest config, using fallback defaults");
    const value: PinnacleGuestConfig = { apiKey: "", guestRoot: DEFAULT_GUEST_ROOT, apiVersion: DEFAULT_API_VERSION };
    configCache = { expiresAt: now + 60_000, value };
    return value;
  }
}

function buildUrl(config: PinnacleGuestConfig, endpoint: string): string {
  return `${config.guestRoot}/${config.apiVersion}${endpoint}`;
}

async function fetchGuestApi<T>(config: PinnacleGuestConfig, endpoint: string): Promise<T> {
  if (!config.apiKey) {
    throw new Error("No Pinnacle guest API key available");
  }
  return fetchJsonWithRetry<T>(buildUrl(config, endpoint), {
    "X-API-Key": config.apiKey,
    "X-Language": process.env["PINNACLE_LANGUAGE"] ?? "en",
  });
}

// ---------------------------------------------------------------------------
// Sport discovery
// ---------------------------------------------------------------------------

function parseSportIdsFromEnv(): number[] | null {
  const raw = process.env["PINNACLE_SPORT_IDS"];
  if (!raw) return null;
  const values = raw.split(",").map((v) => Number.parseInt(v.trim(), 10)).filter((v) => Number.isFinite(v) && v > 0);
  return values.length ? values : null;
}

function parseSportNamesFromEnv(): string[] | null {
  const raw = process.env["PINNACLE_SPORT_NAMES"];
  if (!raw) return null;
  const values = raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  return values.length ? values : null;
}

export function parseMarketTypesFromEnv(): string[] | null {
  const raw = process.env["PINNACLE_MARKET_TYPES"];
  if (!raw) return null;
  const values = raw.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  return values.length ? values : null;
}

export async function fetchSportsCatalog(): Promise<PinnacleSport[]> {
  const config = await discoverGuestConfig();
  const now = Date.now();
  if (sportsCatalogCache && sportsCatalogCache.expiresAt > now) {
    return sportsCatalogCache.value;
  }
  const sports = await fetchGuestApi<PinnacleSport[]>(config, "/sports");
  sportsCatalogCache = { expiresAt: now + SPORT_DISCOVERY_TTL_MS, value: sports };
  return sports;
}

async function discoverSportIds(config: PinnacleGuestConfig): Promise<number[]> {
  const fromEnv = parseSportIdsFromEnv();
  if (fromEnv) return fromEnv;

  const sports = await fetchSportsCatalog();

  const nameFilter = parseSportNamesFromEnv();
  if (nameFilter) {
    const matched = sports.filter((s) => {
      const slug = toSlug(s.name);
      return nameFilter.some((n) => slug.includes(n) || s.name.toLowerCase().includes(n));
    });
    if (matched.length > 0) {
      logger.info({ matched: matched.map((s) => `${s.name} (id=${s.id})`) }, "Filtered sports by PINNACLE_SPORT_NAMES");
      return matched.map((s) => s.id);
    }
    logger.warn({ nameFilter }, "No sports matched PINNACLE_SPORT_NAMES — falling back to all sports");
  }

  const maxSports = Number.parseInt(process.env["PINNACLE_MAX_SPORTS"] ?? "", 10);
  const limit = Number.isFinite(maxSports) && maxSports > 0 ? maxSports : 999;
  return sports
    .filter((s) => !s.isHidden && (s.matchupCount ?? 0) > 0)
    .sort((a, b) => (b.matchupCount ?? 0) - (a.matchupCount ?? 0))
    .slice(0, limit)
    .map((s) => s.id);
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function americanToDecimal(price: number): number {
  if (price === 0) return 1;
  if (price > 0) return parseFloat((1 + price / 100).toFixed(4));
  return parseFloat((1 + 100 / Math.abs(price)).toFixed(4));
}

function extractHomeAway(matchup: PinnacleMatchupRaw): { homeTeam: string; awayTeam: string } {
  const participants = matchup.participants ?? matchup.parent?.participants ?? [];
  const home = participants.find((p) => p.alignment === "home")?.name;
  const away = participants.find((p) => p.alignment === "away")?.name;
  return {
    homeTeam: home ?? participants[0]?.name ?? "Home",
    awayTeam: away ?? participants[1]?.name ?? "Away",
  };
}

function normalizeMatchup(raw: PinnacleMatchupRaw): NormalizedMatchup {
  const { homeTeam, awayTeam } = extractHomeAway(raw);
  const league = raw.league;
  const startTime = raw.startTime ?? raw.parent?.startTime ?? new Date().toISOString();
  return {
    id: raw.id,
    parentId: raw.parentId ?? null,
    type: raw.type === "special" ? "special" : "matchup",
    sportId: league?.sport?.id ?? 0,
    sport: toSlug(league?.sport?.name ?? "unknown"),
    leagueId: league?.id ?? 0,
    league: toSlug(league?.name ?? "unknown"),
    leagueName: league?.name ?? "Unknown League",
    homeTeam,
    awayTeam,
    startTime: new Date(startTime),
    isLive: raw.isLive ?? raw.parent?.isLive ?? false,
    isHighlighted: raw.isHighlighted ?? false,
    status: raw.status ?? "unknown",
    participants: raw.participants ?? [],
    periods: raw.periods ?? [],
    totalMarketCount: raw.totalMarketCount ?? 0,
  };
}

function getMarketType(raw: PinnacleMarketRaw): MarketType {
  switch (raw.type) {
    case "moneyline": return "moneyline";
    case "spread": return "spread";
    case "total": return "total";
    case "team_total": return "team_total";
    default: return "moneyline";
  }
}

function normalizeMarket(
  raw: PinnacleMarketRaw,
  matchup: NormalizedMatchup,
): NormalizedMarket {
  const prices: NormalizedPrice[] = (raw.prices ?? []).map((p) => ({
    designation: p.designation ?? "unknown",
    points: p.points ?? null,
    americanPrice: p.price,
    decimalPrice: americanToDecimal(p.price),
    participantId: p.participantId ?? null,
  }));

  const maxRiskLimit = raw.limits?.find((l) => l.type === "maxRiskStake");
  const stableId = `pin-${raw.matchupId}-${raw.key}`;

  return {
    id: stableId,
    matchupId: raw.matchupId,
    marketKey: raw.key,
    sportId: matchup.sportId,
    sport: matchup.sport,
    leagueId: matchup.leagueId,
    league: matchup.league,
    leagueName: matchup.leagueName,
    homeTeam: matchup.homeTeam,
    awayTeam: matchup.awayTeam,
    startTime: matchup.startTime,
    isLive: matchup.isLive,
    type: getMarketType(raw),
    period: raw.period,
    isAlternate: raw.isAlternate ?? false,
    status: raw.status ?? "unknown",
    cutoffAt: raw.cutoffAt ?? null,
    version: raw.version ?? null,
    side: raw.side ?? null,
    prices,
    maxRiskStake: maxRiskLimit?.amount ?? null,
    rawKey: raw.key,
  };
}

// ---------------------------------------------------------------------------
// Known league IDs for sports whose sport-level /matchups endpoint is blocked
// (Pinnacle guest API returns 403 for these at the sport level)
// ---------------------------------------------------------------------------
const SPORT_FALLBACK_LEAGUES: Record<number, number[]> = {
  19: [1456], // Hockey → NHL
  15: [889],  // Football → NFL
};

async function fetchMatchupsForSport(
  config: PinnacleGuestConfig,
  sportId: number,
): Promise<PinnacleMatchupRaw[]> {
  try {
    return await fetchGuestApi<PinnacleMatchupRaw[]>(config, `/sports/${sportId}/matchups`);
  } catch (err: unknown) {
    const is403 =
      err instanceof Error && (err.message.includes("403") || err.message.includes("Access denied"));
    if (!is403) throw err;

    const leagueIds = SPORT_FALLBACK_LEAGUES[sportId];
    if (!leagueIds?.length) throw err; // no fallback available — re-throw original error

    logger.info(
      { sportId, leagueIds },
      "Sport-level matchups blocked (403) — falling back to league-level matchup fetch",
    );

    const results = await Promise.all(
      leagueIds.map((lid) =>
        fetchGuestApi<PinnacleMatchupRaw[]>(config, `/leagues/${lid}/matchups`).catch((e: unknown) => {
          logger.warn({ leagueId: lid, err: e }, "League matchup fallback failed");
          return [] as PinnacleMatchupRaw[];
        }),
      ),
    );
    return results.flat();
  }
}

// ---------------------------------------------------------------------------
// Full-sport fetch: matchups + markets
// ---------------------------------------------------------------------------

async function fetchSportFull(
  config: PinnacleGuestConfig,
  sportId: number,
): Promise<PollResult> {
  const fetchedAt = new Date();

  const [rawMatchups, rawMarkets] = await Promise.all([
    fetchMatchupsForSport(config, sportId),
    fetchGuestApi<PinnacleMarketRaw[]>(config, `/sports/${sportId}/markets/straight?primaryOnly=false`),
  ]);

  const matchupsById = new Map<number, NormalizedMatchup>();
  for (const raw of rawMatchups) {
    matchupsById.set(raw.id, normalizeMatchup(raw));
  }

  const sportName = rawMatchups[0]?.league?.sport?.name ?? "Unknown";

  const markets: NormalizedMarket[] = [];
  for (const rawMarket of rawMarkets) {
    const matchup = matchupsById.get(rawMarket.matchupId);
    // Skip markets whose matchup isn't in our catalog — they'd show "Unknown vs Unknown"
    if (!matchup) continue;
    markets.push(normalizeMarket(rawMarket, matchup));
  }

  return {
    matchups: [...matchupsById.values()],
    markets,
    sportId,
    sport: toSlug(sportName),
    fetchedAt,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchAllPinnacleData(): Promise<PollResult[]> {
  const config = await discoverGuestConfig();
  const sportIds = await discoverSportIds(config);
  const results: PollResult[] = [];

  for (let i = 0; i < sportIds.length; i++) {
    const sportId = sportIds[i];
    if (i > 0) await delay(INTER_SPORT_DELAY_MS);

    try {
      const result = await fetchSportFull(config, sportId);
      results.push(result);
      logger.info(
        { sportId, sport: result.sport, matchups: result.matchups.length, markets: result.markets.length },
        "Fetched Pinnacle sport snapshot",
      );
    } catch (err) {
      logger.warn({ err, sportId }, "Failed to fetch Pinnacle data for sport — skipping");
    }
  }

  return results;
}

/**
 * Backward-compatible: returns NormalizedEvent-shaped objects for existing poller.
 * Extracts primary (period=0, non-alternate) markets grouped by matchup.
 */
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

function formatSelectionLabel(price: NormalizedPrice, market: NormalizedMarket): string {
  const designation = price.designation.charAt(0).toUpperCase() + price.designation.slice(1);
  if (price.points === null) return designation;
  const points = price.points >= 0 ? `+${price.points}` : `${price.points}`;
  return `${designation} ${points}`;
}

function legacyMarketType(type: MarketType): NormalizedEvent["marketType"] {
  if (type === "team_total") return "total";
  if (type === "spread") {
    return "spread";
  }
  return type as NormalizedEvent["marketType"];
}

export async function fetchPinnacleOdds(): Promise<NormalizedEvent[]> {
  const allResults = await fetchAllPinnacleData();
  const events: NormalizedEvent[] = [];
  const seen = new Set<string>();

  for (const result of allResults) {
    for (const market of result.markets) {
      if (market.period !== 0) continue;
      if (market.isAlternate) continue;
      if (market.status !== "open") continue;
      if (seen.has(market.id)) continue;
      seen.add(market.id);

      const lines = market.prices.map((p) => ({
        selection: formatSelectionLabel(p, market),
        openingOdds: p.decimalPrice,
        currentOdds: p.decimalPrice,
        changePercent: 0,
        changeAbsolute: 0,
        direction: "stable" as const,
      }));

      if (lines.length === 0) continue;

      events.push({
        id: market.id,
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        sport: market.sport,
        league: market.league,
        leagueName: market.leagueName,
        commenceTime: market.startTime,
        marketType: legacyMarketType(market.type),
        lines,
      });
    }
  }

  return events;
}
