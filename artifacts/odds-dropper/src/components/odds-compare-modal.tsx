import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, RefreshCw, Star } from "lucide-react";

const API_BASE = "";

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

export interface OddsCompareModalProps {
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
  configuredBookmakers?: string[];
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
  configuredBookmakers = [],
}: OddsCompareModalProps) {
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const loadedForRef = useRef<string | null>(null);

  const cacheKey = `${homeTeam}|${awayTeam}|${marketType}`;

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
      // Pass configured bookmakers so backend can mark them
      if (configuredBookmakers.length > 0) {
        params.set("configuredBookmakers", configuredBookmakers.join(","));
      }
      const res = await fetch(`${API_BASE}/api/compare?${params.toString()}`);
      const data = await res.json() as CompareResult;
      if (!res.ok) {
        setFetchError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResult(data);
        loadedForRef.current = cacheKey;
      }
    } catch {
      setFetchError("Nätverksfel — försök igen.");
    } finally {
      setLoading(false);
    }
  }, [homeTeam, awayTeam, sport, commenceTime, marketType, configuredBookmakers, cacheKey]);

  // Trigger load whenever the modal opens (or the event changes while open)
  useEffect(() => {
    if (open && loadedForRef.current !== cacheKey) {
      void load();
    }
  }, [open, cacheKey, load]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      loadedForRef.current = null;
      setResult(null);
      setFetchError(null);
    }
  }, [open]);

  const commenceIso = new Date(commenceTime).toISOString();
  const configuredSet = new Set(configuredBookmakers);

  // Sort bookmakers: Pinnacle first, then configured ones, then the rest alphabetically
  function sortBookmakers(bms: BookmakerRow[]): BookmakerRow[] {
    return [...bms].sort((a, b) => {
      if (a.isPinnacle) return -1;
      if (b.isPinnacle) return 1;
      const aConf = configuredSet.has(a.key);
      const bConf = configuredSet.has(b.key);
      if (aConf && !bConf) return -1;
      if (!aConf && bConf) return 1;
      return a.title.localeCompare(b.title);
    });
  }

  const sortedBookmakers = result?.found && result.bookmakers
    ? sortBookmakers(result.bookmakers)
    : [];

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-4 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight">
                {homeTeam} <span className="text-muted-foreground text-sm font-normal">vs</span> {awayTeam}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{leagueName}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="capitalize">{marketType.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{formatTime(commenceIso)} {formatDate(commenceIso)}</span>
              </DialogDescription>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pinnacle</p>
              <p className="text-sm font-mono font-semibold text-cyan-400">{formatOdds(pinnacleOdds)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh]">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Hämtar odds från spelbolag…</p>
            </div>
          )}

          {/* Error */}
          {fetchError && !loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <p className="text-sm text-destructive">{fetchError}</p>
              <Button size="sm" variant="outline" onClick={() => { loadedForRef.current = null; void load(); }} className="gap-1.5">
                <RefreshCw className="w-3 h-3" /> Försök igen
              </Button>
            </div>
          )}

          {/* Not found */}
          {result && !loading && !result.found && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 px-6 text-center">
              <p className="text-sm text-muted-foreground">{result.message ?? "Matchen hittades inte i vår databas."}</p>
              <p className="text-xs text-muted-foreground/60">Bara stora ligor täcks. Prova igen närmre avspark.</p>
            </div>
          )}

          {/* Results table */}
          {result?.found && result.outcomes && sortedBookmakers.length > 0 && (
            <>
              {configuredBookmakers.length > 0 && (
                <div className="px-4 py-2 border-b border-border bg-muted/20 flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <p className="text-[10px] text-muted-foreground">
                    Dina spelbolag (från Alert Configurations) visas överst och markerade
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 sticky top-0 z-10">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground min-w-[180px]">
                        Spelbolag
                      </th>
                      {result.outcomes.map(outcome => (
                        <th
                          key={outcome}
                          className={`text-center px-4 py-2.5 text-xs font-medium min-w-[110px] ${
                            outcome.toLowerCase() === selection.toLowerCase() ||
                            selection.toLowerCase().includes(outcome.toLowerCase())
                              ? "text-cyan-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {outcome}
                          {(outcome.toLowerCase() === selection.toLowerCase() ||
                            selection.toLowerCase().includes(outcome.toLowerCase())) && (
                            <span className="ml-1 text-[9px] text-cyan-400/70 uppercase tracking-wide">← Sharp</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookmakers.map((bm, idx) => {
                      const isConfigured = configuredSet.has(bm.key);
                      const isLastConfigured =
                        isConfigured &&
                        idx < sortedBookmakers.length - 1 &&
                        !configuredSet.has(sortedBookmakers[idx + 1]?.key ?? "") &&
                        !sortedBookmakers[idx + 1]?.isPinnacle;

                      return (
                        <tr
                          key={bm.key}
                          className={`border-b transition-colors ${
                            bm.isPinnacle
                              ? "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
                              : isConfigured
                              ? "border-yellow-500/10 bg-yellow-500/5 hover:bg-yellow-500/10"
                              : "border-border/40 hover:bg-muted/20"
                          } ${isLastConfigured ? "border-b border-yellow-500/30" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${bm.isPinnacle ? "text-cyan-400" : isConfigured ? "text-yellow-300" : "text-foreground"}`}>
                                {bm.title}
                              </span>
                              {bm.isPinnacle && (
                                <Badge variant="outline" className="text-[9px] h-4 px-1 border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                                  Sharp
                                </Badge>
                              )}
                              {isConfigured && !bm.isPinnacle && (
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
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
                                    {entry.isBest && <Trophy className="w-3 h-3 text-emerald-400" />}
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
                                      {entry.margin > 0 ? "+" : ""}{entry.margin}%
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-2 border-t border-border bg-emerald-500/5">
                <p className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Bästa odds per utfall markerade i grönt · % visar marginal vs Pinnacle
                </p>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/50">via Pinnacle</span>
            {result?.found && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] px-2 text-muted-foreground gap-1"
                onClick={() => { loadedForRef.current = null; void load(); }}
              >
                <RefreshCw className="w-3 h-3" /> Uppdatera
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
