import { useRef, useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { useGetOddsDrops, useGetOddsSummary, getGetOddsDropsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OddsSparkline } from "@/components/odds-sparkline";
import { LogBetModal } from "@/components/log-bet-modal";
import { CountdownTimer } from "@/components/countdown-timer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, TrendingDown, BookmarkPlus, Pause, Play, ArrowUpDown, Check } from "lucide-react";
import { formatOdds, formatTime, formatDate } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore, AlertConfig } from "@/lib/alert-context";

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
}

function formatAlertAge(dropAt: Date | string | null): string {
  if (!dropAt) return "";
  const diffMs = Date.now() - new Date(dropAt).getTime();
  if (diffMs < 0) return "just now";
  const secs = Math.floor(diffMs / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
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
        const tDiff = new Date(b.lastUpdated as Date).getTime() - new Date(a.lastUpdated as Date).getTime();
        if (tDiff !== 0) return tDiff;
        return a.changePercent - b.changePercent;
      });
    case "oldest":
      return sorted.sort((a, b) => {
        const tDiff = new Date(a.lastUpdated as Date).getTime() - new Date(b.lastUpdated as Date).getTime();
        if (tDiff !== 0) return tDiff;
        return a.changePercent - b.changePercent;
      });
    case "drop_desc":
      return sorted.sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent));
    case "drop_asc":
      return sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  }
}

function buildRows(
  events: ReturnType<typeof useGetOddsDrops>["data"],
  configs: AlertConfig[],
  sort: SortOption,
): FeedRow[] {
  if (!events) return [];
  // Show events whose drop was detected within the last 6 hours
  const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
  const rows: FeedRow[] = [];

  for (const event of events) {
    // Keep events with drops detected in the last 6 hours
    const updatedAt = new Date(event.lastUpdated as Date).getTime();
    if (updatedAt < sixHoursAgo) continue;

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
      });
    });
  }

  return applySort(rows, sort);
}

function rowKey(r: FeedRow) {
  return `${r.eventId}:${r.selection}`;
}

function dropIntensityBg(abs: number): string {
  if (abs >= 15) return "bg-green-950/30";
  if (abs >= 8) return "bg-green-950/15";
  return "";
}

// Persisted map of rowKey → currentOdds that have already been shown
const SEEN_KEY = "st:seen-drops:v1";

function loadSeenMap(): Map<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return new Map(JSON.parse(raw) as [string, number][]);
  } catch {}
  return new Map();
}

function saveSeenMap(map: Map<string, number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...map.entries()]));
  } catch {}
}

export default function FeedPage() {
  const { configs, novigMethod } = useAlertStore();
  const [logBetRow, setLogBetRow] = useState<(FeedRow & { novigOdds: number }) | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Seen-drop deduplication: key = "eventId:selection", value = last shown currentOdds
  const seenDropsRef = useRef<Map<string, number>>(loadSeenMap());

  // Pause state
  const [paused, setPaused] = useState(false);
  const frozenRowsRef = useRef<FeedRow[] | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const { data: events, isLoading } = useGetOddsDrops(undefined, {
    query: {
      queryKey: getGetOddsDropsQueryKey(),
      refetchInterval: 15000,
    },
  });

  const { data: summary } = useGetOddsSummary({
    query: { refetchInterval: 30000 },
  });

  const liveRows = useMemo(() => buildRows(events, configs, sortBy), [events, configs, sortBy]);

  // Filter to only show rows whose odds changed since they were last shown.
  // Rows are marked as "seen" on first appearance; re-shown only when currentOdds changes.
  const filteredLiveRows = useMemo(() => {
    const visible: FeedRow[] = [];
    let dirty = false;
    for (const row of liveRows) {
      const key = rowKey(row);
      const lastOdds = seenDropsRef.current.get(key);
      if (lastOdds === row.currentOdds) continue; // Already seen at this price — suppress
      seenDropsRef.current.set(key, row.currentOdds);
      dirty = true;
      visible.push(row);
    }
    if (dirty) saveSeenMap(seenDropsRef.current);
    return visible;
  // liveRows identity changes only when events/configs/sort change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRows]);

  // When paused: count new/changed rows vs frozen snapshot
  useEffect(() => {
    if (!paused || frozenRowsRef.current === null) return;
    const frozenMap = new Map(frozenRowsRef.current.map(r => [rowKey(r), r.currentOdds]));
    const newCount = filteredLiveRows.filter(r => {
      const frozenOdds = frozenMap.get(rowKey(r));
      return frozenOdds === undefined || frozenOdds !== r.currentOdds;
    }).length;
    setPendingCount(newCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, paused]);

  function handlePause() {
    if (!paused) {
      frozenRowsRef.current = [...filteredLiveRows];
      setPendingCount(0);
      setPaused(true);
    } else {
      frozenRowsRef.current = null;
      setPendingCount(0);
      setPaused(false);
    }
  }

  function handleReveal() {
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

  const displayRows = paused && frozenRowsRef.current !== null ? frozenRowsRef.current : filteredLiveRows;
  const activeConfigs = configs.filter(c => c.enabled);

  return (
    <Layout>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-foreground">Live Market Feed</h1>
        <p className="text-muted-foreground text-sm">
          Events with odds drops detected in the last 6 hours.
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
        {summary && summary.totalEvents > 0 && (
          <span className="text-xs text-muted-foreground/60 border-l border-border pl-3">
            Monitoring <span className="font-semibold text-muted-foreground">{summary.totalEvents.toLocaleString()}</span> live markets
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
              <TableHead className="w-[80px] text-center">Action</TableHead>
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
                    {summary && summary.totalEvents > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Monitoring <span className="font-semibold text-primary">{summary.totalEvents.toLocaleString()}</span> real Pinnacle football markets — drops appear as lines move.
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
              displayRows.map((row, i) => {
                const dropAbs = Math.abs(row.changePercent);

                return (
                  <TableRow
                    key={`${row.eventId}-${row.selection}-${i}`}
                    className={`hover:bg-muted/20 ${dropIntensityBg(dropAbs)}`}
                  >
                    <TableCell>
                      <Link href={`/event/${row.eventId}`}>
                        <div className="cursor-pointer group">
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
                      </Link>
                    </TableCell>

                    <TableCell className="text-center">
                      <CountdownTimer commenceTime={row.commenceTime} />
                    </TableCell>

                    <TableCell className="text-center">
                      {row.newDropAt ? (
                        <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                          {formatAlertAge(row.newDropAt)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
                      )}
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
                          <span className="text-muted-foreground text-sm line-through">
                            {formatOdds(row.openingOdds)}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                          <span className="text-foreground text-sm font-bold">
                            {formatOdds(row.currentOdds)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 tabular-nums font-semibold">
                          NV {formatOdds(computeNovig(row.allCurrentOdds, row.lineIndex)[novigMethod])}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-mono font-bold text-green-400">
                          {dropAbs.toFixed(2)}%
                        </span>
                        <OddsSparkline
                          eventId={row.eventId}
                          selection={row.selection}
                          openingOdds={row.openingOdds}
                          currentOdds={row.currentOdds}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => {
                          const novig = computeNovig(row.allCurrentOdds, row.lineIndex);
                          setLogBetRow({ ...row, novigOdds: novig[novigMethod] });
                        }}
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        Log
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {logBetRow && (
        <LogBetModal row={logBetRow} onClose={() => setLogBetRow(null)} />
      )}
    </Layout>
  );
}
