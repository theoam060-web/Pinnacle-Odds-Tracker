import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type NovigMethod = "power" | "shin" | "oddsRatio" | "wpo" | "additive" | "proportional";

export const NOVIG_METHOD_LABELS: Record<NovigMethod, string> = {
  power: "Power",
  shin: "Shin",
  oddsRatio: "Odds Ratio",
  wpo: "WPO (Weighted Prop.)",
  additive: "Additive",
  proportional: "Proportional",
};

export const MARKET_TYPE_OPTIONS = [
  { slug: "moneyline",    label: "Moneyline" },
  { slug: "spread",       label: "Handicaps" },
  { slug: "total",        label: "Totals" },
  { slug: "team_total",   label: "Team Totals" },
  { slug: "draw_no_bet",  label: "Draw No Bet" },
  { slug: "btts",         label: "Both Teams to Score" },
  { slug: "corners",      label: "Corners" },
  { slug: "bookings",     label: "Bookings" },
];

export const SPORT_OPTIONS = [
  { slug: "soccer",            label: "⚽ Football" },
  { slug: "basketball",        label: "🏀 Basketball" },
  { slug: "tennis",            label: "🎾 Tennis" },
  { slug: "hockey",            label: "🏒 Ice Hockey" },
  { slug: "american_football", label: "🏈 American Football" },
  { slug: "baseball",          label: "⚾ Baseball" },
  { slug: "handball",          label: "🤾 Handball" },
  { slug: "volleyball",        label: "🏐 Volleyball" },
  { slug: "table_tennis",      label: "🏓 Table Tennis" },
];

export const SPORT_MARKETS: Record<string, string[]> = {
  all:               ["moneyline", "spread", "total", "team_total", "draw_no_bet", "btts", "corners", "bookings"],
  soccer:            ["moneyline", "spread", "total", "team_total", "draw_no_bet", "btts", "corners", "bookings"],
  basketball:        ["moneyline", "spread", "total"],
  tennis:            ["moneyline", "spread", "total"],
  hockey:            ["moneyline", "spread", "total"],
  american_football: ["moneyline", "spread", "total"],
  baseball:          ["moneyline", "spread", "total"],
};

export interface SportDefaults {
  minDropPercent: number;
  maxHoursUntilMatch: number;
  minOdds: number;
  maxOdds: number;
}

export const SPORT_DEFAULTS: Record<string, SportDefaults> = {
  all:               { minDropPercent: 2, maxHoursUntilMatch: 24, minOdds: 1.2, maxOdds: 20 },
  soccer:            { minDropPercent: 2, maxHoursUntilMatch: 48, minOdds: 1.3, maxOdds: 20 },
  basketball:        { minDropPercent: 2, maxHoursUntilMatch: 12, minOdds: 1.3, maxOdds: 10 },
  tennis:            { minDropPercent: 3, maxHoursUntilMatch: 6,  minOdds: 1.1, maxOdds: 15 },
  hockey:            { minDropPercent: 2, maxHoursUntilMatch: 24, minOdds: 1.2, maxOdds: 10 },
  american_football: { minDropPercent: 2, maxHoursUntilMatch: 48, minOdds: 1.3, maxOdds: 10 },
  baseball:          { minDropPercent: 2, maxHoursUntilMatch: 12, minOdds: 1.3, maxOdds: 8  },
};

export interface AlertConfig {
  id: string;
  name: string;
  enabled: boolean;
  sport: string;
  minDropPercent: number;
  maxHoursUntilMatch: number;
  minOdds: number;
  maxOdds: number;
  minLimit: number;
  maxLimit: number;
  markets: string[];
}

export interface BookmakerOption {
  key: string;
  title: string;
  region: string;
  domain: string;
}

export const BOOKMAKER_OPTIONS: BookmakerOption[] = [
  // EU/UK — keys match The Odds API (odds.p.rapidapi.com)
  { key: "williamhill",    title: "William Hill",   region: "UK",    domain: "williamhill.com" },
  { key: "unibet",         title: "Unibet",         region: "EU",    domain: "unibet.com" },
  { key: "betway",         title: "Betway",         region: "EU",    domain: "betway.com" },
  { key: "betsson",        title: "Betsson",        region: "EU",    domain: "betsson.com" },
  { key: "nordicbet",      title: "Nordicbet",      region: "EU",    domain: "nordicbet.com" },
  { key: "coolbet",        title: "Coolbet",        region: "EU",    domain: "coolbet.com" },
  { key: "marathonbet",    title: "Marathon Bet",   region: "EU",    domain: "marathonbet.com" },
  { key: "leovegas",       title: "LeoVegas",       region: "EU",    domain: "leovegas.com" },
  { key: "casumo",         title: "Casumo",         region: "EU",    domain: "casumo.com" },
  { key: "betvictor",      title: "Bet Victor",     region: "UK",    domain: "betvictor.com" },
  { key: "betfair_ex_uk",  title: "Betfair Exchange", region: "UK/EU", domain: "betfair.com" },
  { key: "smarkets",       title: "Smarkets",       region: "UK",    domain: "smarkets.com" },
  { key: "matchbook",      title: "Matchbook",      region: "UK",    domain: "matchbook.com" },
  { key: "ladbrokes_uk",   title: "Ladbrokes",      region: "UK",    domain: "ladbrokes.com" },
  { key: "coral",          title: "Coral",          region: "UK",    domain: "coral.co.uk" },
  { key: "paddypower",     title: "Paddy Power",    region: "UK/IE", domain: "paddypower.com" },
  { key: "skybet",         title: "Sky Bet",        region: "UK",    domain: "skybet.com" },
  { key: "sport888",       title: "888sport",       region: "UK/EU", domain: "888sport.com" },
  { key: "boylesports",    title: "BoyleSports",    region: "IE",    domain: "boylesports.com" },
  { key: "grosvenor",      title: "Grosvenor",      region: "UK",    domain: "grosvenorsport.com" },
  { key: "betfred_uk",     title: "Betfred",        region: "UK",    domain: "betfred.com" },
  { key: "virginbet",      title: "Virgin Bet",     region: "UK",    domain: "virginbet.com" },
  { key: "livescorebet",   title: "LiveScore Bet",  region: "UK",    domain: "livescorebet.com" },
  // US
  { key: "draftkings",     title: "DraftKings",     region: "US",    domain: "draftkings.com" },
  { key: "fanduel",        title: "FanDuel",        region: "US",    domain: "fanduel.com" },
  { key: "betmgm",         title: "BetMGM",         region: "US",    domain: "betmgm.com" },
  { key: "williamhill_us", title: "Caesars",        region: "US",    domain: "caesars.com" },
  { key: "betrivers",      title: "BetRivers",      region: "US",    domain: "betrivers.com" },
  { key: "bovada",         title: "Bovada",         region: "US",    domain: "bovada.lv" },
  { key: "mybookieag",     title: "MyBookie",       region: "US",    domain: "mybookie.ag" },
  { key: "betonlineag",    title: "BetOnline",      region: "US",    domain: "betonline.ag" },
  { key: "lowvig",         title: "LowVig",         region: "US",    domain: "lowvig.ag" },
  { key: "gtbets",         title: "GTbets",         region: "US",    domain: "gtbets.eu" },
  // AU
  { key: "tab",            title: "TAB",            region: "AU",    domain: "tab.com.au" },
  { key: "pointsbetau",    title: "PointsBet",      region: "AU",    domain: "pointsbet.com.au" },
  { key: "sportsbet",      title: "SportsBet",      region: "AU",    domain: "sportsbet.com.au" },
  { key: "neds",           title: "Neds",           region: "AU",    domain: "neds.com.au" },
];

export const DEFAULT_COMPARISON_BOOKMAKERS = ["williamhill", "unibet", "betway", "nordicbet"];

export const DEFAULT_ALERT_CONFIG: Omit<AlertConfig, "id" | "name"> = {
  enabled: true,
  sport: "soccer",
  minDropPercent: 0.5,
  maxHoursUntilMatch: 48,
  minOdds: 1.01,
  maxOdds: 100,
  minLimit: 0,
  maxLimit: 999999,
  markets: [],
};

function makeConfig(id: string, name: string): AlertConfig {
  return { id, name, ...DEFAULT_ALERT_CONFIG };
}

interface AlertStore {
  configs: AlertConfig[];
  novigMethod: NovigMethod;
  soundEnabled: boolean;
  comparisonBookmakers: string[];
}

const DEFAULT_STORE: AlertStore = {
  configs: [makeConfig("1", "Config 1")],
  novigMethod: "power",
  soundEnabled: true,
  comparisonBookmakers: DEFAULT_COMPARISON_BOOKMAKERS,
};

const STORAGE_KEY = "pt:alerts:v3";

const VALID_MARKET_SLUGS = new Set(MARKET_TYPE_OPTIONS.map(m => m.slug));
const VALID_SPORT_SLUGS  = new Set(SPORT_OPTIONS.map(s => s.slug));
const VALID_BOOKMAKER_KEYS = new Set(BOOKMAKER_OPTIONS.map(b => b.key));

const BOOKMAKER_KEY_MIGRATION: Record<string, string> = {
  unibet_eu:   "unibet",
  "888sport":  "sport888",
  mybookie:    "mybookieag",
  caesars:     "williamhill_us",
  pointsbet:   "pointsbetau",
  ladbrokes_au: "ladbrokes_uk",
  betfair:     "betfair_ex_uk",
  comeon:      "betway",
  mrgreen:     "leovegas",
  barstool:    "draftkings",
  foxbet:      "fanduel",
  betclic:     "betsson",
  // removed: bet365, bwin — not available via The Odds API
};

function migrateBookmakers(keys: string[]): string[] {
  return keys
    .map(k => BOOKMAKER_KEY_MIGRATION[k] ?? k)
    .filter(k => VALID_BOOKMAKER_KEYS.has(k));
}

function sanitizeConfig(c: AlertConfig): AlertConfig {
  const cleanMarkets = c.markets.filter(m => VALID_MARKET_SLUGS.has(m));
  const cleanSport   = VALID_SPORT_SLUGS.has(c.sport) ? c.sport : DEFAULT_ALERT_CONFIG.sport;
  return { ...c, markets: cleanMarkets, sport: cleanSport };
}

function loadStore(): AlertStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    const parsed: AlertStore = { ...DEFAULT_STORE, ...JSON.parse(raw) };
    const comparisonBookmakers = migrateBookmakers(
      parsed.comparisonBookmakers ?? DEFAULT_COMPARISON_BOOKMAKERS
    );
    const configs = parsed.configs.map(sanitizeConfig).map(c => {
      // Migration: if a config was saved with sport "soccer" and minDropPercent 2
      // (old defaults), upgrade to 0.5% so real Pinnacle drops show up
      if (c.sport === "soccer" && c.minDropPercent === 2 && c.minOdds === 1.3) {
        return { ...c, sport: "soccer", minDropPercent: 0.5, minOdds: 1.01, maxOdds: 100 };
      }
      return c;
    });
    return { ...parsed, configs, comparisonBookmakers };
  } catch {
    return DEFAULT_STORE;
  }
}

interface AlertContextValue {
  configs: AlertConfig[];
  novigMethod: NovigMethod;
  soundEnabled: boolean;
  comparisonBookmakers: string[];
  setConfigs: (configs: AlertConfig[]) => void;
  setNovigMethod: (method: NovigMethod) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setComparisonBookmakers: (keys: string[]) => void;
  addConfig: () => void;
  removeConfig: (id: string) => void;
  updateConfig: (id: string, patch: Partial<AlertConfig>) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<AlertStore>(loadStore);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      // ignore quota errors
    }
  }, [store]);

  function setConfigs(configs: AlertConfig[]) {
    setStore(s => ({ ...s, configs }));
  }

  function setNovigMethod(novigMethod: NovigMethod) {
    setStore(s => ({ ...s, novigMethod }));
  }

  function setSoundEnabled(soundEnabled: boolean) {
    setStore(s => ({ ...s, soundEnabled }));
  }

  function setComparisonBookmakers(comparisonBookmakers: string[]) {
    setStore(s => ({ ...s, comparisonBookmakers }));
  }

  function addConfig() {
    setStore(s => {
      if (s.configs.length >= 9) return s;
      const id = Date.now().toString();
      const name = `Config ${s.configs.length + 1}`;
      return { ...s, configs: [...s.configs, makeConfig(id, name)] };
    });
  }

  function removeConfig(id: string) {
    setStore(s => ({
      ...s,
      configs: s.configs.filter(c => c.id !== id),
    }));
  }

  function updateConfig(id: string, patch: Partial<AlertConfig>) {
    setStore(s => ({
      ...s,
      configs: s.configs.map(c => c.id === id ? { ...c, ...patch } : c),
    }));
  }

  return (
    <AlertContext.Provider value={{
      configs: store.configs,
      novigMethod: store.novigMethod,
      soundEnabled: store.soundEnabled,
      comparisonBookmakers: store.comparisonBookmakers ?? DEFAULT_COMPARISON_BOOKMAKERS,
      setConfigs,
      setNovigMethod,
      setSoundEnabled,
      setComparisonBookmakers,
      addConfig,
      removeConfig,
      updateConfig,
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertStore(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertStore must be used inside AlertStoreProvider");
  return ctx;
}
