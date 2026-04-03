import { useEffect, useRef, useCallback } from "react";
import { LoggedBet, BetResult, useBetStore } from "@/lib/bet-store";
import { useSettings } from "@/lib/settings-context";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Guess sport from league name for bets logged before sport field was added */
function deriveSport(leagueName: string): string {
  const l = leagueName?.toLowerCase() ?? "";
  if (l.includes("nhl") || l.includes("hockey")) return "hockey";
  if (l.includes("nfl") || l.includes("american football")) return "football";
  if (l.includes("nba") || l.includes("basketball")) return "basketball";
  if (l.includes("tennis") || l.includes("atp") || l.includes("wta")) return "tennis";
  if (l.includes("baseball") || l.includes("mlb")) return "baseball";
  return "soccer";
}

const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
// A match is considered potentially finished 2.5 hours after kick-off
const SETTLE_AFTER_MS = 2.5 * 60 * 60 * 1000;

interface ResolveRequest {
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  sport: string;
  marketType: string;
  selection: string;
}

interface ResolveResult {
  index: number;
  result: BetResult | null;
  homeScore: number | null;
  awayScore: number | null;
  matchedEvent: string | null;
}

export function useAutoSettle() {
  const { bets, updateBet } = useBetStore();
  const { settings } = useSettings();
  const { toast } = useToast();
  const runningRef = useRef(false);

  const checkAndSettle = useCallback(async () => {
    if (!settings.autoSettle) return;
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      const now = Date.now();
      const candidates = bets.filter(
        (b: LoggedBet) =>
          b.result === "pending" &&
          b.commenceTime &&
          now - new Date(b.commenceTime).getTime() > SETTLE_AFTER_MS,
      );

      if (candidates.length === 0) return;

      const payload: ResolveRequest[] = candidates.map((b: LoggedBet) => ({
        homeTeam: b.homeTeam,
        awayTeam: b.awayTeam,
        commenceTime: b.commenceTime,
        sport: b.sport ?? deriveSport(b.leagueName),
        marketType: b.marketType,
        selection: b.selection,
      }));

      const res = await fetch(`${API_BASE}/api/results/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets: payload }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) return;

      const data = (await res.json()) as { results: ResolveResult[] };
      let settled = 0;

      for (const r of data.results) {
        if (r.result && r.result !== "pending") {
          const bet = candidates[r.index];
          if (bet) {
            updateBet(bet.id, { result: r.result });
            settled++;
          }
        }
      }

      if (settled > 0) {
        toast({
          title: `Auto-settled ${settled} bet${settled > 1 ? "s" : ""}`,
          description: "Results fetched from live scores data.",
        });
      }
    } catch {
      // Silent — auto-settle failing should not disrupt the UI
    } finally {
      runningRef.current = false;
    }
  }, [bets, settings.autoSettle, updateBet, toast]);

  // Run on mount and then every 3 minutes
  useEffect(() => {
    checkAndSettle();
    const interval = setInterval(checkAndSettle, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkAndSettle]);
}
