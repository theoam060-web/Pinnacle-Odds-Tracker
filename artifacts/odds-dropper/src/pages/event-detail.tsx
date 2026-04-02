import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useGetOddsDropById, getGetOddsDropByIdQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { formatOdds, formatTime, formatDate } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore, NovigMethod } from "@/lib/alert-context";
import { ChevronLeft, TrendingDown } from "lucide-react";
import { Link } from "wouter";

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
  rawTime: string;
  odds?: number;
  novig?: number;
  limit?: number;
}

interface LogRow {
  time: string;
  odds: number;
  novig: number;
  delta: number;
  limit?: number;
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

  // Opening anchor from lines
  const openLine = lines.find(l => l.selection === sel);

  const points: ChartPoint[] = [];
  if (openLine) {
    points.push({
      time: "Open",
      rawTime: "Open",
      odds: parseFloat(openLine.openingOdds.toFixed(3)),
      novig: parseFloat(openLine.openingOdds.toFixed(3)),
    });
  }

  for (const m of selMovements) {
    const allOdds = lines.map(l => {
      const latest = movements
        .filter(mv => mv.selection === l.selection && new Date(mv.timestamp).getTime() <= new Date(m.timestamp).getTime())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return latest?.odds ?? l.currentOdds;
    });

    const selIdx = lines.findIndex(l => l.selection === sel);
    const novigAll = computeNovig(allOdds, selIdx);

    points.push({
      time: formatTime(m.timestamp),
      rawTime: new Date(m.timestamp).toISOString(),
      odds: parseFloat(m.odds.toFixed(3)),
      novig: parseFloat((novigAll[novigMethod] ?? m.odds).toFixed(3)),
      limit: m.limit != null ? Math.round(m.limit) : undefined,
    });
  }

  return points;
}

function buildLogRows(chartPoints: ChartPoint[]): LogRow[] {
  const rows: LogRow[] = [];
  for (let i = chartPoints.length - 1; i >= 0; i--) {
    const p = chartPoints[i];
    if (p.odds === undefined) continue;
    const prev = chartPoints.slice(0, i).filter(q => q.odds !== undefined).at(-1);
    rows.push({
      time: p.time,
      odds: p.odds,
      novig: p.novig ?? p.odds,
      delta: prev?.odds !== undefined ? parseFloat((p.odds - prev.odds).toFixed(3)) : 0,
      limit: p.limit,
    });
  }
  return rows;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-md px-3 py-2 text-xs shadow-xl space-y-1 min-w-[140px]">
      <div className="text-muted-foreground font-mono mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>
            {p.dataKey === "limit" ? p.value?.toLocaleString() : formatOdds(p.value)}
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

  const { data: event, isLoading } = useGetOddsDropById(id || "", {
    query: {
      queryKey: getGetOddsDropByIdQueryKey(id || ""),
      enabled: !!id,
      refetchInterval: 5000,
    },
  });

  const [activeSelection, setActiveSelection] = useState<string>("");
  const [showOdds, setShowOdds] = useState(true);
  const [showVig, setShowVig] = useState(true);
  const [showLimit, setShowLimit] = useState(true);

  const sel = activeSelection || (event?.lines[0]?.selection ?? "");

  const chartData = useMemo(() => {
    if (!event) return [];
    return buildChartData(event.movements, event.lines, sel, novigMethod);
  }, [event, sel, novigMethod]);

  const logRows = useMemo(() => buildLogRows(chartData), [chartData]);

  const hasLimits = chartData.some(p => p.limit !== undefined);
  const tickCount = event?.movements.filter(m => m.selection === sel).length ?? 0;

  // OHLC stats
  const oddsPoints = chartData.filter(p => p.odds !== undefined);
  const openOdds = oddsPoints[0]?.odds;
  const closeOdds = oddsPoints[oddsPoints.length - 1]?.odds;
  const lowOdds = oddsPoints.length ? Math.min(...oddsPoints.map(p => p.odds!)) : undefined;
  const highOdds = oddsPoints.length ? Math.max(...oddsPoints.map(p => p.odds!)) : undefined;
  const vigPct = event ? computeVigPct(event.lines) : undefined;

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-card w-1/3 rounded" />
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
      {/* Header */}
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to feed
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-[10px] uppercase">{event.sport}</Badge>
              <span className="text-xs text-muted-foreground">{event.leagueName}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {event.homeTeam}{" "}
              <span className="text-muted-foreground font-normal text-lg">vs</span>{" "}
              {event.awayTeam}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(event.commenceTime)} · {formatTime(event.commenceTime)}
              {event.commenceTime && (() => {
                const ms = new Date(event.commenceTime).getTime() - Date.now();
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                return ms > 0 ? ` (in ${h}h ${m}m)` : "";
              })()}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Market</div>
            <div className="text-base font-semibold bg-card border rounded px-3 py-1.5 capitalize">
              {event.marketType.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Selection tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {event.lines.map(line => {
          const active = sel === line.selection;
          const drop = line.changePercent < 0;
          return (
            <button
              key={line.selection}
              onClick={() => setActiveSelection(line.selection)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all border ${
                active
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/5 text-muted-foreground hover:border-white/15 hover:text-foreground"
              }`}
            >
              <span className="capitalize">{line.selection}</span>
              <span className={`ml-2 font-mono ${drop ? "text-green-400" : "text-red-400"}`}>
                {formatOdds(line.currentOdds)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main chart card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
        {/* OHLC stats bar */}
        {openOdds !== undefined && (
          <div className="flex items-center gap-4 px-4 py-2 border-b border-border/50 text-[11px] font-mono flex-wrap">
            <span><span className="text-muted-foreground">O:</span> <span className="text-foreground">{formatOdds(openOdds)}</span></span>
            <span><span className="text-muted-foreground">L:</span> <span className="text-green-400">{formatOdds(lowOdds!)}</span></span>
            <span><span className="text-muted-foreground">H:</span> <span className="text-red-400">{formatOdds(highOdds!)}</span></span>
            <span><span className="text-muted-foreground">C:</span> <span className="text-white font-bold">{formatOdds(closeOdds!)}</span></span>
            {vigPct !== undefined && (
              <span><span className="text-muted-foreground">V:</span> <span className="text-amber-400">{vigPct.toFixed(2)}%</span></span>
            )}
            <span className="ml-auto text-muted-foreground/60">{tickCount} ticks</span>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 1 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: hasLimits && showLimit ? 52 : 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: "#666" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={40}
                />
                <YAxis
                  yAxisId="odds"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#666" }}
                  tickFormatter={v => formatOdds(v)}
                  domain={["auto", "auto"]}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
                {hasLimits && showLimit && (
                  <YAxis
                    yAxisId="limit"
                    orientation="left"
                    tick={{ fontSize: 10, fill: "#666" }}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                    domain={["auto", "auto"]}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />

                {/* Limit bar/line (left axis) */}
                {hasLimits && showLimit && (
                  <Bar
                    yAxisId="limit"
                    dataKey="limit"
                    name="Limit"
                    fill="rgba(99,102,241,0.15)"
                    stroke="rgba(99,102,241,0.4)"
                    strokeWidth={1}
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={false}
                  />
                )}

                {/* No-vig odds (red) */}
                {showVig && (
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

                {/* Raw odds (blue) */}
                {showOdds && (
                  <Line
                    yAxisId="odds"
                    type="stepAfter"
                    dataKey="odds"
                    name="Odds"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#38bdf8" }}
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
            <span>Not enough movement history yet — check back after more polls.</span>
          </div>
        )}

        {/* Toggle buttons */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/50">
          <button
            onClick={() => setShowOdds(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
              showOdds ? "border-sky-500/50 text-sky-400 bg-sky-500/10" : "border-white/5 text-muted-foreground"
            }`}
          >
            <span className="w-3 h-0.5 rounded" style={{ background: showOdds ? "#38bdf8" : "#555" }} />
            Odds
          </button>
          <button
            onClick={() => setShowVig(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
              showVig ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/5 text-muted-foreground"
            }`}
          >
            <span className="w-3 h-0.5 rounded" style={{ background: showVig ? "#f87171" : "#555" }} />
            No-vig
          </button>
          {hasLimits && (
            <button
              onClick={() => setShowLimit(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all border ${
                showLimit ? "border-indigo-500/50 text-indigo-400 bg-indigo-500/10" : "border-white/5 text-muted-foreground"
              }`}
            >
              <span className="w-3 h-1.5 rounded-sm" style={{ background: showLimit ? "rgba(99,102,241,0.4)" : "#555" }} />
              Limit
            </button>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground/50 font-mono">{tickCount} ticks</span>
        </div>
      </div>

      {/* Two-column layout: tick log + current lines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Movement log */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/50">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Movement Log</h3>
          </div>
          <div className="overflow-auto max-h-[340px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card border-b border-border/50">
                <tr>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Odds</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Limit ($)</th>
                </tr>
              </thead>
              <tbody>
                {logRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-muted-foreground">No ticks recorded yet</td>
                  </tr>
                ) : (
                  logRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-1.5 font-mono text-muted-foreground">{row.time}</td>
                      <td className="px-4 py-1.5">
                        <span className="font-mono text-sky-400 font-bold">{formatOdds(row.odds)}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="font-mono text-red-400">{formatOdds(row.novig)}</span>
                        {row.delta !== 0 && (
                          <span className={`ml-2 font-mono font-bold ${row.delta < 0 ? "text-green-400" : "text-red-400"}`}>
                            {row.delta > 0 ? "+" : ""}{row.delta.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono text-muted-foreground">
                        {row.limit != null ? row.limit.toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current lines */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/50">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Lines</h3>
          </div>
          <div className="p-3 space-y-2.5">
            {event.lines.map(line => {
              const drop = line.changePercent < 0;
              const pct = Math.abs(line.changePercent);
              return (
                <div key={line.selection} className="bg-background/40 border border-border/40 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold capitalize">{line.selection}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      drop ? "bg-green-500/10 text-green-400" : pct > 0.01 ? "bg-red-500/10 text-red-400" : "text-muted-foreground"
                    }`}>
                      {drop ? "↓" : pct > 0.01 ? "↑" : "—"} {pct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <div>
                      <div className="text-muted-foreground mb-0.5">Open</div>
                      <div className="font-mono text-muted-foreground/80">{formatOdds(line.openingOdds)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground mb-0.5">Current</div>
                      <div className={`font-mono text-base font-bold ${drop ? "text-green-400" : "text-foreground"}`}>
                        {formatOdds(line.currentOdds)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
