import type { Bet } from "@workspace/db";

export function calculateClv(oddsValue: number, closingOdds: number | null | undefined): number | null {
  if (closingOdds == null) return null;
  return ((closingOdds - oddsValue) / oddsValue) * 100;
}

export function calculateProfitLoss(result: string, stake: number, oddsValue: number): number {
  if (result === "win") return stake * (oddsValue - 1);
  if (result === "loss") return -stake;
  return 0;
}

export function formatBetForApi(bet: Bet) {
  const clv = calculateClv(bet.oddsValue, bet.closingOdds);
  const profitLoss = calculateProfitLoss(bet.result, bet.stake, bet.oddsValue);
  return {
    ...bet,
    clv,
    profitLoss,
    betDate: bet.betDate.toISOString(),
    createdAt: bet.createdAt.toISOString(),
    updatedAt: bet.updatedAt.toISOString(),
  };
}

export function calculateStats(bets: Bet[]) {
  const settled = bets.filter(b => b.result !== "pending" && b.result !== "void");
  const wins = bets.filter(b => b.result === "win").length;
  const losses = bets.filter(b => b.result === "loss").length;
  const voids = bets.filter(b => b.result === "void").length;
  const pending = bets.filter(b => b.result === "pending").length;

  const totalStake = bets.reduce((sum, b) => sum + b.stake, 0);
  const totalProfitLoss = bets.reduce((sum, b) => sum + calculateProfitLoss(b.result, b.stake, b.oddsValue), 0);
  const roi = totalStake > 0 ? (totalProfitLoss / totalStake) * 100 : 0;
  const winRate = settled.length > 0 ? (wins / settled.length) * 100 : 0;

  const betsWithClv = bets.filter(b => b.closingOdds != null);
  const avgClv = betsWithClv.length > 0
    ? betsWithClv.reduce((sum, b) => sum + (calculateClv(b.oddsValue, b.closingOdds) ?? 0), 0) / betsWithClv.length
    : 0;

  return {
    totalBets: bets.length,
    totalStake,
    totalProfitLoss,
    roi,
    winRate,
    avgClv,
    betsWithClv: betsWithClv.length,
    wins,
    losses,
    voids,
    pending,
  };
}
