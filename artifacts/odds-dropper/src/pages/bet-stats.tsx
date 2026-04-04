import { useState, useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
  ComposedChart, Area, Line,
  ScatterChart, Scatter,
} from "recharts";
import type { TooltipProps } from "recharts";
import { Layout } from "@/components/layout";
import { useBetStore, CURRENCIES, getCurrencySymbol, calcEVCurrency, LoggedBet } from "@/lib/bet-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, TrendingUp, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { formatOdds } from "@/lib/format";

type TimeFilter = "all" | "today" | "7d" | "30d" | "this_month";

const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  all: "All time",
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  this_month: "This month",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ODDS_BUCKETS = [
  { label: "<1.5",    min: 0,   max: 1.5 },
  { label: "1.5–2.0", min: 1.5, max: 2.0 },
  { label: "2.0–3.0", min: 2.0, max: 3.0 },
  { label: "3.0–5.0", min: 3.0, max: 5.0 },
  { label: "5.0+",   min: 5.0, max: Infinity },
];

function filterByTime(bets: LoggedBet[], filter: TimeFilter): LoggedBet[] {
  if (filter === "all") return bets;
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return bets.filter(b => {
    const t = new Date(b.loggedAt).getTime();
    switch (filter) {
      case "today": return t >= startOf(now);
      case "7d": return t >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
      case "30d": return t >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
      case "this_month": return t >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      default: return true;
    }
  });
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-card border rounded-md px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-mono font-bold ${color ?? "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

type TimingPoint = {
  x: number;
  y: number;
  match: string;
  selection: string;
  odds: number;
  stake: number;
};

function formatMinutes(mins: number): string {
  if (mins < 60) return `${Math.round(mins)}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

function formatMinutesFull(mins: number): string {
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (mins >= 1440) return `${Math.floor(mins / 1440)}d ${h % 24}h`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function BetTimingTooltip({ active, payload, sym }: TooltipProps<number, string> & { sym: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as TimingPoint | undefined;
  if (!d) return null;
  const pl = d.y;
  return (
    <div
      className="rounded-md border border-white/10 bg-[#0d1117] px-3 py-2.5 shadow-xl space-y-1.5"
      style={{ outline: "none", minWidth: 190 }}
    >
      <div className="text-[13px] font-semibold text-white leading-tight">{d.match}</div>
      <div className="text-[12px] text-muted-foreground capitalize">{d.selection}</div>
      <div className="border-t border-white/5 pt-1.5 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Before kickoff</span>
          <span className="font-mono text-white">{formatMinutesFull(d.x)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Odds</span>
          <span className="font-mono text-white">{d.odds.toFixed(3)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Stake</span>
          <span className="font-mono text-white">{sym}{d.stake.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">P/L</span>
          <span className="font-mono font-semibold text-white">
            {pl >= 0 ? "+" : ""}{sym}{Math.abs(pl).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionEmpty({ message }: { message: string }) {
  return (
    <p className="text-[11px] text-muted-foreground text-center py-6">{message}</p>
  );
}

export default function BetStatsPage() {
  const { bets, currency, setCurrency } = useBetStore();
  const sym = getCurrencySymbol(currency);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  const filteredBets = filterByTime(bets, timeFilter);

  const resolved = filteredBets.filter(b => b.result === "win" || b.result === "loss");
  const wins = filteredBets.filter(b => b.result === "win");
  const losses = filteredBets.filter(b => b.result === "loss");
  const pending = filteredBets.filter(b => b.result === "pending");

  const totalStake = resolved.reduce((s, b) => s + b.stake, 0);
  const totalPL = wins.reduce((s, b) => s + b.potentialProfit, 0)
    - losses.reduce((s, b) => s + b.stake, 0);
  const roi = totalStake > 0 ? (totalPL / totalStake) * 100 : 0;
  const winRate = resolved.length > 0 ? (wins.length / resolved.length) * 100 : null;

  const clvBets = filteredBets.filter(b => b.closingOdds && b.closingOdds > 1);
  const avgCLV = clvBets.length > 0
    ? clvBets.reduce((s, b) => s + (b.bettingOdds / b.closingOdds! - 1) * 100, 0) / clvBets.length
    : null;

  // ─── PROFIT COMPARISON CHART (3 lines) ────────────────────────────────────
  const profitComparisonData = useMemo(() => {
    const sorted = filteredBets
      .slice()
      .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

    let cumActual = 0;
    let cumExpected = 0;
    let cumCLV = 0;

    return sorted.map((b, i) => {
      const pl = b.result === "win" ? b.potentialProfit : b.result === "loss" ? -b.stake : 0;
      const ev = calcEVCurrency(b.bettingOdds, b.novigOdds, b.stake);
      const clvPerBet = (b.closingOdds && b.closingOdds > 1)
        ? b.stake * (b.bettingOdds / b.closingOdds - 1)
        : 0;

      cumActual   = parseFloat((cumActual   + pl).toFixed(2));
      cumExpected = parseFloat((cumExpected + ev).toFixed(2));
      cumCLV      = parseFloat((cumCLV      + clvPerBet).toFixed(2));

      return {
        betNum:   i + 1,
        label:    `Bet ${i + 1}`,
        actual:   cumActual,
        expected: cumExpected,
        clv:      cumCLV,
      };
    });
  }, [filteredBets]);

  // ─── DAILY PERFORMANCE CALENDAR ────────────────────────────────────────────
  const dailyPL = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of filteredBets) {
      if (b.result !== "win" && b.result !== "loss") continue;
      const d = new Date(b.loggedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const pl = b.result === "win" ? b.potentialProfit : -b.stake;
      map[key] = parseFloat(((map[key] ?? 0) + pl).toFixed(2));
    }
    return map;
  }, [filteredBets]);

  const calendarDays = useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Shift to Monday-first (Mon=0 … Sun=6)
    const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
    const cells: (number | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to complete rows
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calendarMonth]);

  // ─── BETS BY MARKET ────────────────────────────────────────────────────────
  const marketData = useMemo(() => {
    const map: Record<string, { pl: number; totalCount: number }> = {};
    for (const b of filteredBets) {
      const mkt = b.marketType || "Other";
      if (!map[mkt]) map[mkt] = { pl: 0, totalCount: 0 };
      map[mkt].totalCount++;
      if (b.result === "win" || b.result === "loss") {
        const pl = b.result === "win" ? b.potentialProfit : -b.stake;
        map[mkt].pl = parseFloat((map[mkt].pl + pl).toFixed(2));
      }
    }
    return Object.entries(map)
      .map(([market, { pl, totalCount }]) => ({ market, pl, totalCount }))
      .sort((a, b) => b.pl - a.pl);
  }, [filteredBets]);

  // ─── PROFIT BY ODDS RANGE ─────────────────────────────────────────────────
  const oddsBucketData = useMemo(() => {
    return ODDS_BUCKETS.map(bucket => {
      const inBucket = resolved.filter(b =>
        b.bettingOdds >= bucket.min && b.bettingOdds < bucket.max
      );
      const pl = inBucket.reduce((s, b) =>
        s + (b.result === "win" ? b.potentialProfit : -b.stake), 0
      );
      return { label: bucket.label, pl: parseFloat(pl.toFixed(2)), count: inBucket.length };
    });
  }, [resolved]);

  // ─── BET TIMING SCATTER ────────────────────────────────────────────────────
  const betTimingPoints = useMemo(() => {
    const won: TimingPoint[] = [];
    const lost: TimingPoint[] = [];
    const pushed: TimingPoint[] = [];

    for (const b of filteredBets) {
      const minsBeforeKickoff = Math.max(0,
        (new Date(b.commenceTime).getTime() - new Date(b.loggedAt).getTime()) / 60000
      );
      const pl = b.result === "win"  ? b.potentialProfit
               : b.result === "loss" ? -b.stake
               : 0;
      const pt: TimingPoint = {
        x: minsBeforeKickoff,
        y: parseFloat(pl.toFixed(2)),
        match: `${b.homeTeam} vs ${b.awayTeam}`,
        selection: b.selection,
        odds: b.bettingOdds,
        stake: b.stake,
      };
      if      (b.result === "win")  won.push(pt);
      else if (b.result === "loss") lost.push(pt);
      else                          pushed.push(pt);
    }
    return { won, lost, pushed };
  }, [filteredBets]);

  // P/L by league (bar chart) — existing
  const sportPLData = useMemo(() => {
    const sportPL: Record<string, { pl: number; count: number }> = {};
    for (const b of filteredBets) {
      if (b.result !== "win" && b.result !== "loss") continue;
      const pl = b.result === "win" ? b.potentialProfit : -b.stake;
      if (!sportPL[b.leagueName]) sportPL[b.leagueName] = { pl: 0, count: 0 };
      sportPL[b.leagueName].pl = parseFloat((sportPL[b.leagueName].pl + pl).toFixed(2));
      sportPL[b.leagueName].count++;
    }
    return Object.entries(sportPL)
      .map(([league, { pl, count }]) => ({ league, pl, count }))
      .sort((a, b) => b.pl - a.pl)
      .slice(0, 8);
  }, [filteredBets]);

  const isEmpty = bets.length === 0;
  const today = new Date();
  const visibleMarkets = showAllMarkets ? marketData : marketData.slice(0, 5);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bet Stats</h1>
              <p className="text-muted-foreground text-sm">Performance analytics across all your logged bets.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={v => setTimeFilter(v as TimeFilter)}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIME_FILTER_LABELS) as [TimeFilter, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Currency</span>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code} className="text-xs">
                      {c.symbol} {c.code} — {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl">
          <BarChart2 className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm max-w-xs">
            No bets logged yet. Log bets from the <span className="font-semibold text-foreground">Live Feed</span> to see your performance stats.
          </p>
        </div>
      ) : (
        <>
          {/* ── Stats cards ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
            <StatCard label="Total bets" value={String(filteredBets.length)} sub={`${pending.length} pending`} />
            <StatCard label="Wins" value={String(wins.length)} color="text-green-400" />
            <StatCard label="Losses" value={String(losses.length)} color="text-red-400" />
            <StatCard
              label="Win rate"
              value={winRate === null ? "—" : `${winRate.toFixed(1)}%`}
              color={winRate !== null && winRate >= 50 ? "text-green-400" : "text-red-400"}
              sub={resolved.length > 0 ? `${resolved.length} settled` : "No settled bets"}
            />
            <StatCard
              label="Profit / Loss"
              value={`${totalPL >= 0 ? "+" : ""}${sym}${Math.abs(totalPL).toFixed(2)}`}
              color={totalPL >= 0 ? "text-green-400" : "text-red-400"}
              sub={`Staked: ${sym}${totalStake.toFixed(2)}`}
            />
            <StatCard
              label="ROI"
              value={resolved.length === 0 ? "—" : `${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`}
              color={roi >= 0 ? "text-green-400" : "text-red-400"}
              sub={resolved.length === 0 ? "No resolved bets" : `${resolved.length} resolved`}
            />
            <StatCard
              label="Avg CLV"
              value={avgCLV === null ? "—" : `${avgCLV >= 0 ? "+" : ""}${avgCLV.toFixed(2)}%`}
              color={avgCLV !== null && avgCLV >= 0 ? "text-sky-400" : "text-red-400"}
              sub={avgCLV === null ? "Enter closing odds" : `${clvBets.length} bet${clvBets.length !== 1 ? "s" : ""}`}
            />
          </div>

          {/* ── NEW: Profit comparison chart (Actual / Expected / CLV Optimal) ── */}
          <div className="bg-card border rounded-md p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium">Profit</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Cumulative across {filteredBets.length} bets</span>
            </div>
            {resolved.length < 2 ? (
              <SectionEmpty message="Settle at least 2 bets to see the profit comparison chart." />
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={profitComparisonData}
                      margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="betNum"
                        type="number"
                        domain={[1, profitComparisonData.length]}
                        tickFormatter={(v: number) => `Bet ${v}`}
                        tick={{ fontSize: 10, fill: "#4b5563" }}
                        tickLine={false}
                        axisLine={false}
                        tickCount={5}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#4b5563" }}
                        tickFormatter={(v: number) => `${sym}${v}`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, fontSize: 11 }}
                        labelFormatter={(v: number) => `Bet ${v}`}
                        formatter={(value: number, name: string) => [
                          `${value >= 0 ? "+" : ""}${sym}${value.toFixed(2)}`,
                          name === "actual" ? "Actual Profit"
                            : name === "expected" ? "Expected Profit"
                            : "CLV Optimal Profit",
                        ]}
                      />
                      <ReferenceLine y={0} stroke="#374151" />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#actualGrad)"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="expected"
                        stroke="#06b6d4"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="clv"
                        stroke="#22c55e"
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-2 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                    <span className="text-indigo-400 font-medium">Actual Profit</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                    <span className="text-cyan-400 font-medium">Expected Profit</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    <span className="text-green-400 font-medium">CLV Optimal Profit</span>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── NEW: Daily Performance Calendar ───────────────────────────── */}
          <div className="bg-card border rounded-md p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Daily Performance</span>
              </div>
            </div>
            {resolved.length < 1 ? (
              <SectionEmpty message="Settle at least 1 bet to see daily performance." />
            ) : (
            <>
            {/* Month navigation */}
            <div className="max-w-xs mx-auto">
            <div className="flex items-center justify-between mb-1.5">
              <button
                onClick={() => setCalendarMonth(m => {
                  const d = new Date(m.year, m.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}
                className="p-0.5 rounded hover:bg-muted/30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-xs font-medium">
                {MONTH_NAMES[calendarMonth.month]} {calendarMonth.year}
              </span>
              <button
                onClick={() => setCalendarMonth(m => {
                  const d = new Date(m.year, m.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}
                className="p-0.5 rounded hover:bg-muted/30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {["MO","TU","WE","TH","FR","SA","SU"].map(d => (
                <div key={d} className="text-center text-[9px] text-muted-foreground font-medium py-0.5">{d}</div>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square rounded border border-border/20 bg-muted/10" />;
                }
                const isToday = (
                  today.getFullYear() === calendarMonth.year &&
                  today.getMonth() === calendarMonth.month &&
                  today.getDate() === day
                );
                const key = `${calendarMonth.year}-${calendarMonth.month}-${day}`;
                const pl = dailyPL[key];
                const hasData = pl !== undefined;

                return (
                  <div
                    key={key}
                    className={[
                      "aspect-square rounded border flex flex-col items-center justify-center text-[10px] leading-tight p-0.5 transition-colors",
                      isToday ? "border-red-500/70 bg-red-950/30" : "border-border/30 bg-muted/10",
                    ].join(" ")}
                  >
                    <span className="text-muted-foreground text-[9px]">{day}</span>
                    {hasData && (
                      <span className={`font-semibold text-[9px] ${pl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pl >= 0 ? "+" : ""}{sym}{Math.abs(pl) >= 1000 ? `${(pl / 1000).toFixed(1)}k` : pl.toFixed(0)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
            </>
            )}
          </div>

          {/* ── NEW: Bets By Market ────────────────────────────────────────── */}
          <div className="bg-card border rounded-md p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Bets By Market</span>
              </div>
              {marketData.length > 5 && (
                <button
                  onClick={() => setShowAllMarkets(v => !v)}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAllMarkets ? "Show less" : `View all (${marketData.length})`}
                </button>
              )}
            </div>
            {resolved.length < 1 ? (
              <SectionEmpty message="Settle at least 1 bet to see performance by market." />
            ) : (
              <div className="divide-y divide-border/30">
                {visibleMarkets.map(({ market, pl, totalCount }) => (
                  <div key={market} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-sm font-medium capitalize">{market}</div>
                      <div className="text-[11px] text-muted-foreground">{totalCount} {totalCount === 1 ? "bet" : "bets"}</div>
                    </div>
                    <span className={[
                      "text-xs font-mono font-semibold px-2.5 py-1 rounded",
                      pl >= 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400",
                    ].join(" ")}>
                      {pl >= 0 ? "+" : ""}{sym}{Math.abs(pl).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Existing: P/L by League ────────────────────────────────────── */}
          {sportPLData.length >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">P / L by League</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Top {sportPLData.length} leagues</span>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sportPLData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="league" tick={{ fontSize: 9, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={v => `${sym}${v}`} />
                    <Tooltip
                      wrapperStyle={{ outline: "none" }}
                      contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "6px 10px" }}
                      labelStyle={{ color: "#9ca3af", fontSize: 12, marginBottom: 2 }}
                      itemStyle={{ color: "#f9fafb", fontSize: 13, fontWeight: 600 }}
                      formatter={(value: number) => [`${value >= 0 ? "+" : ""}${sym}${value.toFixed(2)}`, "P/L"]}
                    />
                    <ReferenceLine y={0} stroke="#555" />
                    <Bar dataKey="pl" radius={[3, 3, 0, 0]}>
                      {sportPLData.map((entry, i) => (
                        <Cell key={i} fill={entry.pl >= 0 ? "#4ade80" : "#f87171"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── NEW: Profit by Odds Range ──────────────────────────────────── */}
          {resolved.length >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">Profit by Odds Range</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{resolved.length} resolved bets</span>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oddsBucketData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={v => `${sym}${v}`} axisLine={false} tickLine={false} />
                    <Tooltip
                      wrapperStyle={{ outline: "none" }}
                      contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 6, padding: "6px 10px" }}
                      labelStyle={{ color: "#9ca3af", fontSize: 12, marginBottom: 2 }}
                      itemStyle={{ color: "#f9fafb", fontSize: 13, fontWeight: 600 }}
                      formatter={(value: number, _: string, props: { payload?: { count?: number } }) => [
                        `${value >= 0 ? "+" : ""}${sym}${value.toFixed(2)} (${props.payload?.count ?? 0} bets)`,
                        "P/L",
                      ]}
                    />
                    <ReferenceLine y={0} stroke="#374151" />
                    <Bar dataKey="pl" radius={[3, 3, 0, 0]}>
                      {oddsBucketData.map((entry, i) => (
                        <Cell key={i} fill={entry.pl >= 0 ? "#4ade80" : "#f87171"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── NEW: Bet Timing Scatter ────────────────────────────────────── */}
          {(betTimingPoints.won.length + betTimingPoints.lost.length + betTimingPoints.pushed.length) >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Bet Timing</span>
                <span className="text-[10px] text-muted-foreground ml-auto">P/L by time before match</span>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="x"
                      type="number"
                      name="Time before match"
                      tickFormatter={formatMinutes}
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: "Time before kickoff", position: "insideBottom", offset: -2, style: { fontSize: 9, fill: "#4b5563" } }}
                    />
                    <YAxis
                      dataKey="y"
                      type="number"
                      name="P/L"
                      tickFormatter={v => `${sym}${v}`}
                      tick={{ fontSize: 10, fill: "#4b5563" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.08)" }}
                      content={(props: TooltipProps<number, string>) => <BetTimingTooltip {...props} sym={sym} />}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 2" />
                    <Scatter
                      name="Won bet"
                      data={betTimingPoints.won}
                      fill="#4ade80"
                      fillOpacity={0.8}
                      r={3}
                    />
                    <Scatter
                      name="Lost bet"
                      data={betTimingPoints.lost}
                      fill="#f87171"
                      fillOpacity={0.7}
                      r={3}
                    />
                    <Scatter
                      name="Pushed bet"
                      data={betTimingPoints.pushed}
                      fill="#6366f1"
                      fillOpacity={0.7}
                      r={3}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-1 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  <span className="text-muted-foreground">Won bet</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  <span className="text-muted-foreground">Pushed bet</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                  <span className="text-muted-foreground">Lost bet</span>
                </span>
              </div>
            </div>
          )}

        </>
      )}
    </Layout>
  );
}
