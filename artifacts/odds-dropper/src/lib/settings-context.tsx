import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "dark" | "light" | "midnight";
export type BetSizeMethod = "kelly" | "percent";
export type OddsFormat = "decimal" | "american" | "fractional";

export interface AppSettings {
  theme: Theme;
  compactMode: boolean;
  oddsFormat: OddsFormat;
  showNovig: boolean;
  autoSettle: boolean;

  betSizingEnabled: boolean;
  bankroll: number;
  betSizeMethod: BetSizeMethod;
  kellyFraction: number;
  unitSizePercent: number;

  passwordEnabled: boolean;
  password: string;
  twoFAEnabled: boolean;
}

const DEFAULTS: AppSettings = {
  theme: "dark",
  compactMode: false,
  oddsFormat: "decimal",
  showNovig: true,
  autoSettle: true,

  betSizingEnabled: false,
  bankroll: 1000,
  betSizeMethod: "kelly",
  kellyFraction: 0.25,
  unitSizePercent: 2,

  passwordEnabled: false,
  password: "",
  twoFAEnabled: false,
};

const STORAGE_KEY = "pt:settings:v1";

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch {}
  }, [settings]);

  // Apply theme class to documentElement
  useEffect(() => {
    const el = document.documentElement;
    el.classList.remove("theme-dark", "theme-light", "theme-midnight");
    el.classList.add(`theme-${settings.theme}`);
    if (settings.theme === "light") {
      el.classList.remove("dark");
    } else {
      el.classList.add("dark");
    }
  }, [settings.theme]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings(prev => ({ ...prev, ...patch }));
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}

/**
 * Calculate recommended bet size given edge (as probability edge) and odds.
 * Returns amount in currency units.
 */
export function calcKellyStake(
  bankroll: number,
  kellyFraction: number,
  decimalOdds: number,
  bettingOddsImpliedProb: number,
): number {
  const b = decimalOdds - 1;
  const p = bettingOddsImpliedProb;
  const q = 1 - p;
  const kelly = (b * p - q) / b;
  if (kelly <= 0) return 0;
  return parseFloat((bankroll * kellyFraction * kelly).toFixed(2));
}

export function calcUnitStake(bankroll: number, unitSizePercent: number): number {
  return parseFloat((bankroll * unitSizePercent / 100).toFixed(2));
}
