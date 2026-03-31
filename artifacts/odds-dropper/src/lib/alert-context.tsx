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
  { slug: "moneyline", label: "Moneyline" },
  { slug: "draw_no_bet", label: "Draw No Bet" },
  { slug: "asian_handicap", label: "Handicaps" },
  { slug: "total", label: "Totals" },
  { slug: "btts", label: "Both Teams To Score" },
  { slug: "spread", label: "Spreads" },
];

export const SPORT_OPTIONS = [
  { slug: "all", label: "All Sports" },
  { slug: "soccer", label: "⚽ Football" },
  { slug: "basketball", label: "🏀 Basketball" },
  { slug: "tennis", label: "🎾 Tennis" },
  { slug: "hockey", label: "🏒 Ice Hockey" },
  { slug: "american_football", label: "🏈 American Football" },
  { slug: "baseball", label: "⚾ Baseball" },
];

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

export const DEFAULT_ALERT_CONFIG: Omit<AlertConfig, "id" | "name"> = {
  enabled: true,
  sport: "all",
  minDropPercent: 2,
  maxHoursUntilMatch: 24,
  minOdds: 1.0,
  maxOdds: 50,
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
}

const DEFAULT_STORE: AlertStore = {
  configs: [makeConfig("1", "Config 1")],
  novigMethod: "power",
  soundEnabled: true,
};

const STORAGE_KEY = "pt:alerts:v1";

function loadStore(): AlertStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STORE;
    return { ...DEFAULT_STORE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STORE;
  }
}

interface AlertContextValue {
  configs: AlertConfig[];
  novigMethod: NovigMethod;
  soundEnabled: boolean;
  setConfigs: (configs: AlertConfig[]) => void;
  setNovigMethod: (method: NovigMethod) => void;
  setSoundEnabled: (enabled: boolean) => void;
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
      setConfigs,
      setNovigMethod,
      setSoundEnabled,
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
