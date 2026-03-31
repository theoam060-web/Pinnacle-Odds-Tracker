import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Layout } from "@/components/layout";
import { useBetStore, CURRENCIES, getCurrencySymbol, calcCLV, calcEV, BetResult, LoggedBet } from "@/lib/bet-store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, Trash2, TrendingUp, CalendarDays } from "lucide-react";
import { formatOdds, formatDate, formatTime } from "@/lib/format";

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
  const startOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return bets.filter(b => {
    const t = new Date(b.loggedAt).getTime();
    switch (filter) {
      case "today":
        return t >= startOf(now);
      case "7d":
        return t >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return t >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
      case "this_month":
        return t >= new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      default:
        return true;
    }
  });
}

const RESULT_STYLES: Record<BetResult, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  win: { label: "Win", cls: "bg-green-900/60 text-green-300 border border-green-700/50" },
  loss: { label: "Loss", cls: "bg-red-900/60 text-red-300 border border-red-700/50" },
  void: { label: "Void", cls: "bg-zinc-800 text-zinc-400" },
};

function StatCard({
  label, value, sub, color,
}: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-card border rounded-md px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-mono font-bold ${color ?? "text-foreground"}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function ResultCycler({ result, onChange }: { result: BetResult; onChange: (r: BetResult) => void }) {
  const cycle: BetResult[] = ["pending", "win", "loss", "void"];
  function next() {
    const idx = cycle.indexOf(result);
    onChange(cycle[(idx + 1) % cycle.length]);
  }
  const { label, cls } = RESULT_STYLES[result];
  return (
    <button
      onClick={next}
      className={`text-[10px] font-semibold rounded px-2 py-0.5 cursor-pointer select-none transition-colors ${cls}`}
      title="Click to cycle result"
    >
      {label}
    </button>
  );
}

function ClosingOddsCell({ bet, onUpdate }: { bet: LoggedBet; onUpdate: (closingOdds: number | undefined) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(bet.closingOdds?.toFixed(3) ?? "");

  function handleBlur() {
    const parsed = parseFloat(val);
    onUpdate(parsed > 1 ? parsed : undefined);
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        autoFocus
        type="number"
        step="0.001"
        min="1.01"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={e => e.key === "Enter" && handleBlur()}
        className="h-6 w-[80px] text-xs font-mono px-1"
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
      title="Click to enter closing odds for CLV calculation"
    >
      {bet.closingOdds ? formatOdds(bet.closingOdds) : <span className="text-muted-foreground/40">—</span>}
    </button>
  );
}

export default function BetTrackerPage() {
  const { bets, currency, setCurrency, updateBet, removeBet } = useBetStore();
  const sym = getCurrencySymbol(currency);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Apply time filter first, then compute stats on filtered set
  const filteredBets = filterByTime(bets, timeFilter);

  // Resolved bets (win/loss only)
  const resolved = filteredBets.filter(b => b.result === "win" || b.result === "loss");
  const wins = filteredBets.filter(b => b.result === "win");
  const losses = filteredBets.filter(b => b.result === "loss");

  const totalStake = resolved.reduce((s, b) => s + b.stake, 0);
  const totalPL = wins.reduce((s, b) => s + b.potentialProfit, 0)
    - losses.reduce((s, b) => s + b.stake, 0);
  const roi = totalStake > 0 ? (totalPL / totalStake) * 100 : 0;

  // CLV stats (only filtered bets with closingOdds)
  const clvBets = filteredBets.filter(b => b.closingOdds && b.closingOdds > 1);
  const avgCLV = clvBets.length > 0
    ? clvBets.reduce((s, b) => s + calcCLV(b.bettingOdds, b.closingOdds!), 0) / clvBets.length
    : null;

  // CLV chart data — cumulative CLV over time for bets with closing odds
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

  return (
    <Layout>
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BookMarked className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bet Tracker</h1>
              <p className="text-muted-foreground text-sm">All bets logged from the Live Feed. Stored locally in your browser.</p>
            </div>
          </div>

          {/* Right-side controls: time filter + currency */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {/* Time filter */}
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

            {/* Currency selector */}
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

      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl">
          <BookMarked className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm max-w-xs">
            No bets logged yet. Hit the <span className="font-semibold text-foreground">Log</span> button on any row in the Live Feed to track a bet.
          </p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            <StatCard label="Total bets" value={String(filteredBets.length)} />
            <StatCard label="Wins" value={String(wins.length)} color="text-green-400" />
            <StatCard label="Losses" value={String(losses.length)} color="text-red-400" />
            <StatCard
              label="Profit / Loss"
              value={`${totalPL >= 0 ? "+" : ""}${sym}${Math.abs(totalPL).toFixed(2)}`}
              color={totalPL >= 0 ? "text-green-400" : "text-red-400"}
              sub={`Stake: ${sym}${totalStake.toFixed(2)}`}
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

          {/* CLV performance chart */}
          {clvChartData.length >= 2 && (
            <div className="bg-card border rounded-md p-4 mb-5">
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
                    <Line
                      type="monotone"
                      dataKey="cumCLV"
                      name="cumCLV"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clv"
                      name="clv"
                      stroke="#94a3b8"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <span className="text-sky-400 font-medium">Cumulative CLV</span> above zero means you consistently beat the closing line.
                Enter closing odds in the table below to populate this chart.
              </p>
            </div>
          )}

          {/* Bets table */}
          <div className="border rounded-md bg-card overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Selection</TableHead>
                  <TableHead className="text-center">Odds</TableHead>
                  <TableHead className="text-center">Stake ({sym})</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                  <TableHead className="text-center">Closing odds</TableHead>
                  <TableHead className="text-center">CLV %</TableHead>
                  <TableHead className="text-center">EV ({sym})</TableHead>
                  <TableHead className="text-center">P&amp;L ({sym})</TableHead>
                  <TableHead className="text-right">Logged</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground text-sm">
                      No bets found for <span className="font-semibold">{TIME_FILTER_LABELS[timeFilter]}</span>.
                      <button onClick={() => setTimeFilter("all")} className="ml-2 text-primary hover:underline text-xs">
                        View all →
                      </button>
                    </TableCell>
                  </TableRow>
                ) : filteredBets.map(bet => {
                  const clv = bet.closingOdds ? calcCLV(bet.bettingOdds, bet.closingOdds) : null;
                  const ev = calcEV(bet.bettingOdds, bet.novigOdds, bet.stake);
                  const pl = bet.result === "win"
                    ? bet.potentialProfit
                    : bet.result === "loss"
                      ? -bet.stake
                      : null;

                  return (
                    <TableRow key={bet.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="text-sm font-medium">{bet.homeTeam} vs {bet.awayTeam}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1 h-4">{bet.leagueName}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(bet.commenceTime)} · {formatTime(bet.commenceTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-medium capitalize">{bet.selection}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">{bet.marketType.replace(/_/g, " ")}</div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold">{formatOdds(bet.bettingOdds)}</TableCell>
                      <TableCell className="text-center font-mono">{bet.stake.toFixed(2)}</TableCell>

                      <TableCell className="text-center">
                        <ResultCycler
                          result={bet.result}
                          onChange={r => updateBet(bet.id, { result: r })}
                        />
                      </TableCell>

                      <TableCell className="text-center">
                        <ClosingOddsCell
                          bet={bet}
                          onUpdate={co => updateBet(bet.id, { closingOdds: co })}
                        />
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        {clv !== null ? (
                          <span className={clv >= 0 ? "text-sky-400 font-semibold" : "text-red-400"}>
                            {clv >= 0 ? "+" : ""}{clv.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        <span className={ev >= 0 ? "text-sky-400" : "text-red-400"}>
                          {ev >= 0 ? "+" : ""}{ev.toFixed(2)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono">
                        {pl !== null ? (
                          <span className={pl >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                            {pl >= 0 ? "+" : ""}{pl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                        {new Date(bet.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <div>{new Date(bet.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeBet(bet.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-[10px] text-muted-foreground mt-2">
            Click a result badge to cycle through Pending → Win → Loss → Void.
            Click a closing odds cell to enter the final odds — this unlocks CLV tracking.
          </p>
        </>
      )}
    </Layout>
  );
}
