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
  // Build time-indexed buckets per selection
  const buckets = new Map<string, Map<string, { odds: number; limit?: number | null }>>();
  for (const m of movements) {
    const t = formatTime(m.timestamp);
    if (!buckets.has(t)) buckets.set(t, new Map());
    buckets.get(t)!.set(m.selection, { odds: m.odds, limit: m.limit });
  }

  // Opening anchor
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

    const allOdds = lines.map((l, i) => {
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

export function OddsGraphModal({ event, defaultSelection, onClose }: Props) {
  const [activeSelection, setActiveSelection] = useState(defaultSelection);
  const { novigMethod } = useAlertStore();

  const chartData = buildChartData(event.movements, event.lines, activeSelection, novigMethod);
  const hasLimits = chartData.some(p => p.limit !== undefined);

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="text-base">
            {event.homeTeam} <span className="text-muted-foreground text-sm font-normal">vs</span> {event.awayTeam}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px]">{event.leagueName}</Badge>
            <Badge variant="secondary" className="text-[10px] capitalize">{event.marketType.replace(/_/g, " ")}</Badge>
            <span className="text-[11px] text-muted-foreground ml-auto">
              {formatDate(event.commenceTime)} at {formatTime(event.commenceTime)}
            </span>
          </div>
        </DialogHeader>

        {/* Selection tabs */}
        <div className="flex flex-wrap gap-2 mt-2">
          {event.lines.map(line => (
            <Button
              key={line.selection}
              size="sm"
              variant={activeSelection === line.selection ? "default" : "outline"}
              className="text-xs h-7"
              onClick={() => setActiveSelection(line.selection)}
            >
              {line.selection}
            </Button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 1 ? (
          <div className="h-[320px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: hasLimits ? 52 : 8, left: -8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#888" }} />
                {/* Left axis: odds */}
                <YAxis
                  yAxisId="odds"
                  tick={{ fontSize: 10, fill: "#888" }}
                  tickFormatter={v => formatOdds(v)}
                  domain={["auto", "auto"]}
                />
                {/* Right axis: limits */}
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

                {/* Raw odds line */}
                <Line
                  yAxisId="odds"
                  type="monotone"
                  dataKey="odds"
                  name="Odds"
                  stroke="#ffb020"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                {/* No-vig line */}
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
                {/* Limit line — liquidity/market depth */}
                {hasLimits && (
                  <Line
                    yAxisId="limit"
                    type="monotone"
                    dataKey="limit"
                    name="Limit (stake)"
                    stroke="#818cf8"
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                    dot={{ r: 2.5, fill: "#818cf8" }}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Not enough movement history yet — check back after more polls.
          </div>
        )}

        {/* Legend callout */}
        {hasLimits && (
          <p className="text-[10px] text-muted-foreground -mt-1">
            <span className="inline-block w-3 h-[2px] bg-indigo-400 mr-1 align-middle" />
            Limit line = max stake Pinnacle accepts. Falling limit = sharp money detected in the market.
          </p>
        )}

        {/* Current odds summary */}
        <div className="grid grid-cols-2 gap-3 text-xs border-t border-border pt-3 mt-1">
          {event.lines.map(l => (
            <div key={l.selection} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
              <span className="text-muted-foreground capitalize">{l.selection}</span>
              <span className="font-mono font-bold">{formatOdds(l.currentOdds)}</span>
              <span className={`font-mono text-[11px] ${l.changePercent < 0 ? "text-green-400" : "text-red-400"}`}>
                {Math.abs(l.changePercent).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
