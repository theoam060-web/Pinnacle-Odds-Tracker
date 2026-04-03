import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatOdds } from "@/lib/format";
import { useBetStore, getCurrencySymbol, calcEV } from "@/lib/bet-store";
import { useSettings, calcKellyStake, calcUnitStake } from "@/lib/settings-context";

interface Props {
  row: {
    eventId: string;
    homeTeam: string;
    awayTeam: string;
    leagueName: string;
    sport?: string;
    selection: string;
    marketType: string;
    commenceTime: Date | string;
    currentOdds: number;
    novigOdds: number;
  };
  onClose: () => void;
}

export function LogBetModal({ row, onClose }: Props) {
  const { logBet, currency } = useBetStore();
  const { settings } = useSettings();
  const sym = getCurrencySymbol(currency);

  // Calculate auto-stake if bet sizing is enabled
  const autoStake = useMemo(() => {
    if (!settings.betSizingEnabled) return null;
    if (settings.betSizeMethod === "kelly") {
      const fairProb = row.novigOdds > 1 ? 1 / row.novigOdds : 0.5;
      return calcKellyStake(settings.bankroll, settings.kellyFraction, row.currentOdds, fairProb);
    }
    return calcUnitStake(settings.bankroll, settings.unitSizePercent);
  }, [settings, row.currentOdds, row.novigOdds]);

  const [bettingOdds, setBettingOdds] = useState(row.currentOdds.toFixed(3));
  const [stake, setStake] = useState(autoStake !== null ? autoStake.toFixed(2) : "10");

  const parsedOdds = parseFloat(bettingOdds) || 0;
  const parsedStake = parseFloat(stake) || 0;
  const potentialProfit = parsedOdds > 1 ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2)) : 0;
  const totalReturn = parseFloat((parsedOdds * parsedStake).toFixed(2));

  // EV% = (bet_odds × (1/novig_odds) − 1) × 100
  const evPct = parsedOdds > 1 && row.novigOdds > 1
    ? calcEV(parsedOdds, row.novigOdds)
    : 0;

  function handleSave() {
    if (parsedOdds <= 1 || parsedStake <= 0) return;
    logBet({
      eventId: row.eventId,
      homeTeam: row.homeTeam,
      awayTeam: row.awayTeam,
      leagueName: row.leagueName,
      sport: row.sport,
      selection: row.selection,
      marketType: row.marketType,
      commenceTime: typeof row.commenceTime === "string" ? row.commenceTime : row.commenceTime.toISOString(),
      bettingOdds: parsedOdds,
      novigOdds: row.novigOdds,
      stake: parsedStake,
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Log Bet</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 mb-3">
          <div className="text-xs text-muted-foreground">{row.homeTeam} vs {row.awayTeam}</div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">{row.selection}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{row.marketType.replace(/_/g, " ")}</Badge>
            <span className="text-[10px] text-muted-foreground ml-auto">{row.leagueName}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">Odds you bet on</Label>
            <Input
              type="number"
              step="0.01"
              min="1.01"
              value={bettingOdds}
              onChange={e => setBettingOdds(e.target.value)}
              className="h-9 font-mono"
              placeholder={formatOdds(row.currentOdds)}
            />
            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
              <span>Pinnacle: <span className="font-mono text-foreground">{formatOdds(row.currentOdds)}</span></span>
              <span>No-vig: <span className="font-mono text-foreground">{formatOdds(row.novigOdds)}</span></span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs">Stake ({sym})</Label>
              {autoStake !== null && (
                <button
                  className="text-[10px] text-primary hover:underline"
                  onClick={() => setStake(autoStake.toFixed(2))}
                >
                  Use auto ({sym}{autoStake.toFixed(2)})
                </button>
              )}
            </div>
            <Input
              type="number"
              step="1"
              min="0.01"
              value={stake}
              onChange={e => setStake(e.target.value)}
              className="h-9 font-mono"
              placeholder="10"
            />
            {autoStake !== null && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Auto-stake from {settings.betSizeMethod === "kelly"
                  ? `${Math.round(settings.kellyFraction * 100)}% Kelly`
                  : `${settings.unitSizePercent}% of ${sym}${settings.bankroll.toFixed(0)}`}
              </p>
            )}
          </div>

          {parsedOdds > 1 && parsedStake > 0 && (
            <div className="bg-muted/40 rounded-md px-3 py-2.5 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Profit</div>
                <div className="font-mono font-bold text-green-400">+{potentialProfit.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Return</div>
                <div className="font-mono font-bold text-foreground">{totalReturn.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">EV%</div>
                <div className={`font-mono font-bold ${evPct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {evPct >= 0 ? "+" : ""}{evPct.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={parsedOdds <= 1 || parsedStake <= 0}>
            Save Bet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
