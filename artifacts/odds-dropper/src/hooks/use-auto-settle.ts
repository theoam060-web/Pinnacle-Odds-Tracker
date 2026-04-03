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

// Closing odds: capture as soon as the match kicks off
const CLOSING_ODDS_POLL_INTERVAL = 60 * 1000; // 1 minute
// Look back up to 12 hours for matches we haven't captured yet
const CLOSING_ODDS_LOOKBACK_MS = 12 * 60 * 60 * 1000;

// Result settle: check after 2.5 hours (match likely finished)
const SETTLE_POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes
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

interface ClosingOddsResult {
  index: number;
  closingOdds: number | null;
}

export function useAutoSettle() {
  const { bets, updateBet } = useBetStore();
  const { settings } = useSettings();
  const { toast } = useToast();
  const closingRunningRef = useRef(false);
  const settleRunningRef = useRef(false);

  // ── Closing odds capture ──────────────────────────────────────────────────
  const captureClosingOdds = useCallback(async () => {
    if (!settings.autoSettle) return;
    if (closingRunningRef.current) return;
    closingRunningRef.current = true;

    try {
      const now = Date.now();
      // Pending bets whose kick-off has passed but closing odds not yet set
      const candidates = bets.filter((b: LoggedBet) => {
        if (b.closingOdds && b.closingOdds > 1) return false; // already captured
        const kicked = new Date(b.commenceTime).getTime();
        return kicked < now && now - kicked < CLOSING_ODDS_LOOKBACK_MS;
      });

      if (candidates.length === 0) return;

      const payload = candidates.map((b: LoggedBet) => ({
        eventId: b.eventId,
        selection: b.selection,
      }));

      const res = await fetch(`${API_BASE}/api/odds/closing-odds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets: payload }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) return;

      const data = (await res.json()) as { results: ClosingOddsResult[] };
      let captured = 0;

      for (const r of data.results) {
        if (r.closingOdds && r.closingOdds > 1) {
          const bet = candidates[r.index];
          if (bet) {
            updateBet(bet.id, { closingOdds: r.closingOdds });
            captured++;
          }
        }
      }

      if (captured > 0) {
        toast({
          title: `Closing odds captured for ${captured} bet${captured > 1 ? "s" : ""}`,
          description: "Pinnacle closing line saved automatically at kick-off.",
        });
      }
    } catch {
      // Silent
    } finally {
      closingRunningRef.current = false;
    }
  }, [bets, settings.autoSettle, updateBet, toast]);

  // ── Result settlement ─────────────────────────────────────────────────────
  const checkAndSettle = useCallback(async () => {
    if (!settings.autoSettle) return;
    if (settleRunningRef.current) return;
    settleRunningRef.current = true;

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
      // Silent
    } finally {
      settleRunningRef.current = false;
    }
  }, [bets, settings.autoSettle, updateBet, toast]);

  // Run closing odds capture every minute
  useEffect(() => {
    captureClosingOdds();
    const interval = setInterval(captureClosingOdds, CLOSING_ODDS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [captureClosingOdds]);

  // Run result settlement every 3 minutes
  useEffect(() => {
    checkAndSettle();
    const interval = setInterval(checkAndSettle, SETTLE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkAndSettle]);
}
