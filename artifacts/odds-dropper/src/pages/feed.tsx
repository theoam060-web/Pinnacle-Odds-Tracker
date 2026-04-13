import { useRef, useState, useEffect, useMemo, useCallback, memo } from "react";
import { subscribeToGlobalTick } from "@/lib/globalTick";
import { Link } from "wouter";
import { useGetOddsDrops, useGetOddsSummary, getGetOddsDropsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OddsSparkline } from "@/components/odds-sparkline";
import { EventGraphModal } from "@/components/event-graph-modal";
import { OddsCompareModal } from "@/components/odds-compare-modal";
import { LogBetModal } from "@/components/log-bet-modal";
import { PinnacleOddsModal } from "@/components/pinnacle-odds-modal";
import { CountdownTimer } from "@/components/countdown-timer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, TrendingDown, BookmarkPlus, Pause, Play, ArrowUpDown, Check, BarChart2, LineChart } from "lucide-react";
import { formatOdds, formatTime, formatDate } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore, AlertConfig, BOOKMAKER_OPTIONS, type NovigMethod } from "@/lib/alert-context";
import { useWsFeed, type WsOddsEventUpdate } from "@/hooks/use-ws-feed";

const SPORT_LABELS: Record<string, string> = {
  soccer: "⚽ Football",
  basketball: "🏀 Basketball",
  tennis: "🎾 Tennis",
  hockey: "🏒 Ice Hockey",
  american_football: "🏈 Am. Football",
  baseball: "⚾ Baseball",
  boxing: "🥊 Boxing",
  mma: "🥋 MMA",
};

type SortOption = "time" | "newest" | "oldest" | "drop_desc" | "drop_asc";

const SORT_LABELS: Record<SortOption, string> = {
  time: "Time (soonest first)",
  newest: "Newest alert",
  oldest: "Oldest alert",
  drop_desc: "Drop % highest first",
  drop_asc: "Drop % lowest first",
};

interface FeedRow {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sport: string;
  commenceTime: Date | string;
  marketType: string;
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  allCurrentOdds: number[];
  lineIndex: number;
  lastUpdated: Date | string;
  newDropAt: Date | string | null;
  alertedAt: number;
}

function calcAlertAge(dropAt: Date | string): string {
  const diffMs = Date.now() - new Date(dropAt).getTime();
  if (diffMs < 0) return "just now";
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

function LiveAlertAge({ dropAt }: { dropAt: Date | string | null }) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!dropAt) return;
    const el = spanRef.current;
    if (!el) return;
    const update = () => {
      const text = calcAlertAge(dropAt);
      if (el.textContent !== text) el.textContent = text;
    };
    update();
    return subscribeToGlobalTick(update);
  }, [dropAt]);

  if (!dropAt) return <span className="text-[11px] text-muted-foreground/40">—</span>;
  return (
    <span ref={spanRef} className="text-[11px] font-mono text-amber-400 tabular-nums">
      {dropAt ? calcAlertAge(dropAt) : ""}
    </span>
  );
}

function lineMatchesConfig(
  event: { sport: string; marketType: string },
  line: { changePercent: number; currentOdds: number },
  commenceTime: Date | string,
  config: AlertConfig,
): boolean {
  if (!config.enabled) return false;
  if (line.changePercent >= 0) return false;
  const dropAbs = Math.abs(line.changePercent);
  if (dropAbs < config.minDropPercent) return false;
  if (config.sport && config.sport !== "all" && event.sport !== config.sport) return false;
  if (config.markets.length > 0 && !config.markets.includes(event.marketType)) return false;
  if (line.currentOdds < config.minOdds || line.currentOdds > config.maxOdds) return false;
  const hoursUntil = (new Date(commenceTime as Date).getTime() - Date.now()) / 3_600_000;
  if (hoursUntil > config.maxHoursUntilMatch) return false;
  return true;
}

function applySort(rows: FeedRow[], sort: SortOption): FeedRow[] {
  const sorted = [...rows];
  switch (sort) {
    case "time":
      return sorted.sort((a, b) =>
        new Date(a.commenceTime as Date).getTime() - new Date(b.commenceTime as Date).getTime()
      );
    case "newest":
      return sorted.sort((a, b) => {
        const aTime = a.newDropAt ? new Date(a.newDropAt).getTime() : a.alertedAt;
        const bTime = b.newDropAt ? new Date(b.newDropAt).getTime() : b.alertedAt;
        if (bTime !== aTime) return bTime - aTime;
        return b.alertedAt - a.alertedAt;
      });
    case "oldest":
      return sorted.sort((a, b) => {
        const aTime = a.newDropAt ? new Date(a.newDropAt).getTime() : a.alertedAt;
        const bTime = b.newDropAt ? new Date(b.newDropAt).getTime() : b.alertedAt;
        if (aTime !== bTime) return aTime - bTime;
        return a.alertedAt - b.alertedAt;
      });
    case "drop_desc":
      return sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    case "drop_asc":
      return sorted.sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent));
  }
}

function buildRows(
  events: ReturnType<typeof useGetOddsDrops>["data"],
  configs: AlertConfig[],
  sort: SortOption,
): FeedRow[] {
  if (!events) return [];
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const rows: FeedRow[] = [];

  for (const event of events) {
    // Only show events where a fresh drop was detected in the last 2 hours
    const dropAt = event.newDropAt ? new Date(event.newDropAt as Date).getTime() : 0;
    if (!dropAt || dropAt < twoHoursAgo) continue;

    const allCurrentOdds = event.lines.map(l => l.currentOdds);
    event.lines.forEach((line, lineIndex) => {
      const matchesAny = configs.some(c => lineMatchesConfig(event, line, event.commenceTime, c));
      if (!matchesAny) return;
      rows.push({
        eventId: event.id,
        homeTeam: event.homeTeam,
        awayTeam: event.awayTeam,
        leagueName: event.leagueName,
        sport: event.sport,
        commenceTime: event.commenceTime,
        marketType: event.marketType,
        selection: line.selection,
        openingOdds: line.openingOdds,
        currentOdds: line.currentOdds,
        changePercent: line.changePercent,
        allCurrentOdds,
        lineIndex,
        lastUpdated: event.lastUpdated,
        newDropAt: event.newDropAt ?? null,
        alertedAt: Date.now(),
      });
    });
  }

  return applySort(rows, sort);
}

const MAX_FEED_ROWS = 1000;

function rowKey(r: FeedRow) {
  return `${r.eventId}:${r.selection}`;
}

function wsEventToRows(
  event: WsOddsEventUpdate,
  configs: AlertConfig[],
  lastShownRef: React.MutableRefObject<Map<string, { odds: number; dropAt: number }>>,
): FeedRow[] {
  const allCurrentOdds = event.lines.map(l => l.currentOdds);
  const now = Date.now();
  const entries: FeedRow[] = [];

  // Only show events where Pinnacle actually just moved the line.
  // Require newDropAt to be within the last 2 minutes so stable events
  // with an old newDropAt timestamp don't pollute the feed.
  const dropAtMs = event.newDropAt ? new Date(event.newDropAt).getTime() : 0;
  const twoMinutesAgo = now - 2 * 60 * 1000;
  if (!dropAtMs || dropAtMs < twoMinutesAgo) return entries;

  event.lines.forEach((line, lineIndex) => {
    const matchesAny = configs.some(c =>
      lineMatchesConfig(
        { sport: event.sport, marketType: event.marketType },
        { changePercent: line.changePercent, currentOdds: line.currentOdds },
        event.commenceTime,
        c,
      )
    );
    if (!matchesAny) return;

    const key = `${event.id}:${line.selection}`;
    const last = lastShownRef.current.get(key);
    const oddsChanged = !last || last.odds !== line.currentOdds;
    const reAlerted = last && dropAtMs > 0 && dropAtMs > last.dropAt;

    if (!oddsChanged && !reAlerted) return;

    lastShownRef.current.set(key, { odds: line.currentOdds, dropAt: dropAtMs });

    entries.push({
      eventId: event.id,
      homeTeam: event.homeTeam,
      awayTeam: event.awayTeam,
      leagueName: event.leagueName,
      sport: event.sport,
      commenceTime: event.commenceTime,
      marketType: event.marketType,
      selection: line.selection,
      openingOdds: line.openingOdds,
      currentOdds: line.currentOdds,
      changePercent: line.changePercent,
      allCurrentOdds,
      lineIndex,
      lastUpdated: event.lastUpdated,
      newDropAt: event.newDropAt,
      alertedAt: now,
    });
  });

  return entries;
}

function dropIntensityBg(abs: number): string {
  if (abs >= 15) return "bg-green-950/30";
  if (abs >= 8) return "bg-green-950/15";
  return "";
}

interface SoftOddsResult {
  found: boolean;
  eventTitle?: string;
  sportTitle?: string;
  bookmakers: {
    key: string;
    title: string;
    available: boolean;
    outcomes: { name: string; price: number; delta: number | null } [] | null;
  }[];
  message?: string;
  error?: string;
}

function ComparePopover({ row, comparisonBookmakers }: {
  row: FeedRow;
  comparisonBookmakers: string[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SoftOddsResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const API_BASE = "";

  async function fetchComparison() {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        homeTeam: row.homeTeam,
        awayTeam: row.awayTeam,
        sport: row.sport,
        commenceTime: new Date(row.commenceTime as Date).toISOString(),
        bookmakers: comparisonBookmakers.join(","),
        marketType: row.marketType,
        pinnacleOdds: row.currentOdds.toString(),
      });
      const res = await fetch(`${API_BASE}/api/soft-odds?${params.toString()}`);
      const data: SoftOddsResult = await res.json() as SoftOddsResult;
      if (!res.ok) {
        setFetchError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setFetchError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) fetchComparison();
  }

  function resetAndOpen() {
    hasFetched.current = false;
    setResult(null);
    setFetchError(null);
    setOpen(true);
    fetchComparison();
  }

  const bmTitleMap = Object.fromEntries(BOOKMAKER_OPTIONS.map(b => [b.key, b.title]));

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1"
          title="Compare bookmaker odds"
        >
          <BarChart2 className="w-3 h-3" />
          Compare
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end" side="left">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-semibold text-foreground truncate">
            {row.homeTeam} vs {row.awayTeam}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
            {row.marketType.replace(/_/g, " ")} · {row.selection} · Sharp: <span className="font-mono text-foreground">{formatOdds(row.currentOdds)}</span>
          </p>
        </div>

        {comparisonBookmakers.length === 0 && !loading && !result && !fetchError && (
          <div className="p-3">
            <p className="text-xs text-muted-foreground">
              No bookmakers configured.{" "}
              <Link href="/alert-configurations">
                <span className="text-primary underline cursor-pointer">Set up in Settings →</span>
              </Link>
            </p>
          </div>
        )}

        {loading && (
          <div className="py-6 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Fetching odds…</span>
          </div>
        )}

        {fetchError && !loading && (
          <div className="p-3">
            <p className="text-xs text-destructive mb-2">{fetchError}</p>
            {fetchError.includes("ODDS_API_KEY") ? (
              <p className="text-[10px] text-muted-foreground">
                Add your API key from <a href="https://the-odds-api.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">the-odds-api.com</a> as <span className="font-mono">ODDS_API_KEY</span>.
              </p>
            ) : (
              <Button size="sm" variant="outline" className="h-6 text-xs" onClick={resetAndOpen}>Retry</Button>
            )}
          </div>
        )}

        {result && !loading && (
          <>
            {!result.found ? (
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{result.message ?? "Match not found in The Odds API."}</p>
              </div>
            ) : (() => {
              const allUnavailable = result.bookmakers.every((bm: { available: boolean }) => !bm.available);
              return (
                <div className="overflow-x-auto">
                  {allUnavailable && (
                    <div className="px-3 py-2 border-b border-border/50 bg-muted/20">
                      <p className="text-[10px] text-muted-foreground/80">None of your bookmakers offer this match or market.</p>
                    </div>
                  )}
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-3 py-1.5 text-[10px] font-medium text-muted-foreground">Bookmaker</th>
                        <th className="text-right px-3 py-1.5 text-[10px] font-medium text-muted-foreground">Odds</th>
                        <th className="text-right px-3 py-1.5 text-[10px] font-medium text-muted-foreground">vs Sharp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.bookmakers.map((bm: { key: string; title: string; available: boolean; outcomes: Array<{ name: string; price: number; delta: number | null }> | null }) => {
                        const outcome = bm.available && bm.outcomes
                          ? bm.outcomes.find((o: { name: string }) =>
                              o.name.toLowerCase().includes(row.selection.toLowerCase()) ||
                              row.selection.toLowerCase().includes(o.name.toLowerCase())
                            ) ?? bm.outcomes[0]
                          : null;

                        return (
                          <tr key={bm.key} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-1.5 font-medium text-foreground">
                              {bmTitleMap[bm.key] ?? bm.title}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono">
                              {bm.available && outcome ? (
                                <span className="text-foreground">{outcome.price.toFixed(2)}</span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/50 italic">Not offered</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono">
                              {bm.available && outcome && outcome.delta != null ? (
                                <span className={outcome.delta >= 0 ? "text-green-400" : "text-red-400"}>
                                  {outcome.delta >= 0 ? "+" : ""}{outcome.delta.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div className="px-3 py-1.5 border-t border-border/50 flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/50">via The Odds API</span>
              <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5 text-muted-foreground" onClick={resetAndOpen}>
                Refresh
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface FeedTableRowProps {
  row: FeedRow;
  novigMethod: NovigMethod;
  comparisonBookmakers: string[];
  onLogBet: (row: FeedRow & { novigOdds: number }) => void;
  onOddsModal: (id: number) => void;
  onGraphClick: (eventId: string, selection: string) => void;
  onCompare: (row: FeedRow) => void;
}

const FeedTableRow = memo(function FeedTableRow({
  row,
  novigMethod,
  comparisonBookmakers,
  onLogBet,
  onOddsModal,
  onGraphClick,
  onCompare,
}: FeedTableRowProps) {
  const dropAbs = Math.abs(row.changePercent);
  const novig = useMemo(() => computeNovig(row.allCurrentOdds, row.lineIndex), [row.allCurrentOdds, row.lineIndex]);

  return (
    <TableRow className={`hover:bg-muted/20 ${dropIntensityBg(dropAbs)}`}>
      <TableCell>
        <div
          className="cursor-pointer group"
          onClick={() => onGraphClick(row.eventId, row.selection)}
        >
          <div className="text-[10px] text-muted-foreground font-mono mb-0.5">
            {formatTime(row.commenceTime)} · {formatDate(row.commenceTime)}
          </div>
          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
            {row.homeTeam} <span className="text-muted-foreground text-xs">vs</span> {row.awayTeam}
          </div>
          <div className="mt-0.5">
            <Badge variant="outline" className="text-[9px] font-normal border-muted-foreground/20 px-1 py-0 h-4">
              {row.leagueName}
            </Badge>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <CountdownTimer commenceTime={row.commenceTime} />
      </TableCell>

      <TableCell className="text-center">
        <LiveAlertAge dropAt={row.newDropAt} />
      </TableCell>

      <TableCell>
        <span className="text-xs text-muted-foreground">
          {SPORT_LABELS[row.sport] ?? row.sport}
        </span>
      </TableCell>

      <TableCell>
        <span className="text-xs font-medium text-foreground capitalize">{row.selection}</span>
        <div className="text-[10px] text-muted-foreground capitalize mt-0.5">
          {row.marketType.replace(/_/g, " ")}
        </div>
      </TableCell>

      <TableCell className="text-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center justify-center gap-1 font-mono">
            <span className="text-muted-foreground text-sm line-through">{formatOdds(row.openingOdds)}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            <span className="text-foreground text-sm font-bold">{formatOdds(row.currentOdds)}</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 tabular-nums font-semibold">
            NV {formatOdds(novig[novigMethod])}
          </span>
        </div>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-sm font-mono font-bold text-green-400">{dropAbs.toFixed(2)}%</span>
          <OddsSparkline
            eventId={row.eventId}
            selection={row.selection}
            openingOdds={row.openingOdds}
            currentOdds={row.currentOdds}
            onClick={() => onGraphClick(row.eventId, row.selection)}
          />
        </div>
      </TableCell>

      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => onGraphClick(row.eventId, row.selection)}
          >
            <LineChart className="w-3 h-3" />
            Chart
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => onLogBet({ ...row, novigOdds: novig[novigMethod] })}
          >
            <BookmarkPlus className="w-3 h-3" />
            Log
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => onCompare(row)}
            title="Compare odds across bookmakers"
          >
            <BarChart2 className="w-3 h-3" />
            Compare
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function FeedPage() {
  const { configs, novigMethod, comparisonBookmakers } = useAlertStore();
  const [logBetRow, setLogBetRow] = useState<(FeedRow & { novigOdds: number }) | null>(null);
  const [oddsMatchupId, setOddsMatchupId] = useState<number | null>(null);
  const [graphModal, setGraphModal] = useState<{ eventId: string; selection: string } | null>(null);
  const [compareRow, setCompareRow] = useState<FeedRow | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Accumulated feed rows. Initial load: all current drops.
  // Subsequent updates: prepended in real-time via WebSocket or HTTP fallback.
  const [shownRows, setShownRows] = useState<FeedRow[]>([]);

  // Tracks rowKey → { odds, dropAt } last shown — deduplicates WS + HTTP poll updates
  const lastShownRef = useRef<Map<string, { odds: number; dropAt: number }>>(new Map());
  const initializedRef = useRef(false);

  // Pause state
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const frozenRowsRef = useRef<FeedRow[] | null>(null);
  const pendingWsRowsRef = useRef<FeedRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Keep pausedRef in sync so WS callbacks always see the current value
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Configs ref for WS callback (avoids stale closure, no re-subscribe needed)
  const configsRef = useRef(configs);
  useEffect(() => { configsRef.current = configs; }, [configs]);


  // ---------------------------------------------------------------------------
  // HTTP fallback poll — 60s interval (backup if WS misses something)
  // ---------------------------------------------------------------------------
  const { data: events, isLoading } = useGetOddsDrops(undefined, {
    query: {
      queryKey: getGetOddsDropsQueryKey(),
      refetchInterval: 60_000,
    },
  });

  const { data: summary } = useGetOddsSummary({
    query: { refetchInterval: 30000 },
  });

  // Build candidate rows from latest HTTP data (for initial load + fallback sync)
  const liveRows = useMemo(() => buildRows(events, configs, "newest"), [events, configs]);

  useEffect(() => {
    if (!initializedRef.current) {
      // First load: show all current drops immediately so the feed starts populated.
      if (!liveRows.length) return; // wait until we have the REST response
      initializedRef.current = true;
      const initialEntries: FeedRow[] = [];
      liveRows.forEach(r => {
        const key = rowKey(r);
        const dropAt = r.newDropAt ? new Date(r.newDropAt as string).getTime() : 0;
        lastShownRef.current.set(key, { odds: r.currentOdds, dropAt });
        initialEntries.push({ ...r, alertedAt: Date.now() });
      });
      if (initialEntries.length > 0) {
        setShownRows(initialEntries.slice(0, MAX_FEED_ROWS));
      }
      return;
    }

    // Subsequent HTTP polls (every 60s): add rows whose newDropAt changed or odds moved.
    const newEntries: FeedRow[] = [];
    for (const row of liveRows) {
      const key = rowKey(row);
      const last = lastShownRef.current.get(key);
      const dropAtMs = row.newDropAt ? new Date(row.newDropAt as string).getTime() : 0;
      const oddsChanged = !last || last.odds !== row.currentOdds;
      const reAlerted = last && dropAtMs > 0 && dropAtMs > last.dropAt;
      if (oddsChanged || reAlerted) {
        lastShownRef.current.set(key, { odds: row.currentOdds, dropAt: dropAtMs });
        newEntries.push({ ...row, alertedAt: Date.now() });
      }
    }
    if (newEntries.length > 0) {
      setShownRows(prev => {
        const existing = new Set(prev.map(rowKey));
        const fresh = newEntries.filter(r => !existing.has(rowKey(r)));
        return [...fresh, ...prev].slice(0, MAX_FEED_ROWS);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRows]);

  // ---------------------------------------------------------------------------
  // WebSocket real-time stream
  // ---------------------------------------------------------------------------
  // WS event buffer — drained one row at a time by flushWsBuffer
  const wsBufferRef = useRef<FeedRow[]>([]);
  const wsFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flush exactly ONE row from the buffer at a time so drops always
  // appear individually regardless of how many arrived together.
  const flushWsBuffer = useCallback(() => {
    wsFlushTimerRef.current = null;
    if (wsBufferRef.current.length === 0) return;

    // Pop the first (newest) row
    const [next, ...rest] = wsBufferRef.current;
    wsBufferRef.current = rest;

    if (pausedRef.current) {
      pendingWsRowsRef.current = [next, ...pendingWsRowsRef.current];
      setPendingCount(prev => prev + 1);
    } else {
      setShownRows(prev => [next, ...prev].slice(0, MAX_FEED_ROWS));
    }

    // If more rows are waiting, schedule the next one after a short visible gap
    if (rest.length > 0) {
      wsFlushTimerRef.current = setTimeout(flushWsBuffer, 600);
    }
  }, []);

  const handleOddsUpdate = useCallback((event: WsOddsEventUpdate) => {
    const newEntries = wsEventToRows(event, configsRef.current, lastShownRef);
    if (newEntries.length === 0) return;
    // Append to buffer — flushWsBuffer will drain them one at a time
    wsBufferRef.current = [...wsBufferRef.current, ...newEntries];
    if (!wsFlushTimerRef.current) {
      wsFlushTimerRef.current = setTimeout(flushWsBuffer, 0);
    }
  }, [flushWsBuffer]);


  // WebSocket drives real-time feed updates; layout handles chimes via SSE separately
  useWsFeed({ onOddsUpdate: handleOddsUpdate });


  // ---------------------------------------------------------------------------
  // Display filtering + sorting
  // ---------------------------------------------------------------------------
  const sortedShownRows = useMemo(() => {
    const filtered = shownRows.filter(row =>
      configs.some(c =>
        lineMatchesConfig(
          { sport: row.sport, marketType: row.marketType },
          { changePercent: row.changePercent, currentOdds: row.currentOdds },
          row.commenceTime,
          c,
        )
      )
    );
    return applySort(filtered, sortBy);
  }, [shownRows, sortBy, configs]);

  // ---------------------------------------------------------------------------
  // Pause / resume
  // ---------------------------------------------------------------------------
  function handlePause() {
    if (!paused) {
      frozenRowsRef.current = [...sortedShownRows];
      pendingWsRowsRef.current = [];
      setPendingCount(0);
      setPaused(true);
    } else {
      // Flush queued WS rows
      const queued = pendingWsRowsRef.current;
      pendingWsRowsRef.current = [];
      if (queued.length > 0) {
        setShownRows(prev => [...queued, ...prev].slice(0, MAX_FEED_ROWS));
      }
      frozenRowsRef.current = null;
      setPendingCount(0);
      setPaused(false);
    }
  }

  function handleReveal() {
    const queued = pendingWsRowsRef.current;
    pendingWsRowsRef.current = [];
    if (queued.length > 0) {
      setShownRows(prev => [...queued, ...prev].slice(0, MAX_FEED_ROWS));
    }
    frozenRowsRef.current = null;
    setPendingCount(0);
    setPaused(false);
  }

  // When sort changes while paused, re-sort the frozen snapshot
  useEffect(() => {
    if (paused && frozenRowsRef.current) {
      frozenRowsRef.current = applySort(frozenRowsRef.current, sortBy);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const displayRows = paused && frozenRowsRef.current !== null ? frozenRowsRef.current : sortedShownRows;
  const activeConfigs = configs.filter(c => c.enabled);

  return (
    <Layout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Live Market Feed</h1>
        <p className="text-muted-foreground text-sm">
          Fresh Pinnacle drops detected in real-time.
          {activeConfigs.length > 0 && (
            <span className="ml-2 text-primary font-medium">{activeConfigs.length} active alert config{activeConfigs.length !== 1 ? "s" : ""}.</span>
          )}
        </p>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-3 mb-4 bg-card border rounded-lg px-4 py-2.5 flex-wrap">
        <TrendingDown className="w-4 h-4 text-green-400 shrink-0" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{displayRows.length}</span> drops matching your alert configs
        </span>
        {summary && (summary.monitoringCount ?? summary.totalEvents) > 0 && (
          <span className="text-xs text-muted-foreground/60 border-l border-border pl-3">
            Monitoring <span className="font-semibold text-muted-foreground">{(summary.monitoringCount ?? summary.totalEvents).toLocaleString()}</span> live markets
          </span>
        )}

        {/* Pending events badge */}
        {paused && pendingCount > 0 && (
          <button
            onClick={handleReveal}
            className="ml-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-2.5 py-0.5 transition-colors"
          >
            +{pendingCount} new
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Live stream indicator */}
          <span className="flex items-center gap-1 text-[10px] font-mono text-green-400 uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </span>

          {paused && (
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide">Paused</span>
          )}

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                <ArrowUpDown className="w-3 h-3" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[210px]">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sort order
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSortBy(key)}
                  className="text-xs flex items-center justify-between"
                >
                  {label}
                  {sortBy === key && <Check className="w-3 h-3 text-primary ml-2 shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pause button */}
          <Button
            size="sm"
            variant={paused ? "default" : "outline"}
            className={`h-7 text-xs gap-1.5 ${paused ? "bg-amber-600 hover:bg-amber-500 border-amber-600" : ""}`}
            onClick={handlePause}
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {paused ? "Resume" : "Pause"}
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-x-auto">
        <Table className="min-w-[960px]">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[200px]">Match</TableHead>
              <TableHead className="w-[90px] text-center">Starts in</TableHead>
              <TableHead className="w-[90px] text-center">Alert</TableHead>
              <TableHead className="w-[110px]">Sport</TableHead>
              <TableHead className="w-[130px]">Bet type</TableHead>
              <TableHead className="w-[160px] text-center">Odds movement</TableHead>
              <TableHead className="w-[130px] text-right">Drop / Trend</TableHead>
              <TableHead className="w-[160px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(8).fill(0).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-14 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingDown className="w-7 h-7 text-muted-foreground/30 mb-1" />
                    <span className="font-medium text-sm text-foreground">No drops detected yet</span>
                    {summary && (summary.monitoringCount ?? summary.totalEvents) > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Monitoring <span className="font-semibold text-primary">{(summary.monitoringCount ?? summary.totalEvents).toLocaleString()}</span> real Pinnacle markets — drops appear as lines move.
                      </span>
                    ) : (
                      <span className="text-xs">Waiting for Pinnacle data...</span>
                    )}
                    <Link href="/alert-configurations">
                      <span className="text-sm mt-1 text-primary hover:underline cursor-pointer">
                        Adjust drop threshold →
                      </span>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row, i) => (
                <FeedTableRow
                  key={`${row.eventId}-${row.selection}-${i}`}
                  row={row}
                  novigMethod={novigMethod}
                  comparisonBookmakers={comparisonBookmakers}
                  onLogBet={setLogBetRow}
                  onOddsModal={setOddsMatchupId}
                  onGraphClick={(eventId, selection) => setGraphModal({ eventId, selection })}
                  onCompare={setCompareRow}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {graphModal && (
        <EventGraphModal
          eventId={graphModal.eventId}
          defaultSelection={graphModal.selection}
          onClose={() => setGraphModal(null)}
        />
      )}
      {compareRow && (
        <OddsCompareModal
          open={true}
          onClose={() => setCompareRow(null)}
          homeTeam={compareRow.homeTeam}
          awayTeam={compareRow.awayTeam}
          sport={compareRow.sport}
          leagueName={compareRow.leagueName}
          commenceTime={compareRow.commenceTime}
          marketType={compareRow.marketType}
          selection={compareRow.selection}
          pinnacleOdds={compareRow.currentOdds}
          configuredBookmakers={comparisonBookmakers}
        />
      )}
      {logBetRow && (
        <LogBetModal row={logBetRow} onClose={() => setLogBetRow(null)} />
      )}
      {oddsMatchupId !== null && (
        <PinnacleOddsModal matchupId={oddsMatchupId} onClose={() => setOddsMatchupId(null)} />
      )}
    </Layout>
  );
}
