import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
} from "recharts";
import { Layout } from "@/components/layout";
import { useBetStore, CURRENCIES, getCurrencySymbol, calcCLV, calcEVCurrency, LoggedBet } from "@/lib/bet-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, TrendingUp, CalendarDays } from "lucide-react";
import { formatOdds } from "@/lib/format";

type TimeFilter = "all" | "today" | "7d" | "30d" | "this_month";

const TIME_FILTER_LABELS: Record<TimeFilter, string> = {
  all: "All time",
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  this_month: "This month",
};

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

export default function BetStatsPage() {
  const { bets, currency, setCurrency } = useBetStore();
  const sym = getCurrencySymbol(currency);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const filteredBets = filterByTime(bets, timeFilter);

  // Core stats
  const resolved = filteredBets.filter(b => b.result === "win" || b.result === "loss");
  const wins = filteredBets.filter(b => b.result === "win");
  const losses = filteredBets.filter(b => b.result === "loss");
  const pending = filteredBets.filter(b => b.result === "pending");

  const totalStake = resolved.reduce((s, b) => s + b.stake, 0);
  const totalPL = wins.reduce((s, b) => s + b.potentialProfit, 0)
    - losses.reduce((s, b) => s + b.stake, 0);
  const roi = totalStake > 0 ? (totalPL / totalStake) * 100 : 0;
  const winRate = resolved.length > 0 ? (wins.length / resolved.length) * 100 : null;

  // CLV stats (only bets with closing odds)
  const clvBets = filteredBets.filter(b => b.closingOdds && b.closingOdds > 1);
  const avgCLV = clvBets.length > 0
    ? clvBets.reduce((s, b) => s + calcCLV(b.bettingOdds, b.closingOdds!), 0) / clvBets.length
    : null;

  // Total EV on filtered bets (in currency: stake × EV% / 100)
  const totalEV = filteredBets.reduce((s, b) => s + calcEVCurrency(b.bettingOdds, b.novigOdds, b.stake), 0);

  // CLV chart — cumulative CLV over time
  const clvChartData = clvBets
    .slice()
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .reduce<{ date: string; clv: number; cumCLV: number }[]>((acc, b) => {
      const clv = calcCLV(b.bettingOdds, b.closingOdds!);
      const prev = acc.length > 0 ? acc[acc.length - 1].cumCLV : 0;
      acc.push({
        date: new Date(b.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
        clv,
        cumCLV: parseFloat((prev + clv).toFixed(2)),
      });
      return acc;
    }, []);

  // EV chart — cumulative EV over time for all filtered bets
  const evChartData = filteredBets
    .slice()
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .reduce<{ date: string; ev: number; cumEV: number }[]>((acc, b) => {
      const ev = calcEVCurrency(b.bettingOdds, b.novigOdds, b.stake);
      const prev = acc.length > 0 ? acc[acc.length - 1].cumEV : 0;
      acc.push({
        date: new Date(b.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
        ev,
        cumEV: parseFloat((prev + ev).toFixed(2)),
      });
      return acc;
    }, []);

  // P/L by sport
  const sportPL: Record<string, { pl: number; count: number }> = {};
  for (const b of filteredBets) {
    if (b.result !== "win" && b.result !== "loss") continue;
    const pl = b.result === "win" ? b.potentialProfit : -b.stake;
    if (!sportPL[b.leagueName]) sportPL[b.leagueName] = { pl: 0, count: 0 };
    sportPL[b.leagueName].pl = parseFloat((sportPL[b.leagueName].pl + pl).toFixed(2));
    sportPL[b.leagueName].count++;
  }
  const sportPLData = Object.entries(sportPL)
    .map(([league, { pl, count }]) => ({ league, pl, count }))
    .sort((a, b) => b.pl - a.pl)
    .slice(0, 8);

  const isEmpty = bets.length === 0;

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

          {/* Controls */}
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
          {/* Stats cards */}
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

          {/* EV performance chart */}
          {evChartData.length >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium">EV Performance</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  Total EV: <span className={`font-semibold ${totalEV >= 0 ? "text-amber-400" : "text-red-400"}`}>
                    {totalEV >= 0 ? "+" : ""}{sym}{Math.abs(totalEV).toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evChartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={v => `${sym}${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, fontSize: 11 }}
                      formatter={(value: number, name: string) => [
                        `${value >= 0 ? "+" : ""}${sym}${value.toFixed(2)}`,
                        name === "cumEV" ? "Cumulative EV" : "EV per bet",
                      ]}
                    />
                    <ReferenceLine y={0} stroke="#555" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="cumEV" name="cumEV" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="ev" name="ev" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <span className="text-amber-400 font-medium">Cumulative EV</span> is your expected long-run profitability based on no-vig model odds.
              </p>
            </div>
          )}

          {/* CLV performance chart */}
          {clvChartData.length >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium">CLV Performance</span>
                <span className="text-[10px] text-muted-foreground ml-auto">Cumulative edge vs closing odds</span>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clvChartData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, fontSize: 11 }}
                      formatter={(value: number, name: string) => [
                        `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`,
                        name === "cumCLV" ? "Cumulative CLV" : "CLV per bet",
                      ]}
                    />
                    <ReferenceLine y={0} stroke="#555" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="cumCLV" name="cumCLV" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="clv" name="clv" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <span className="text-sky-400 font-medium">Cumulative CLV</span> above zero means you consistently beat the closing line — the gold standard for sharp bettors.
                Enter closing odds in the Bet Tracker to populate this chart.
              </p>
            </div>
          )}

          {/* P/L by league (bar chart) */}
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
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 6, fontSize: 11 }}
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

          {/* Quick summary table */}
          {filteredBets.length > 0 && (
            <div className="bg-card border rounded-md p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">Breakdown</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Avg stake</div>
                  <div className="font-mono font-bold">
                    {filteredBets.length > 0
                      ? `${sym}${(filteredBets.reduce((s, b) => s + b.stake, 0) / filteredBets.length).toFixed(2)}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Avg odds</div>
                  <div className="font-mono font-bold">
                    {filteredBets.length > 0
                      ? formatOdds(filteredBets.reduce((s, b) => s + b.bettingOdds, 0) / filteredBets.length)
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Total staked</div>
                  <div className="font-mono font-bold">
                    {sym}{filteredBets.reduce((s, b) => s + b.stake, 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Expected profit (EV)</div>
                  <div className={`font-mono font-bold ${totalEV >= 0 ? "text-amber-400" : "text-red-400"}`}>
                    {totalEV >= 0 ? "+" : ""}{sym}{Math.abs(totalEV).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
