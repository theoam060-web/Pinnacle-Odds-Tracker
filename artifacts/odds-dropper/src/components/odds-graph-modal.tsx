import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatOdds, formatTime } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore, NovigMethod, NOVIG_METHOD_LABELS } from "@/lib/alert-context";
import { TrendingDown, TrendingUp } from "lucide-react";

type OddsMovement = {
  timestamp: Date | string;
  odds: number;
  selection: string;
  limit?: number | null;
};

type EventDetail = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sport: string;
  commenceTime: Date | string;
  marketType: string;
  lines: Array<{
    selection: string;
    openingOdds: number;
    currentOdds: number;
    changePercent: number;
  }>;
  movements: OddsMovement[];
};

interface Props {
  event: EventDetail;
  defaultSelection: string;
  onClose: () => void;
}

interface ChartPoint {
  time: string;
  odds?: number;
  novig?: number;
  limit?: number;
}

function buildChartData(
  movements: OddsMovement[],
  lines: EventDetail["lines"],
  selectedSelection: string,
  novigMethod: NovigMethod,
): ChartPoint[] {
  const buckets = new Map<string, Map<string, { odds: number; limit?: number | null }>>();
  for (const m of movements) {
    const t = formatTime(m.timestamp);
    if (!buckets.has(t)) buckets.set(t, new Map());
    buckets.get(t)!.set(m.selection, { odds: m.odds, limit: m.limit });
  }

  const openBucket = new Map<string, { odds: number; limit?: number | null }>();
  for (const l of lines) openBucket.set(l.selection, { odds: l.openingOdds });

  const sorted: Array<{ time: string; data: Map<string, { odds: number; limit?: number | null }> }> = [
    { time: "Open", data: openBucket },
    ...[...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, data]) => ({ time, data })),
  ];

  return sorted.map(({ time, data }) => {
    const entry = data.get(selectedSelection);
    if (!entry) return { time };

    const allOdds = lines.map(l => {
      const e = data.get(l.selection);
      return e ? e.odds : l.currentOdds;
    });

    const selIdx = lines.findIndex(l => l.selection === selectedSelection);
    const novig = computeNovig(allOdds, selIdx);

    return {
      time,
      odds: parseFloat(entry.odds.toFixed(3)),
      novig: parseFloat((novig[novigMethod] ?? NaN).toFixed(3)),
      limit: entry.limit != null ? Math.round(entry.limit) : undefined,
    };
  }).filter(p => p.odds !== undefined);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-md px-3 py-2 text-xs shadow-lg space-y-1">
      <div className="font-semibold text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>
            {p.dataKey === "limit" ? p.value.toLocaleString() : formatOdds(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

function marketLabel(mt: string): string {
  const map: Record<string, string> = {
    moneyline: "Moneyline",
    spread: "Spread / Handicap",
    total: "Over / Under",
    asian_handicap: "Asian Handicap",
  };
  return map[mt] ?? mt.replace(/_/g, " ");
}

export function OddsGraphModal({ event, defaultSelection, onClose }: Props) {
  const [activeSelection, setActiveSelection] = useState(defaultSelection);
  const { novigMethod } = useAlertStore();

  const chartData = buildChartData(event.movements, event.lines, activeSelection, novigMethod);
  const hasLimits = chartData.some(p => p.limit !== undefined);

  // Build movement log for table (filtered by selection, newest first)
  const selMovements = event.movements
    .filter(m => m.selection === activeSelection)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Enrich with opening odds delta per row
  const selLine = event.lines.find(l => l.selection === activeSelection);
  const openingOdds = selLine?.openingOdds ?? selMovements[selMovements.length - 1]?.odds ?? 0;

  const movementRows = selMovements.map((m, i) => {
    const prev = selMovements[i + 1];
    const delta = prev ? m.odds - prev.odds : m.odds - openingOdds;
    return { ...m, delta };
  });

  const firstOdds = selMovements.length > 0 ? selMovements[selMovements.length - 1]!.odds : openingOdds;
  const lastOdds = selMovements.length > 0 ? selMovements[0]!.odds : (selLine?.currentOdds ?? openingOdds);
  const totalChange = lastOdds - firstOdds;
  const totalChangePct = firstOdds > 0 ? ((totalChange / firstOdds) * 100) : 0;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="text-[10px] text-muted-foreground font-mono mb-1 uppercase tracking-wide">
            {event.leagueName}
          </div>
          <DialogTitle className="text-lg font-bold leading-tight">
            {event.homeTeam} <span className="text-muted-foreground font-normal text-base">vs</span> {event.awayTeam}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground font-mono">
              {formatDate(event.commenceTime)} · {formatTime(event.commenceTime)}
            </span>
            <Badge variant="secondary" className="text-[10px] capitalize h-4 px-1.5">
              {marketLabel(event.marketType)}
            </Badge>
            {selLine && (
              <span className={`flex items-center gap-1 text-[11px] font-mono font-semibold ml-auto ${totalChange < 0 ? "text-sky-400" : "text-red-400"}`}>
                {totalChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {totalChangePct < 0 ? "" : "+"}{totalChangePct.toFixed(2)}%
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Selection tabs */}
          <div className="flex flex-wrap gap-1.5">
            {event.lines.map(line => (
              <Button
                key={line.selection}
                size="sm"
                variant={activeSelection === line.selection ? "default" : "outline"}
                className="text-xs h-7 capitalize"
                onClick={() => setActiveSelection(line.selection)}
              >
                {line.selection}
                <span className={`ml-1 font-mono ${line.changePercent < 0 ? "text-sky-400" : "text-red-400"}`}>
                  {line.changePercent < 0 ? "" : "+"}{line.changePercent.toFixed(1)}%
                </span>
              </Button>
            ))}
          </div>

          {/* Stat strip */}
          {selLine && (
            <div className="flex items-center gap-4 text-[11px] font-mono bg-muted/30 rounded px-3 py-2">
              <span><span className="text-muted-foreground">O: </span><span className="font-bold">{formatOdds(selLine.openingOdds)}</span></span>
              <span><span className="text-muted-foreground">C: </span><span className="font-bold text-foreground">{formatOdds(selLine.currentOdds)}</span></span>
              {movementRows[0]?.limit != null && (
                <span><span className="text-muted-foreground">L: </span><span className="font-bold">{movementRows[0].limit}</span></span>
              )}
              <span><span className="text-muted-foreground">Δ: </span>
                <span className={`font-bold ${selLine.changePercent < 0 ? "text-sky-400" : "text-red-400"}`}>
                  {selLine.changePercent < 0 ? "" : "+"}{selLine.changePercent.toFixed(2)}%
                </span>
              </span>
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: hasLimits ? 52 : 8, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#888" }} />
                  <YAxis
                    yAxisId="odds"
                    tick={{ fontSize: 10, fill: "#888" }}
                    tickFormatter={v => formatOdds(v)}
                    domain={["auto", "auto"]}
                  />
                  {hasLimits && (
                    <YAxis
                      yAxisId="limit"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "#888" }}
                      tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                      domain={["auto", "auto"]}
                      width={44}
                    />
                  )}
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    yAxisId="odds"
                    type="monotone"
                    dataKey="odds"
                    name="Odds"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: "#38bdf8" }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                  <Line
                    yAxisId="odds"
                    type="monotone"
                    dataKey="novig"
                    name={`No-vig (${NOVIG_METHOD_LABELS[novigMethod]})`}
                    stroke="#22c55e"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                  {hasLimits && (
                    <Line
                      yAxisId="limit"
                      type="monotone"
                      dataKey="limit"
                      name="Limit (stake)"
                      stroke="#f87171"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      dot={{ r: 2, fill: "#f87171" }}
                      activeDot={{ r: 4 }}
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm border border-border/30 rounded">
              Not enough movement history yet — check back after more polls.
            </div>
          )}

          {/* Movement log table */}
          {movementRows.length > 0 && (
            <div className="border border-border/50 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-3 py-2 text-[10px] font-medium text-muted-foreground">Time</th>
                    <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground">Odds</th>
                    <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground">Δ</th>
                    {movementRows.some(m => m.limit != null) && (
                      <th className="text-right px-3 py-2 text-[10px] font-medium text-muted-foreground">Limit ($)</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {movementRows.map((m, i) => {
                    const isFirst = i === 0;
                    return (
                      <tr
                        key={`${m.timestamp}-${i}`}
                        className={`border-b border-border/30 last:border-0 ${isFirst ? "bg-primary/5" : "hover:bg-muted/20"}`}
                      >
                        <td className="px-3 py-1.5 font-mono text-muted-foreground tabular-nums">
                          {formatTime(m.timestamp)}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-right font-semibold text-foreground tabular-nums">
                          {formatOdds(m.odds)}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-right tabular-nums">
                          {m.delta !== 0 ? (
                            <span className={m.delta < 0 ? "text-sky-400" : "text-red-400"}>
                              {m.delta > 0 ? "+" : ""}{m.delta.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                        {movementRows.some(r => r.limit != null) && (
                          <td className="px-3 py-1.5 font-mono text-right text-muted-foreground tabular-nums">
                            {m.limit != null ? m.limit.toLocaleString() : "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
