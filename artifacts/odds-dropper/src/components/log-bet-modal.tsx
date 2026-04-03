import { useState, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatOdds } from "@/lib/format";
import { useBetStore, getCurrencySymbol, calcEV } from "@/lib/bet-store";
import { useSettings, calcKellyStake, calcUnitStake } from "@/lib/settings-context";
import { Zap, RotateCcw } from "lucide-react";

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

function computeAutoStake(
  settings: ReturnType<typeof useSettings>["settings"],
  odds: number,
  novigOdds: number,
): number | null {
  if (!settings.betSizingEnabled) return null;
  if (odds <= 1 || novigOdds <= 1) return null;
  if (settings.betSizeMethod === "kelly") {
    const fairProb = 1 / novigOdds;
    const stake = calcKellyStake(settings.bankroll, settings.kellyFraction, odds, fairProb);
    return stake > 0 ? stake : null;
  }
  return calcUnitStake(settings.bankroll, settings.unitSizePercent);
}

export function LogBetModal({ row, onClose }: Props) {
  const { logBet, currency } = useBetStore();
  const { settings } = useSettings();
  const sym = getCurrencySymbol(currency);

  // Initialize odds state first
  const [bettingOdds, setBettingOdds] = useState(row.currentOdds.toFixed(3));
  // Track whether the user has manually overridden the auto-stake
  const [isManualStake, setIsManualStake] = useState(false);
  // Initialize stake: use auto-computed value from opening odds, fall back to "10"
  const initialAutoStake = computeAutoStake(settings, row.currentOdds, row.novigOdds);
  const [stake, setStake] = useState(initialAutoStake !== null ? initialAutoStake.toFixed(2) : "10");

  const parsedOdds = parseFloat(bettingOdds) || 0;
  const parsedStake = parseFloat(stake) || 0;

  // EV% = (bet_odds × (1/novig_odds) − 1) × 100
  const evPct = parsedOdds > 1 && row.novigOdds > 1
    ? calcEV(parsedOdds, row.novigOdds)
    : 0;

  // Auto-stake: recomputes whenever odds input OR settings change
  const autoStake = useMemo(
    () => computeAutoStake(settings, parsedOdds, row.novigOdds),
    [settings, parsedOdds, row.novigOdds],
  );

  // Sync stake field to autoStake whenever it changes — unless user manually overrode
  const prevAutoStakeRef = useRef(autoStake);
  useEffect(() => {
    if (prevAutoStakeRef.current === autoStake) return;
    prevAutoStakeRef.current = autoStake;
    if (!isManualStake && autoStake !== null) {
      setStake(autoStake.toFixed(2));
    }
  }, [autoStake, isManualStake]);

  // Label: what formula/method produced the auto stake
  const autoLabel = useMemo(() => {
    if (!settings.betSizingEnabled || autoStake === null) return null;
    if (settings.betSizeMethod === "kelly") {
      const kf = Math.round(settings.kellyFraction * 100);
      return `${kf}% Kelly · EV ${evPct >= 0 ? "+" : ""}${evPct.toFixed(1)}% at ${parsedOdds.toFixed(3)} odds`;
    }
    return `${settings.unitSizePercent}% of ${sym}${settings.bankroll.toFixed(0)} bankroll`;
  }, [settings, autoStake, evPct, parsedOdds, sym]);

  const potentialProfit = parsedOdds > 1 ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2)) : 0;
  const totalReturn = parseFloat((parsedOdds * parsedStake).toFixed(2));

  function handleOddsChange(v: string) {
    setBettingOdds(v);
    // When auto-bet is on and user hasn't manually overridden, stake will update via effect
  }

  function handleStakeChange(v: string) {
    setStake(v);
    setIsManualStake(true);
  }

  function handleResetToAuto() {
    if (autoStake !== null) {
      setStake(autoStake.toFixed(2));
      setIsManualStake(false);
    }
  }

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

  const isAutoActive = settings.betSizingEnabled && autoStake !== null && !isManualStake;

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
          {/* ── Odds input ── */}
          <div>
            <Label className="text-xs mb-1.5 block">Odds you bet on</Label>
            <Input
              type="number"
              step="0.01"
              min="1.01"
              value={bettingOdds}
              onChange={e => handleOddsChange(e.target.value)}
              className="h-9 font-mono"
              placeholder={formatOdds(row.currentOdds)}
            />
            <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
              <span>Pinnacle: <span className="font-mono text-foreground">{formatOdds(row.currentOdds)}</span></span>
              <span>No-vig: <span className="font-mono text-foreground">{formatOdds(row.novigOdds)}</span></span>
            </div>
          </div>

          {/* ── Stake input ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs">Stake ({sym})</Label>
                {isAutoActive && (
                  <span className="inline-flex items-center gap-0.5 bg-primary/15 text-primary text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    <Zap className="w-2.5 h-2.5" />
                    Auto
                  </span>
                )}
              </div>
              {settings.betSizingEnabled && isManualStake && autoStake !== null && (
                <button
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  onClick={handleResetToAuto}
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset to auto ({sym}{autoStake.toFixed(2)})
                </button>
              )}
            </div>
            <Input
              type="number"
              step="1"
              min="0.01"
              value={stake}
              onChange={e => handleStakeChange(e.target.value)}
              className={`h-9 font-mono transition-all ${isAutoActive ? "ring-1 ring-primary/40 border-primary/40" : ""}`}
              placeholder="10"
            />
            {autoLabel && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {isManualStake ? (
                  <span className="text-amber-400/80">Manual override — auto: {sym}{autoStake?.toFixed(2)}</span>
                ) : (
                  autoLabel
                )}
              </p>
            )}
            {!settings.betSizingEnabled && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Enable <span className="text-foreground font-medium">Auto Bet Size</span> in Settings → Bet Size to auto-fill this.
              </p>
            )}
          </div>

          {/* ── Summary ── */}
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
