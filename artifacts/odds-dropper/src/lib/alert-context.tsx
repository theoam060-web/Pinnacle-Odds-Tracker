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
  { key: "bet365",         title: "Bet365",        region: "EU/UK", domain: "bet365.com" },
  { key: "williamhill",    title: "William Hill",   region: "UK",    domain: "williamhill.com" },
  { key: "unibet_eu",      title: "Unibet",         region: "EU",    domain: "unibet.com" },
  { key: "betsson",        title: "Betsson",        region: "EU",    domain: "betsson.com" },
  { key: "bwin",           title: "Bwin",           region: "EU",    domain: "bwin.com" },
  { key: "comeon",         title: "ComeOn",         region: "EU",    domain: "comeon.com" },
  { key: "betway",         title: "Betway",         region: "EU",    domain: "betway.com" },
  { key: "betclic",        title: "Betclic",        region: "EU",    domain: "betclic.com" },
  { key: "nordicbet",      title: "Nordicbet",      region: "EU",    domain: "nordicbet.com" },
  { key: "coolbet",        title: "Coolbet",        region: "EU",    domain: "coolbet.com" },
  { key: "mrgreen",        title: "Mr Green",       region: "EU",    domain: "mrgreen.com" },
  { key: "marathonbet",    title: "Marathonbet",    region: "EU",    domain: "marathonbet.com" },
  { key: "betfair",        title: "Betfair",        region: "UK/EU", domain: "betfair.com" },
  { key: "smarkets",       title: "Smarkets",       region: "UK",    domain: "smarkets.com" },
  { key: "matchbook",      title: "Matchbook",      region: "UK",    domain: "matchbook.com" },
  { key: "ladbrokes_au",   title: "Ladbrokes",      region: "UK",    domain: "ladbrokes.com" },
  { key: "coral",          title: "Coral",          region: "UK",    domain: "coral.co.uk" },
  { key: "paddypower",     title: "Paddy Power",    region: "UK/IE", domain: "paddypower.com" },
  { key: "skybet",         title: "Sky Bet",        region: "UK",    domain: "skybet.com" },
  { key: "888sport",       title: "888sport",       region: "UK/EU", domain: "888sport.com" },
  { key: "draftkings",     title: "DraftKings",     region: "US",    domain: "draftkings.com" },
  { key: "fanduel",        title: "FanDuel",        region: "US",    domain: "fanduel.com" },
  { key: "betmgm",         title: "BetMGM",         region: "US",    domain: "betmgm.com" },
  { key: "caesars",        title: "Caesars",        region: "US",    domain: "caesars.com" },
  { key: "betrivers",      title: "BetRivers",      region: "US",    domain: "betrivers.com" },
  { key: "pointsbet",      title: "PointsBet",      region: "US",    domain: "pointsbet.com" },
  { key: "barstool",       title: "Barstool",       region: "US",    domain: "barstoolsports.com" },
  { key: "foxbet",         title: "FOX Bet",        region: "US",    domain: "foxbet.com" },
  { key: "bovada",         title: "Bovada",         region: "US",    domain: "bovada.lv" },
  { key: "mybookie",       title: "MyBookie",       region: "US",    domain: "mybookie.ag" },
  { key: "betonlineag",    title: "BetOnline",      region: "US",    domain: "betonline.ag" },
  { key: "tab",            title: "TAB",            region: "AU",    domain: "tab.com.au" },
  { key: "pointsbetau",    title: "PointsBet AU",   region: "AU",    domain: "pointsbet.com.au" },
];

export const DEFAULT_COMPARISON_BOOKMAKERS = ["bet365", "williamhill", "unibet_eu", "bwin"];

export const DEFAULT_ALERT_CONFIG: Omit<AlertConfig, "id" | "name"> = {
  enabled: true,
  sport: "soccer",
  minDropPercent: 2,
  maxHoursUntilMatch: 48,
  minOdds: 1.3,
  maxOdds: 20,
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

const STORAGE_KEY = "pt:alerts:v1";

const VALID_MARKET_SLUGS = new Set(MARKET_TYPE_OPTIONS.map(m => m.slug));
const VALID_SPORT_SLUGS  = new Set(SPORT_OPTIONS.map(s => s.slug));

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
    return { ...parsed, configs: parsed.configs.map(sanitizeConfig) };
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
