import type { BetStats } from "@workspace/api-client-react";
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart2, Activity } from "lucide-react";

interface BetStatsBarProps {
  stats?: BetStats;
}

function StatCard({ label, value, sub, colorClass }: { label: string; value: string; sub?: string; colorClass?: string }) {
  return (
    <div className="bg-card border rounded-lg p-4 flex flex-col gap-1 min-w-[130px]">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${colorClass ?? "text-foreground"}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function BetStatsBar({ stats }: BetStatsBarProps) {
  if (!stats) {
    return (
      <div className="flex flex-wrap gap-3 mb-6">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4 min-w-[130px] h-[88px] animate-pulse" />
        ))}
      </div>
    );
  }

  const plPositive = stats.totalProfitLoss >= 0;
  const roiPositive = stats.roi >= 0;
  const clvPositive = stats.avgClv >= 0;

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <StatCard
        label="Total Bets"
        value={String(stats.totalBets)}
        sub={`${stats.wins}W · ${stats.losses}L · ${stats.voids}V · ${stats.pending} pending`}
      />
      <StatCard
        label="Profit / Loss"
        value={`${plPositive ? "+" : ""}${stats.totalProfitLoss.toFixed(2)}`}
        sub={`Staked: ${stats.totalStake.toFixed(2)}`}
        colorClass={plPositive ? "text-green-400" : "text-red-400"}
      />
      <StatCard
        label="ROI"
        value={`${roiPositive ? "+" : ""}${stats.roi.toFixed(2)}%`}
        sub="Return on investment"
        colorClass={roiPositive ? "text-green-400" : "text-red-400"}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        sub="Settled bets only"
        colorClass={stats.winRate >= 50 ? "text-green-400" : "text-foreground"}
      />
      <StatCard
        label="Avg CLV"
        value={stats.betsWithClv > 0 ? `${clvPositive ? "+" : ""}${stats.avgClv.toFixed(2)}%` : "—"}
        sub={stats.betsWithClv > 0 ? `From ${stats.betsWithClv} bets with closing line` : "No closing odds recorded"}
        colorClass={stats.betsWithClv > 0 ? (clvPositive ? "text-green-400" : "text-red-400") : "text-muted-foreground"}
      />
    </div>
  );
}
