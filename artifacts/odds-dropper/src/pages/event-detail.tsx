import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useGetOddsDropById, getGetOddsDropByIdQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatOdds, formatTime, formatDate } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore, NovigMethod } from "@/lib/alert-context";
import { ChevronLeft, TrendingDown, BookmarkPlus } from "lucide-react";
import { Link } from "wouter";
import { useBetStore, getCurrencySymbol } from "@/lib/bet-store";
import { LogBetModal } from "@/components/log-bet-modal";
import { format } from "date-fns";

type OddsMovement = {
  timestamp: Date | string;
  odds: number;
  selection: string;
  limit?: number | null;
};

type EventLine = {
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  direction: string;
};

type EventDetail = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sport: string;
  commenceTime: Date | string;
  marketType: string;
  lines: EventLine[];
  movements: OddsMovement[];
};

interface ChartPoint {
  time: string;
  rawMs: number;
  odds?: number;
  novig?: number;
  limit?: number;
  vig?: number;
}

interface LogRow {
  timeLabel: string;
  odds: number;
  novig: number;
  delta: number;
  limit?: number;
}

function marketLabel(mt: string): string {
  const map: Record<string, string> = {
    moneyline: "Moneyline",
    spread: "Spread / Handicap",
    total: "Over Under Full Time",
    asian_handicap: "Asian Handicap",
  };
  return map[mt] ?? mt.replace(/_/g, " ");
}

function selectionLabel(sel: string, mt: string): string {
  // Capitalise first letter, keep rest
  return sel.charAt(0).toUpperCase() + sel.slice(1);
}

function computeVigPct(lines: EventLine[]): number {
  const sum = lines.reduce((s, l) => s + 1 / l.currentOdds, 0);
  return (sum - 1) * 100;
}

function buildChartData(
  movements: OddsMovement[],
  lines: EventLine[],
  sel: string,
  novigMethod: NovigMethod,
): ChartPoint[] {
  const selMovements = movements
    .filter(m => m.selection === sel)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (!selMovements.length) return [];

  // Only keep ticks where odds actually changed (change-detection).
  // Always keep the very first and very last readings as anchors.
  const significant: OddsMovement[] = [];
  let prevOdds: number | null = null;
  for (const m of selMovements) {
    if (prevOdds === null || Math.abs(m.odds - prevOdds) > 0.0001) {
      significant.push(m);
      prevOdds = m.odds;
    }
  }
  // Always include the latest reading so the chart is up to date
  const last = selMovements[selMovements.length - 1];
  if (significant.length === 0 || significant[significant.length - 1] !== last) {
    significant.push(last);
  }

  const selIdx = lines.findIndex(l => l.selection === sel);

  // Helper: find all sides' odds at a given timestamp
  function allOddsAt(ts: number): number[] {
    return lines.map(l => {
      const latest = movements
        .filter(mv => mv.selection === l.selection && new Date(mv.timestamp).getTime() <= ts)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return latest?.odds ?? l.currentOdds;
    });
  }

  const openLine = lines.find(l => l.selection === sel);
  const points: ChartPoint[] = [];

  // Opening anchor — only add if opening odds differ from the first significant tick
  if (openLine) {
    const allOddsAtOpen = lines.map(l => l.openingOdds);
    const novigAtOpen = computeNovig(allOddsAtOpen, selIdx);
    const overroundOpen = allOddsAtOpen.reduce((s, o) => s + 1 / o, 0);
    const firstTs = new Date(significant[0].timestamp).getTime();
    points.push({
      time: "Open",
      rawMs: firstTs - 1,
      odds: parseFloat(openLine.openingOdds.toFixed(3)),
      novig: parseFloat((novigAtOpen[novigMethod] ?? openLine.openingOdds).toFixed(3)),
      vig: parseFloat(((overroundOpen - 1) * 100).toFixed(2)),
    });
  }

  for (const m of significant) {
    const ts = new Date(m.timestamp).getTime();
    const allOdds = allOddsAt(ts);
    const novigAll = computeNovig(allOdds, selIdx);
    const overround = allOdds.reduce((s, o) => s + 1 / o, 0);

    points.push({
      time: format(new Date(m.timestamp), "HH:mm"),
      rawMs: ts,
      odds: parseFloat(m.odds.toFixed(3)),
      novig: parseFloat((novigAll[novigMethod] ?? m.odds).toFixed(3)),
      limit: m.limit != null ? Math.round(m.limit) : undefined,
      vig: parseFloat(((overround - 1) * 100).toFixed(2)),
    });
  }

  return points;
}

function buildLogRows(movements: OddsMovement[], lines: EventLine[], sel: string, novigMethod: NovigMethod): LogRow[] {
  // Sort chronologically, then change-detect (keep only ticks where odds moved)
  const selMovements = movements
    .filter(m => m.selection === sel)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const significant: OddsMovement[] = [];
  let prevOdds: number | null = null;
  for (const m of selMovements) {
    if (prevOdds === null || Math.abs(m.odds - prevOdds) > 0.0001) {
      significant.push(m);
      prevOdds = m.odds;
    }
  }
  // Always include the latest reading
  const last = selMovements[selMovements.length - 1];
  if (last && (significant.length === 0 || significant[significant.length - 1] !== last)) {
    significant.push(last);
  }

  const selIdx = lines.findIndex(l => l.selection === sel);

  // Build rows newest-first
  const rows: LogRow[] = [];
  for (let i = significant.length - 1; i >= 0; i--) {
    const m = significant[i];
    const ts = new Date(m.timestamp).getTime();
    const allOdds = lines.map(l => {
      const latest = movements
        .filter(mv => mv.selection === l.selection && new Date(mv.timestamp).getTime() <= ts)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return latest?.odds ?? l.currentOdds;
    });
    const novigVal = computeNovig(allOdds, selIdx)[novigMethod] ?? m.odds;
    const prevEntry = significant[i - 1];
    const delta = prevEntry ? parseFloat((m.odds - prevEntry.odds).toFixed(3)) : 0;

    rows.push({
      timeLabel: format(new Date(m.timestamp), "HH:mm:ss"),
      odds: m.odds,
      novig: novigVal,
      delta,
      limit: m.limit != null ? Math.round(m.limit) : undefined,
    });
  }
  return rows;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-xs shadow-xl min-w-[150px] space-y-1">
      <div className="text-muted-foreground font-mono mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-mono font-bold" style={{ color: p.color }}>
            {p.dataKey === "limit"
              ? p.value?.toLocaleString()
              : p.dataKey === "vig"
                ? `${p.value?.toFixed(2)}%`
                : formatOdds(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function EventDetailPage() {
  const [, params] = useRoute("/event/:id");
  const id = params?.id;
  const { novigMethod } = useAlertStore();
  const { currency } = useBetStore();
  const sym = getCurrencySymbol(currency);

  const { data: event, isLoading } = useGetOddsDropById(id || "", {
    query: {
      queryKey: getGetOddsDropByIdQueryKey(id || ""),
      enabled: !!id,
      refetchInterval: 5000,
    },
  });

  const [activeSelection, setActiveSelection] = useState<string>("");
  const [showOdds, setShowOdds] = useState(true);
  const [showNovig, setShowNovig] = useState(true);
  const [showLimit, setShowLimit] = useState(true);
  const [logBetRow, setLogBetRow] = useState<null | {
    eventId: string; homeTeam: string; awayTeam: string; leagueName: string;
    sport: string; selection: string; marketType: string; commenceTime: string;
    currentOdds: number; novigOdds: number;
  }>(null);

  const sel = activeSelection || (event?.lines[0]?.selection ?? "");

  const chartData = useMemo(() => {
    if (!event) return [];
    return buildChartData(event.movements, event.lines, sel, novigMethod);
  }, [event, sel, novigMethod]);

  const logRows = useMemo(() => {
    if (!event) return [];
    return buildLogRows(event.movements, event.lines, sel, novigMethod);
  }, [event, sel, novigMethod]);

  const hasLimits = useMemo(() => (event?.movements ?? []).some(m => m.limit != null), [event]);
  // Count actual odds changes (not raw poll count)
  const tickCount = useMemo(() => {
    const selMovs = (event?.movements ?? [])
      .filter(m => m.selection === sel)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    let count = 0;
    let prev: number | null = null;
    for (const m of selMovs) {
      if (prev === null || Math.abs(m.odds - prev) > 0.0001) { count++; prev = m.odds; }
    }
    return count;
  }, [event, sel]);

  const oddsPoints = chartData.filter(p => p.odds !== undefined);
  const openOdds = oddsPoints[0]?.odds;
  const closeOdds = oddsPoints[oddsPoints.length - 1]?.odds;
  const lowOdds = oddsPoints.length ? Math.min(...oddsPoints.map(p => p.odds!)) : undefined;
  const highOdds = oddsPoints.length ? Math.max(...oddsPoints.map(p => p.odds!)) : undefined;
  const vigPct = event ? computeVigPct(event.lines) : undefined;

  // Current novig for the active selection
  const activeLine = event?.lines.find(l => l.selection === sel);
  const allCurrentOdds = event?.lines.map(l => l.currentOdds) ?? [];
  const selIdx = event?.lines.findIndex(l => l.selection === sel) ?? 0;
  const currentNovig = event ? computeNovig(allCurrentOdds, selIdx)[novigMethod] : undefined;

  // Time until match
  const timeUntilLabel = useMemo(() => {
    if (!event) return "";
    const ms = new Date(event.commenceTime).getTime() - Date.now();
    if (ms <= 0) return "Live";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h === 0) return `in ${m}m`;
    return `in ${h}h ${m}m`;
  }, [event]);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-5 bg-card w-1/4 rounded" />
          <div className="h-8 bg-card w-2/3 rounded" />
          <div className="h-80 bg-card rounded" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Event not found.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* ── Back link ── */}
        <Link href="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to feed
        </Link>

        {/* ── Match header (reference image style) ── */}
        <div className="bg-card border border-border rounded-lg px-4 py-3 mb-3">
          <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-foreground">
            <span>{event.leagueName}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-base font-bold leading-tight">
              {event.homeTeam} <span className="text-muted-foreground font-normal text-sm">vs.</span> {event.awayTeam}
            </h1>
            <button
              className="shrink-0 flex items-center gap-1 text-xs border border-border rounded px-2 py-1 text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
              onClick={() => {
                const line = event.lines.find(l => l.selection === sel);
                if (!line) return;
                const novig = computeNovig(event.lines.map(l => l.currentOdds), event.lines.findIndex(l => l.selection === sel));
                setLogBetRow({
                  eventId: event.id,
                  homeTeam: event.homeTeam,
                  awayTeam: event.awayTeam,
                  leagueName: event.leagueName,
                  sport: event.sport,
                  selection: sel,
                  marketType: event.marketType,
                  commenceTime: typeof event.commenceTime === "string" ? event.commenceTime : new Date(event.commenceTime).toISOString(),
                  currentOdds: line.currentOdds,
                  novigOdds: novig[novigMethod],
                });
              }}
            >
              <BookmarkPlus className="w-3 h-3" />
              Log bet
            </button>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {format(new Date(event.commenceTime), "MM/dd, HH:mm")}
            {timeUntilLabel && (
              <span className="ml-1.5 text-primary/80">({timeUntilLabel})</span>
            )}
          </div>
        </div>

        {/* ── Market type + selection ── */}
        <div className="text-center mb-3">
          <div className="text-xs text-muted-foreground mb-0.5">{marketLabel(event.marketType)}</div>
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {event.lines.map(line => {
              const active = sel === line.selection;
              const drop = line.changePercent < 0;
              return (
                <button
                  key={line.selection}
                  onClick={() => setActiveSelection(line.selection)}
                  className={`px-3 py-1 rounded-md text-sm font-bold transition-all border ${
                    active
                      ? "bg-white/10 border-white/20 text-white shadow-sm"
                      : "border-white/5 text-muted-foreground hover:border-white/15 hover:text-foreground"
                  }`}
                >
                  {selectionLabel(line.selection, event.marketType)}
                  <span className={`ml-2 text-xs font-mono ${drop ? "text-green-400" : "text-red-400"}`}>
                    {formatOdds(line.currentOdds)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main chart card ── */}
        <div className="bg-card border border-border rounded-lg overflow-hidden mb-3">

          {/* OHLC stats bar */}
          {openOdds !== undefined && (
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 text-[11px] font-mono flex-wrap bg-black/20">
              <span><span className="text-muted-foreground">O:</span> <span className="text-foreground">{formatOdds(openOdds)}</span></span>
              <span><span className="text-muted-foreground">L:</span> <span className="text-sky-400">{formatOdds(lowOdds!)}</span></span>
              <span><span className="text-muted-foreground">H:</span> <span className="text-red-400">{formatOdds(highOdds!)}</span></span>
              <span><span className="text-muted-foreground">C:</span> <span className="text-white font-bold">{formatOdds(closeOdds!)}</span></span>
              {vigPct !== undefined && (
                <span><span className="text-muted-foreground">V:</span> <span className="text-amber-400">{vigPct.toFixed(2)}%</span></span>
              )}
              {currentNovig !== undefined && (
                <span className="text-muted-foreground/50">|</span>
              )}
              {currentNovig !== undefined && (
                <span><span className="text-muted-foreground">NV:</span> <span className="text-emerald-400">{formatOdds(currentNovig)}</span></span>
              )}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 ? (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 56, left: hasLimits ? 8 : -20, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#555" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={50}
                  />
                  {/* Left axis: limit (if data available) */}
                  {hasLimits ? (
                    <YAxis
                      yAxisId="limit"
                      orientation="left"
                      tick={showLimit ? { fontSize: 10, fill: "#818cf8" } : false}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                      domain={["auto", "auto"]}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                    />
                  ) : (
                    /* No limits: use left axis for vig% as a subtle guide */
                    <YAxis
                      yAxisId="limit"
                      orientation="left"
                      hide
                      domain={["auto", "auto"]}
                    />
                  )}
                  {/* Right axis: odds */}
                  <YAxis
                    yAxisId="odds"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#38bdf8" }}
                    tickFormatter={v => formatOdds(v)}
                    domain={["auto", "auto"]}
                    tickLine={false}
                    axisLine={false}
                    width={46}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Current odds reference line */}
                  {closeOdds !== undefined && (
                    <ReferenceLine
                      yAxisId="odds"
                      y={closeOdds}
                      stroke="rgba(56,189,248,0.15)"
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* No-vig line (red) */}
                  {showNovig && (
                    <Line
                      yAxisId="odds"
                      type="stepAfter"
                      dataKey="novig"
                      name="No-vig"
                      stroke="#f87171"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, fill: "#f87171" }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  )}

                  {/* Limit line (indigo) */}
                  {hasLimits && showLimit && (
                    <Line
                      yAxisId="limit"
                      type="stepAfter"
                      dataKey="limit"
                      name="Limit"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 3, fill: "#818cf8" }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  )}

                  {/* Odds line (blue) — on top */}
                  {showOdds && (
                    <Line
                      yAxisId="odds"
                      type="stepAfter"
                      dataKey="odds"
                      name="Odds"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: "#38bdf8", strokeWidth: 2, stroke: "#0c4a6e" }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
              <TrendingDown className="w-6 h-6 opacity-30" />
              <span>Not enough movement history yet</span>
            </div>
          )}

          {/* ── Legend toggles ── */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/40 bg-black/10">
            {/* Odds toggle */}
            <button
              onClick={() => setShowOdds(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
                showOdds
                  ? "border-sky-500/50 text-sky-400 bg-sky-500/10"
                  : "border-white/5 text-muted-foreground"
              }`}
            >
              <span className="w-4 h-0.5 rounded inline-block" style={{ background: showOdds ? "#38bdf8" : "#444" }} />
              Odds
            </button>

            {/* No-vig toggle */}
            <button
              onClick={() => setShowNovig(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
                showNovig
                  ? "border-red-500/50 text-red-400 bg-red-500/10"
                  : "border-white/5 text-muted-foreground"
              }`}
            >
              <span className="w-4 h-0.5 rounded inline-block" style={{ background: showNovig ? "#f87171" : "#444" }} />
              No-vig
            </button>

            {/* Limit toggle — only shown when limit data is available */}
            {hasLimits && (
              <button
                onClick={() => setShowLimit(v => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
                  showLimit
                    ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10"
                    : "border-white/5 text-muted-foreground"
                }`}
              >
                <span className="w-4 h-0.5 rounded inline-block" style={{ background: showLimit ? "#818cf8" : "#444" }} />
                {sym} Limit
              </button>
            )}

            <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">{tickCount} ticks</span>
          </div>
        </div>

        {/* ── Tick log table (reference image style) ── */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#0f1117] border-b border-border/60 z-10">
                <tr>
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Odds / No-Vig</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Limit ({sym})</th>
                </tr>
              </thead>
              <tbody>
                {logRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-muted-foreground">No ticks recorded yet</td>
                  </tr>
                ) : (
                  logRows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/20 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Time */}
                      <td className="px-4 py-2 font-mono text-muted-foreground/70 text-[11px]">
                        {row.timeLabel}
                      </td>

                      {/* Odds / No-vig + delta */}
                      <td className="px-4 py-2">
                        <span className="font-mono font-bold text-sky-400">{formatOdds(row.odds)}</span>
                        <span className="text-muted-foreground/50 mx-1">/</span>
                        <span className="font-mono text-red-400">{formatOdds(row.novig)}</span>
                        {row.delta !== 0 && (
                          <span className={`ml-2 font-mono font-bold text-[11px] ${row.delta > 0 ? "text-red-400" : "text-green-400"}`}>
                            {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Limit */}
                      <td className="px-4 py-2 text-right font-mono text-muted-foreground">
                        {row.limit != null ? row.limit.toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Current lines summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {event.lines.map((line, lineIdx) => {
            const drop = line.changePercent < 0;
            const pct = Math.abs(line.changePercent);
            const novig = computeNovig(event.lines.map(l => l.currentOdds), lineIdx)[novigMethod];
            const isActive = line.selection === sel;
            return (
              <button
                key={line.selection}
                onClick={() => setActiveSelection(line.selection)}
                className={`bg-card border rounded-md p-3 text-left transition-all ${
                  isActive ? "border-sky-500/40 bg-sky-500/5" : "border-border hover:border-white/15"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground capitalize">{line.selection}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    drop ? "bg-green-500/10 text-green-400" : pct > 0.01 ? "bg-red-500/10 text-red-400" : "text-muted-foreground"
                  }`}>
                    {drop ? "▼" : pct > 0.01 ? "▲" : "—"} {pct.toFixed(2)}%
                  </span>
                </div>
                <div className="font-mono text-lg font-bold text-foreground leading-none">
                  {formatOdds(line.currentOdds)}
                </div>
                <div className="font-mono text-[11px] text-red-400 mt-0.5">
                  NV {formatOdds(novig)}
                </div>
                <div className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                  Open {formatOdds(line.openingOdds)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Log bet modal */}
      {logBetRow && (
        <LogBetModal row={logBetRow} onClose={() => setLogBetRow(null)} />
      )}
    </Layout>
  );
}
