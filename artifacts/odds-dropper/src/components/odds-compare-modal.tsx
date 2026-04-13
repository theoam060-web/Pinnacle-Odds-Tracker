import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, ExternalLink } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface OddsEntry {
  price: number;
  isBest: boolean;
  margin: number | null;
}

interface BookmakerRow {
  key: string;
  title: string;
  isPinnacle: boolean;
  lastUpdate: string;
  odds: Record<string, OddsEntry>;
}

interface CompareResult {
  found: boolean;
  homeTeam?: string;
  awayTeam?: string;
  sportTitle?: string;
  commenceTime?: string;
  outcomes?: string[];
  bookmakers?: BookmakerRow[];
  bestOdds?: Record<string, { price: number; bookmakerKey: string; bookmakerTitle: string }>;
  message?: string;
  error?: string;
}

interface OddsCompareModalProps {
  open: boolean;
  onClose: () => void;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  leagueName: string;
  commenceTime: string | Date;
  marketType: string;
  selection: string;
  pinnacleOdds: number;
}

function formatOdds(v: number) {
  return v.toFixed(2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export function OddsCompareModal({
  open,
  onClose,
  homeTeam,
  awayTeam,
  sport,
  leagueName,
  commenceTime,
  marketType,
  selection,
  pinnacleOdds,
}: OddsCompareModalProps) {
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({
        homeTeam,
        awayTeam,
        sport,
        commenceTime: new Date(commenceTime).toISOString(),
        marketType,
      });
      const res = await fetch(`${API_BASE}/api/compare?${params.toString()}`);
      const data = await res.json() as CompareResult;
      if (!res.ok) {
        setFetchError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResult(data);
      }
    } catch {
      setFetchError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [homeTeam, awayTeam, sport, commenceTime, marketType]);

  function handleOpenChange(next: boolean) {
    if (next && !result && !loading) load();
    if (!next) onClose();
  }

  const commenceIso = new Date(commenceTime).toISOString();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">
                {homeTeam} <span className="text-muted-foreground text-sm font-normal">vs</span> {awayTeam}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{leagueName}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="capitalize">{marketType.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatTime(commenceIso)} {formatDate(commenceIso)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pinnacle</p>
                <p className="text-sm font-mono font-semibold text-cyan-400">{formatOdds(pinnacleOdds)}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Fetching bookmaker odds…</p>
            </div>
          )}

          {fetchError && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-destructive">{fetchError}</p>
              <Button size="sm" variant="outline" onClick={() => void load()} className="gap-1.5">
                <RefreshCw className="w-3 h-3" /> Retry
              </Button>
            </div>
          )}

          {result && !loading && !result.found && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {result.message ?? "This match wasn't found in The Odds API."}
              </p>
              <p className="text-xs text-muted-foreground/60 text-center">
                Only major leagues are covered. Try again closer to kick-off.
              </p>
            </div>
          )}

          {result?.found && result.outcomes && result.bookmakers && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 sticky top-0">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground min-w-[160px]">
                      Bookmaker
                    </th>
                    {result.outcomes.map(outcome => (
                      <th
                        key={outcome}
                        className={`text-center px-4 py-2.5 text-xs font-medium min-w-[100px] ${
                          outcome.toLowerCase() === selection.toLowerCase() ||
                          selection.toLowerCase().includes(outcome.toLowerCase())
                            ? "text-cyan-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {outcome}
                        {(outcome.toLowerCase() === selection.toLowerCase() ||
                          selection.toLowerCase().includes(outcome.toLowerCase())) && (
                          <span className="ml-1 text-[9px] text-cyan-400/70 uppercase tracking-wide">
                            ← Sharp
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.bookmakers.map(bm => (
                    <tr
                      key={bm.key}
                      className={`border-b border-border/50 last:border-0 transition-colors ${
                        bm.isPinnacle
                          ? "bg-cyan-500/5 hover:bg-cyan-500/10"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${bm.isPinnacle ? "text-cyan-400" : "text-foreground"}`}>
                            {bm.title}
                          </span>
                          {bm.isPinnacle && (
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 px-1 border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                            >
                              Sharp
                            </Badge>
                          )}
                        </div>
                      </td>
                      {result.outcomes!.map(outcome => {
                        const entry = bm.odds[outcome];
                        if (!entry) {
                          return (
                            <td key={outcome} className="px-4 py-3 text-center">
                              <span className="text-muted-foreground/30 text-xs italic">—</span>
                            </td>
                          );
                        }
                        return (
                          <td key={outcome} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`font-mono text-sm font-medium ${
                                    entry.isBest
                                      ? "text-emerald-400"
                                      : bm.isPinnacle
                                      ? "text-cyan-400"
                                      : "text-foreground"
                                  }`}
                                >
                                  {formatOdds(entry.price)}
                                </span>
                                {entry.isBest && (
                                  <Trophy className="w-3 h-3 text-emerald-400" />
                                )}
                              </div>
                              {!bm.isPinnacle && entry.margin !== null && (
                                <span
                                  className={`text-[10px] font-mono ${
                                    entry.margin > 0
                                      ? "text-emerald-400/70"
                                      : entry.margin < 0
                                      ? "text-red-400/70"
                                      : "text-muted-foreground/40"
                                  }`}
                                >
                                  {entry.margin > 0 ? "+" : ""}
                                  {entry.margin}%
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {result.bestOdds && (
                <div className="px-4 py-2 border-t border-border bg-emerald-500/5">
                  <p className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Best odds per outcome highlighted in green · % shows margin vs Pinnacle
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/50">
              via The Odds API (Pinnacle)
            </span>
            {result?.found && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-2 text-muted-foreground gap-1"
                onClick={() => void load()}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            )}
          </div>
          <a
            href="https://the-odds-api.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground flex items-center gap-0.5 transition-colors"
          >
            the-odds-api.com <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
