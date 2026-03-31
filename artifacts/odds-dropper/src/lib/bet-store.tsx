import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BetResult = "pending" | "win" | "loss" | "void";

export interface LoggedBet {
  id: string;
  loggedAt: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  selection: string;
  marketType: string;
  commenceTime: string;
  bettingOdds: number;
  novigOdds: number;
  stake: number;
  potentialProfit: number;
  result: BetResult;
  closingOdds?: number;
}

interface BetStoreValue {
  bets: LoggedBet[];
  currency: string;
  setCurrency: (c: string) => void;
  logBet: (bet: Omit<LoggedBet, "id" | "loggedAt" | "potentialProfit" | "result">) => void;
  updateBet: (id: string, patch: Partial<LoggedBet>) => void;
  removeBet: (id: string) => void;
}

const STORAGE_KEY = "pt:bets:v2";
const CURRENCY_KEY = "pt:currency:v1";
const BetContext = createContext<BetStoreValue | null>(null);

function load(): LoggedBet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from v1 if present
      const v1 = localStorage.getItem("pt:bets:v1");
      if (v1) {
        const old: Omit<LoggedBet, "result" | "novigOdds">[] = JSON.parse(v1);
        return old.map(b => ({ ...b, result: "pending" as BetResult, novigOdds: b.bettingOdds }));
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadCurrency(): string {
  try { return localStorage.getItem(CURRENCY_KEY) ?? "USD"; } catch { return "USD"; }
}

export function BetStoreProvider({ children }: { children: ReactNode }) {
  const [bets, setBets] = useState<LoggedBet[]>(load);
  const [currency, setCurrencyState] = useState(loadCurrency);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bets)); } catch {}
  }, [bets]);

  function setCurrency(c: string) {
    setCurrencyState(c);
    try { localStorage.setItem(CURRENCY_KEY, c); } catch {}
  }

  function logBet(bet: Omit<LoggedBet, "id" | "loggedAt" | "potentialProfit" | "result">) {
    const entry: LoggedBet = {
      ...bet,
      id: Date.now().toString(),
      loggedAt: new Date().toISOString(),
      potentialProfit: parseFloat(((bet.bettingOdds - 1) * bet.stake).toFixed(2)),
      result: "pending",
    };
    setBets(prev => [entry, ...prev]);
  }

  function updateBet(id: string, patch: Partial<LoggedBet>) {
    setBets(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
  }

  function removeBet(id: string) {
    setBets(prev => prev.filter(b => b.id !== id));
  }

  return (
    <BetContext.Provider value={{ bets, currency, setCurrency, logBet, updateBet, removeBet }}>
      {children}
    </BetContext.Provider>
  );
}

export function useBetStore(): BetStoreValue {
  const ctx = useContext(BetContext);
  if (!ctx) throw new Error("useBetStore must be inside BetStoreProvider");
  return ctx;
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", label: "Swiss Franc" },
];

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

export function calcCLV(bettingOdds: number, closingOdds: number): number {
  if (!closingOdds || closingOdds <= 1) return 0;
  return parseFloat(((bettingOdds / closingOdds - 1) * 100).toFixed(2));
}

export function calcEV(bettingOdds: number, novigOdds: number, stake: number): number {
  if (!novigOdds || novigOdds <= 1) return 0;
  const fairProb = 1 / novigOdds;
  const profit = (bettingOdds - 1) * stake;
  const ev = fairProb * profit - (1 - fairProb) * stake;
  return parseFloat(ev.toFixed(2));
}
