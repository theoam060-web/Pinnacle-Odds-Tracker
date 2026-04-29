import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { useBetStore, CURRENCIES, getCurrencySymbol, calcCLV, calcEV, BetResult, LoggedBet } from "@/lib/bet-store";
import { useSettings } from "@/lib/settings-context";
import { EditBetModal } from "@/components/edit-bet-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked, Trash2, CalendarDays, Pencil } from "lucide-react";
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

const RESULT_STYLES: Record<BetResult, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  win: { label: "Win", cls: "bg-green-900/60 text-green-300 border border-green-700/50" },
  loss: { label: "Loss", cls: "bg-red-900/60 text-red-300 border border-red-700/50" },
  void: { label: "Void", cls: "bg-zinc-800 text-zinc-400" },
};

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
      title="Click to cycle result: Pending → Win → Loss → Void"
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
  const { settings } = useSettings();
  const sym = getCurrencySymbol(currency);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [editBet, setEditBet] = useState<LoggedBet | null>(null);
  const [editBetDraft, setEditBetDraft] = useState<LoggedBet | null>(null);
  useEffect(() => {
    if (!editBet) {
      setEditBetDraft(null);
      return;
    }
    setEditBetDraft({ ...editBet });
  }, [editBet]);

  const filteredBets = filterByTime(bets, timeFilter);


  return (
    <Layout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <BookMarked className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bet Tracker</h1>
              <p className="text-muted-foreground text-sm">
                Individual bets logged from the Live Feed. Stored locally in your browser.
              </p>
            </div>
          </div>

          {/* Controls */}
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

      {/* Edit modal */}
      {editBetDraft && (
        <EditBetModal
          key={editBetDraft.id}
          bet={editBetDraft}
          onClose={() => setEditBet(null)}
        />
      )}

      {/* Empty state */}
      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-xl">
          <BookMarked className="w-10 h-10 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm max-w-xs">
            No bets logged yet. Hit the <span className="font-semibold text-foreground">Log</span> button on any row
            in the Live Feed to track a bet.
          </p>
        </div>
      ) : (
        <>
          {/* Bets table */}
          <div className="border rounded-md bg-card overflow-x-auto">
            <Table className="min-w-[1020px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Selection</TableHead>
                  <TableHead className="text-center">Odds</TableHead>
                  {/* Stake is a critical field — clearly visible for every bet */}
                  <TableHead className="text-center">Stake ({sym})</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                  <TableHead className="text-center">Closing odds</TableHead>
                  <TableHead className="text-center">CLV %</TableHead>
                  <TableHead className="text-center">EV%</TableHead>
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
                      <button
                        onClick={() => setTimeFilter("all")}
                        className="ml-2 text-primary hover:underline text-xs"
                      >
                        View all →
                      </button>
                    </TableCell>
                  </TableRow>
                ) : filteredBets.map(bet => {
                  const clv = bet.closingOdds ? calcCLV(bet.bettingOdds, bet.closingOdds) : null;
                  const ev = calcEV(bet.bettingOdds, bet.novigOdds);
                  const pl = bet.result === "win"
                    ? bet.potentialProfit
                    : bet.result === "loss"
                      ? -bet.stake
                      : null;
                  // Auto-settle: match has kicked off but no result yet
                  const matchKickedOff = settings.autoSettle
                    && bet.result === "pending"
                    && new Date(bet.commenceTime) < new Date();

                  return (
                    <TableRow key={bet.id} className="hover:bg-muted/20">
                      {/* Match */}
                      <TableCell>
                        <div className="text-sm font-medium">{bet.homeTeam} vs {bet.awayTeam}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1 h-4">{bet.leagueName}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(bet.commenceTime)} · {formatTime(bet.commenceTime)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Selection */}
                      <TableCell>
                        <div className="text-xs font-medium capitalize">{bet.selection}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {bet.marketType.replace(/_/g, " ")}
                        </div>
                      </TableCell>

                      {/* Odds taken */}
                      <TableCell className="text-center font-mono font-bold">
                        {formatOdds(bet.bettingOdds)}
                      </TableCell>

                      {/* Stake — clearly visible */}
                      <TableCell className="text-center font-mono font-semibold">
                        {sym}{bet.stake.toFixed(2)}
                      </TableCell>

                      {/* Result — cycler + "Match Started" indicator */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {matchKickedOff && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 border border-amber-700/50 leading-none">
                              Match Started
                            </span>
                          )}
                          <ResultCycler
                            result={bet.result}
                            onChange={r => updateBet(bet.id, { result: r })}
                          />
                        </div>
                      </TableCell>

                      {/* Closing odds (click to edit) */}
                      <TableCell className="text-center">
                        <ClosingOddsCell
                          bet={bet}
                          onUpdate={co => updateBet(bet.id, { closingOdds: co })}
                        />
                      </TableCell>

                      {/* CLV % */}
                      <TableCell className="text-center font-mono">
                        {clv !== null ? (
                          <span className={clv >= 0 ? "text-sky-400 font-semibold" : "text-red-400"}>
                            {clv >= 0 ? "+" : ""}{clv.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* EV% */}
                      <TableCell className="text-center font-mono">
                        <span className={ev >= 0 ? "text-green-400 font-semibold" : "text-red-400"}>
                          {ev >= 0 ? "+" : ""}{ev.toFixed(1)}%
                        </span>
                      </TableCell>

                      {/* P&L */}
                      <TableCell className="text-center font-mono">
                        {pl !== null ? (
                          <span className={pl >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                            {pl >= 0 ? "+" : ""}{pl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Logged timestamp */}
                      <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                        {new Date(bet.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        <div>{new Date(bet.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</div>
                      </TableCell>

                      {/* Edit + Delete */}
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => setEditBet(bet)}
                            title="Edit bet"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeBet(bet.id)}
                            title="Delete bet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <p className="text-[10px] text-muted-foreground mt-2">
            Click a result badge to cycle: Pending → Win → Loss → Void.
            Click the <Pencil className="inline w-2.5 h-2.5 mx-0.5" /> icon to edit odds, stake, selection, or result.
            Click a closing odds cell to enter the final market odds — unlocks CLV tracking in Bet Stats.
          </p>
        </>
      )}
    </Layout>
  );
}
