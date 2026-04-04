import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingDown, TrendingUp, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatOdds } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { useAlertStore } from "@/lib/alert-context";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

interface Price {
  designation: string;
  decimalPrice: number;
  openingDecimalPrice: number;
  points: number | null;
  changePercent: number | null;
  direction: string | null;
}

interface Market {
  id: string;
  type: string;
  period: number;
  side: string | null;
  isAlternate: boolean;
  prices: Price[];
}

interface Matchup {
  id: number;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sport: string;
  startTime: string;
}

interface MatchupResponse {
  matchup: Matchup;
  markets: Market[];
}

interface Props {
  matchupId: number;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DESIGNATION_LABELS: Record<string, string> = {
  home: "Home",
  away: "Away",
  draw: "Draw",
  over: "Over",
  under: "Under",
  unknown: "—",
};

const DESIGNATION_COLORS: Record<string, string> = {
  home: "#60a5fa",
  away: "#f87171",
  draw: "#facc15",
  over: "#4ade80",
  under: "#fb923c",
  unknown: "#94a3b8",
};

function desigColor(d: string): string {
  return DESIGNATION_COLORS[d] ?? "#94a3b8";
}

// ---------------------------------------------------------------------------
// Chart helpers
// ---------------------------------------------------------------------------

interface NormalizedMovement {
  ms: number;
  designation: string;
  odds: number;
  stake?: number | null;
}

type ChartPoint = Record<string, number | string | undefined>;

function buildMultiSeriesData(
  movements: NormalizedMovement[],
  prices: Price[],
): { points: ChartPoint[]; designations: string[] } {
  if (!movements.length) return { points: [], designations: [] };

  const designations = [...new Set(movements.map(m => m.designation))].filter(d => d !== "unknown");
  const sorted = [...movements].sort((a, b) => a.ms - b.ms);

  const lastKnown: Record<string, number> = {};
  prices.forEach(p => { lastKnown[p.designation] = p.openingDecimalPrice; });

  const firstMs = sorted[0].ms;
  const openAnchor: ChartPoint = { ms: firstMs - 1000, time: "Open" };
  prices.forEach(p => { openAnchor[p.designation] = p.openingDecimalPrice; });

  const allMs = [...new Set(sorted.map(m => m.ms))].sort((a, b) => a - b);

  const points: ChartPoint[] = [openAnchor];

  for (const ms of allMs) {
    for (const m of sorted.filter(x => x.ms === ms)) {
      lastKnown[m.designation] = m.odds;
    }
    const point: ChartPoint = { ms, time: format(new Date(ms), "HH:mm") };
    for (const d of designations) {
      if (lastKnown[d] !== undefined) point[d] = lastKnown[d];
    }
    points.push(point);
  }

  const now = Date.now();
  const last = points[points.length - 1];
  if (last && now - (last.ms as number) > 60_000) {
    const trailing: ChartPoint = { ms: now, time: format(new Date(now), "HH:mm") };
    for (const d of designations) {
      if (lastKnown[d] !== undefined) trailing[d] = lastKnown[d];
    }
    points.push(trailing);
  }

  return { points, designations };
}

// ---------------------------------------------------------------------------
// MarketChart — fetches movements and renders multi-line chart
// ---------------------------------------------------------------------------

function MarketChart({ marketId, prices }: { marketId: string; prices: Price[] }) {
  const { data, isLoading } = useQuery<NormalizedMovement[]>({
    queryKey: ["market-chart", marketId],
    queryFn: async () => {
      // Try new-style pinnacle_market_movements first
      const r = await fetch(`/api/markets/${encodeURIComponent(marketId)}`);
      if (r.ok) {
        const { movements } = await r.json();
        if (movements?.length) {
          return movements.map((m: any) => ({
            ms: new Date(m.recordedAt).getTime(),
            designation: m.designation,
            odds: m.decimalPrice,
            stake: m.maxRiskStake,
          }));
        }
      }
      // Fallback: legacy odds_movements via /api/odds/drops/:id
      const r2 = await fetch(`/api/odds/drops/${encodeURIComponent(marketId)}`);
      if (r2.ok) {
        const ev = await r2.json();
        return (ev.movements ?? []).map((m: any) => ({
          ms: new Date(m.timestamp).getTime(),
          designation: m.selection,
          odds: m.odds,
          stake: m.limit,
        }));
      }
      return [];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-5 gap-2 text-muted-foreground/60 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading history…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted-foreground/40 text-xs">
        No historical data yet.
      </div>
    );
  }

  const { points, designations } = buildMultiSeriesData(data, prices);

  if (points.length < 2 || designations.length === 0) {
    return (
      <div className="text-center py-5 text-muted-foreground/40 text-xs">
        Not enough data for a chart.
      </div>
    );
  }

  const allOdds = points.flatMap(p =>
    designations.map(d => p[d] as number).filter(v => v != null && isFinite(v))
  );
  const rawMin = Math.min(...allOdds);
  const rawMax = Math.max(...allOdds);
  const range = rawMax - rawMin;
  // Zoom in: padding = 15% of range, but at least 0.03 so even flat lines have room
  const pad = Math.max(range * 0.15, 0.03);
  const yMin = parseFloat(Math.max(1.001, rawMin - pad).toFixed(3));
  const yMax = parseFloat((rawMax + pad).toFixed(3));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-xs space-y-0.5 shadow-xl"
        style={{ outline: "none" }}
      >
        <div className="text-muted-foreground font-mono mb-1">{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
            <span className="text-muted-foreground capitalize">{DESIGNATION_LABELS[entry.dataKey] ?? entry.dataKey}:</span>
            <span className="font-mono font-semibold text-white">{formatOdds(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-2 pb-3 px-1">
      <ResponsiveContainer width="100%" height={190}>
        <ComposedChart data={points} margin={{ top: 6, right: 10, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => formatOdds(v)}
            width={46}
          />
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: "none", zIndex: 50 }}
          />
          {designations.map(d => (
            <Line
              key={d}
              type="stepAfter"
              dataKey={d}
              stroke={desigColor(d)}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: desigColor(d) }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-3 justify-center mt-1 flex-wrap">
        {designations.map(d => (
          <div key={d} className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 rounded-full flex-shrink-0" style={{ background: desigColor(d) }} />
            <span className="text-[10px] text-muted-foreground/70 capitalize">
              {DESIGNATION_LABELS[d] ?? d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChangeArrow
// ---------------------------------------------------------------------------

function ChangeArrow({ direction, pct }: { direction: string | null; pct: number | null }) {
  if (pct == null || direction == null || direction === "stable" || Math.abs(pct) < 0.01) {
    return <span className="text-muted-foreground/50 text-[10px]">—</span>;
  }
  const isDrop = direction === "drop";
  const color = isDrop ? "text-green-400" : "text-red-400";
  const Icon = isDrop ? TrendingDown : TrendingUp;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

// ---------------------------------------------------------------------------
// PriceCell
// ---------------------------------------------------------------------------

interface PriceCellProps {
  price: Price;
  label?: string;
  novigOdds?: number;
}

function PriceCell({ price, label, novigOdds }: PriceCellProps) {
  const display = label ?? DESIGNATION_LABELS[price.designation] ?? price.designation;
  const isDrop = price.direction === "drop";
  const isRise = price.direction === "rise";
  const changed = isDrop || isRise;

  const pointsLabel =
    price.points != null ? (price.points > 0 ? `+${price.points}` : `${price.points}`) : null;

  const currentColor = isDrop ? "text-green-400" : isRise ? "text-red-400" : "text-white";

  return (
    <div className="bg-black/30 border border-white/5 rounded-md p-2 flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] text-muted-foreground font-medium truncate">
          {display}
          {pointsLabel && (
            <span className="ml-1 text-primary/70 font-mono">{pointsLabel}</span>
          )}
        </span>
        <ChangeArrow direction={price.direction} pct={price.changePercent} />
      </div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        {changed && (
          <span className="text-[11px] font-mono text-muted-foreground/50 line-through">
            {formatOdds(price.openingDecimalPrice)}
          </span>
        )}
        <span className={`text-sm font-bold font-mono ${currentColor}`}>
          {formatOdds(price.decimalPrice)}
        </span>
      </div>

      {novigOdds != null && isFinite(novigOdds) && (
        <div className="text-[11px] font-mono text-emerald-400 font-semibold">
          NV {formatOdds(novigOdds)}
        </div>
      )}

      {!changed && (
        <div className="text-[10px] text-muted-foreground/50 font-mono">
          Open: {formatOdds(price.openingDecimalPrice)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MarketGroup — one set of prices + expandable chart
// ---------------------------------------------------------------------------

function resolveLabel(designation: string, homeTeam: string, awayTeam: string): string {
  if (designation === "home") return homeTeam;
  if (designation === "away") return awayTeam;
  return DESIGNATION_LABELS[designation] ?? designation;
}

function MarketGroup({
  market,
  homeTeam,
  awayTeam,
  novigMethod,
  isExpanded,
  onToggle,
}: {
  market: Market;
  homeTeam: string;
  awayTeam: string;
  novigMethod: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const allOdds = market.prices.map(p => p.decimalPrice);
  const cells = market.prices.map((price, idx) => ({
    price,
    displayLabel: resolveLabel(price.designation, homeTeam, awayTeam),
    novigOdds: ((computeNovig(allOdds, idx) as any)[novigMethod] ?? computeNovig(allOdds, idx).proportional) as number,
  }));

  const count = cells.length;
  const cols = count <= 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="rounded-md border border-white/5 overflow-hidden">
      {/* Price cells — click to toggle chart */}
      <div
        className={`grid ${cols} gap-px bg-white/5 cursor-pointer group`}
        onClick={onToggle}
        title="Klicka för att visa kursgraf"
      >
        {cells.map(({ price, displayLabel, novigOdds }, i) => (
          <div key={i} className="relative">
            <PriceCell price={price} label={displayLabel} novigOdds={novigOdds} />
            {/* Expand indicator on last cell */}
            {i === cells.length - 1 && (
              <div className="absolute top-1.5 right-1.5 opacity-30 group-hover:opacity-70 transition-opacity">
                {isExpanded
                  ? <ChevronUp className="w-2.5 h-2.5 text-muted-foreground" />
                  : <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded chart */}
      {isExpanded && (
        <div className="bg-black/20 border-t border-white/5">
          <MarketChart marketId={market.id} prices={market.prices} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section definitions
// ---------------------------------------------------------------------------

type SectionDef = {
  key: string;
  label: string;
  filter: (m: Market) => boolean;
};

const SECTIONS: SectionDef[] = [
  {
    key: "ft_result",
    label: "Full Time Result",
    filter: m => m.type === "moneyline" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_result",
    label: "1st Half Result",
    filter: m => m.type === "moneyline" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "handicap",
    label: "Handicap",
    filter: m => m.type === "spread" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_handicap",
    label: "1st Half Handicap",
    filter: m => m.type === "spread" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "ou",
    label: "Over / Under",
    filter: m => m.type === "total" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_ou",
    label: "1st Half Over / Under",
    filter: m => m.type === "total" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "team_total_home",
    label: "Home Team Totals",
    filter: m => m.type === "team_total" && m.period === 0 && m.side === "home" && !m.isAlternate,
  },
  {
    key: "team_total_away",
    label: "Away Team Totals",
    filter: m => m.type === "team_total" && m.period === 0 && m.side === "away" && !m.isAlternate,
  },
];

// ---------------------------------------------------------------------------
// MarketSection
// ---------------------------------------------------------------------------

function MarketSection({
  label,
  markets,
  homeTeam,
  awayTeam,
  novigMethod,
  expandedMarketId,
  onExpandMarket,
}: {
  label: string;
  markets: Market[];
  homeTeam: string;
  awayTeam: string;
  novigMethod: string;
  expandedMarketId: string | null;
  onExpandMarket: (id: string | null) => void;
}) {
  if (markets.length === 0) return null;

  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-0.5">
        {label}
      </div>
      <div className="space-y-1.5">
        {markets.map(market => (
          <MarketGroup
            key={market.id}
            market={market}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            novigMethod={novigMethod}
            isExpanded={expandedMarketId === market.id}
            onToggle={() =>
              onExpandMarket(expandedMarketId === market.id ? null : market.id)
            }
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PinnacleOddsModal
// ---------------------------------------------------------------------------

export function PinnacleOddsModal({ matchupId, onClose }: Props) {
  const { novigMethod } = useAlertStore();
  const [expandedMarketId, setExpandedMarketId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<MatchupResponse>({
    queryKey: ["matchup", matchupId],
    queryFn: async () => {
      const res = await fetch(`/api/matchups/${matchupId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const sections = data
    ? SECTIONS.map(sec => ({
        ...sec,
        markets: data.markets.filter(sec.filter),
      })).filter(s => s.markets.length > 0)
    : [];

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="bg-[#0d1117] border-white/10 max-w-lg w-full max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-white/5 shrink-0">
          {data?.matchup ? (
            <>
              <DialogTitle className="text-sm font-bold leading-tight">
                {data.matchup.homeTeam}{" "}
                <span className="text-muted-foreground font-normal">vs.</span>{" "}
                {data.matchup.awayTeam}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.matchup.leagueName} · Pinnacle Live Odds
              </p>
            </>
          ) : (
            <DialogTitle className="text-sm font-bold">Pinnacle Odds</DialogTitle>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading markets…
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Could not load odds data.
            </div>
          )}

          {!isLoading && !isError && sections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No data available.
            </div>
          )}

          {sections.map(sec => (
            <MarketSection
              key={sec.key}
              label={sec.label}
              markets={sec.markets}
              homeTeam={data?.matchup.homeTeam ?? "Home"}
              awayTeam={data?.matchup.awayTeam ?? "Away"}
              novigMethod={novigMethod}
              expandedMarketId={expandedMarketId}
              onExpandMarket={setExpandedMarketId}
            />
          ))}
        </div>

        <div className="shrink-0 px-4 py-2.5 border-t border-white/5 text-[10px] text-muted-foreground/50 text-right">
          Klicka på en rad för att se kursgraf · Pinnacle · Uppdateras var 15s
        </div>
      </DialogContent>
    </Dialog>
  );
}
