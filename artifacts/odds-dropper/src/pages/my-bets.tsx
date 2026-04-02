import { useState, useMemo } from "react";
import {
  useGetBets, getGetBetsQueryKey,
  useGetBetStats, getGetBetStatsQueryKey,
  useDeleteBet,
} from "@workspace/api-client-react";
import type { Bet, GetBetsResult } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { BetFormModal } from "@/components/bet-form-modal";
import { BetStatsBar } from "@/components/bet-stats-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

type SortKey = keyof Pick<Bet, "betDate" | "matchName" | "oddsValue" | "stake" | "result" | "profitLoss" | "clv">;
type SortDir = "asc" | "desc";

function resultBadge(result: string) {
  if (result === "win") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Win</Badge>;
  if (result === "loss") return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Loss</Badge>;
  if (result === "void") return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Void</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
}

function clvCell(clv: number | null | undefined) {
  if (clv == null) return <span className="text-muted-foreground">—</span>;
  const isPositive = clv >= 0;
  return (
    <span className={isPositive ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
      {isPositive ? "+" : ""}{clv.toFixed(2)}%
    </span>
  );
}

function plCell(pl: number) {
  const isPositive = pl > 0;
  const isZero = pl === 0;
  return (
    <span className={isPositive ? "text-green-400 font-semibold" : isZero ? "text-muted-foreground" : "text-red-400 font-semibold"}>
      {isPositive ? "+" : ""}{pl.toFixed(2)}
    </span>
  );
}

export default function MyBetsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [resultFilter, setResultFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("betDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  const params = {
    result: resultFilter !== "all" ? (resultFilter as GetBetsResult) : undefined,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(dateTo).toISOString() : undefined,
  };

  const { data: bets = [], isLoading } = useGetBets(params, {
    query: { queryKey: getGetBetsQueryKey(params) }
  });

  const { data: stats } = useGetBetStats({ query: { queryKey: getGetBetStatsQueryKey() } });

  const { mutate: deleteBet } = useDeleteBet({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
        toast({ title: "Bet deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete bet", variant: "destructive" });
      }
    }
  });

  const sorted = useMemo(() => {
    return [...bets].sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (aVal == null) aVal = sortDir === "asc" ? Infinity : -Infinity;
      if (bVal == null) bVal = sortDir === "asc" ? Infinity : -Infinity;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
  }, [bets, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3 h-3 ml-1 inline text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 inline text-primary" />;
  }

  function SortableHead({ col, label, className }: { col: SortKey; label: string; className?: string }) {
    return (
      <TableHead
        className={`cursor-pointer select-none hover:text-foreground ${className ?? ""}`}
        onClick={() => toggleSort(col)}
      >
        {label}<SortIcon col={col} />
      </TableHead>
    );
  }

  function handleDelete(id: number) {
    if (window.confirm("Delete this bet?")) {
      deleteBet({ id });
    }
  }

  function handleEdit(bet: Bet) {
    setEditingBet(bet);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingBet(null);
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">My Bets</h1>
          <p className="text-muted-foreground text-sm">Track your bets and measure performance with CLV and ROI metrics.</p>
        </div>
        <Button onClick={() => { setEditingBet(null); setModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Bet
        </Button>
      </div>

      <BetStatsBar stats={stats} />

      <div className="flex flex-wrap gap-3 mb-4 bg-card border rounded-lg p-4">
        <div className="w-[160px]">
          <Select value={resultFilter} onValueChange={setResultFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="void">Void</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">From</label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-[150px]" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">To</label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-[150px]" />
        </div>
        {(resultFilter !== "all" || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setResultFilter("all"); setDateFrom(""); setDateTo(""); }}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <SortableHead col="betDate" label="Date" className="w-[100px]" />
              <SortableHead col="matchName" label="Match" />
              <TableHead>Selection</TableHead>
              <SortableHead col="oddsValue" label="Odds" className="w-[80px] text-right" />
              <SortableHead col="stake" label="Stake" className="w-[80px] text-right" />
              <SortableHead col="result" label="Result" className="w-[90px]" />
              <SortableHead col="clv" label="CLV" className="w-[90px] text-right" />
              <SortableHead col="profitLoss" label="P&L" className="w-[90px] text-right" />
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {Array(9).fill(0).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No bets logged yet. Click "Add Bet" to get started.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map(bet => (
                <TableRow key={bet.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(new Date(bet.betDate), "MMM dd")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{bet.matchName}</div>
                    {bet.league && <div className="text-xs text-muted-foreground">{bet.league}</div>}
                  </TableCell>
                  <TableCell className="text-sm">{bet.selection}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{bet.oddsValue.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{bet.stake.toFixed(2)}</TableCell>
                  <TableCell>{resultBadge(bet.result)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{clvCell(bet.clv)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{plCell(bet.profitLoss)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(bet)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(bet.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {modalOpen && (
        <BetFormModal
          open={modalOpen}
          onClose={handleModalClose}
          existingBet={editingBet}
        />
      )}
    </Layout>
  );
}
