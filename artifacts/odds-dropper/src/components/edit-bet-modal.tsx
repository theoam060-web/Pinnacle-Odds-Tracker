import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoggedBet, BetResult, useBetStore } from "@/lib/bet-store";

interface Props {
  bet: LoggedBet;
  onClose: () => void;
}

const RESULT_OPTIONS: { value: BetResult; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
  { value: "void", label: "Void" },
];

export function EditBetModal({ bet, onClose }: Props) {
  const { updateBet } = useBetStore();

  const [odds, setOdds] = useState(bet.bettingOdds.toString());
  const [stake, setStake] = useState(bet.stake.toString());
  const [selection, setSelection] = useState(bet.selection);
  const [marketType, setMarketType] = useState(bet.marketType);
  const [result, setResult] = useState<BetResult>(bet.result);

  const parsedOdds = parseFloat(odds);
  const parsedStake = parseFloat(stake);
  const oddsValid = !isNaN(parsedOdds) && parsedOdds > 1;
  const stakeValid = !isNaN(parsedStake) && parsedStake > 0;
  const canSave = oddsValid && stakeValid && selection.trim().length > 0;

  // Live preview of P&L based on current inputs
  const previewProfit = oddsValid && stakeValid
    ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2))
    : null;
  const previewPL = result === "win" && previewProfit !== null
    ? previewProfit
    : result === "loss" && stakeValid
      ? -parsedStake
      : null;

  function handleSave() {
    if (!canSave) return;
    updateBet(bet.id, {
      bettingOdds: parsedOdds,
      stake: parsedStake,
      selection: selection.trim(),
      marketType: marketType.trim(),
      result,
    });
    onClose();
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm w-full">
        <DialogHeader>
          <DialogTitle className="text-sm">Edit Bet</DialogTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {bet.homeTeam} vs {bet.awayTeam}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Odds */}
          <div>
            <Label className="text-xs mb-1.5 block">Odds taken (decimal)</Label>
            <Input
              type="number"
              step="0.001"
              min="1.01"
              value={odds}
              onChange={e => setOdds(e.target.value)}
              className={`h-8 text-xs font-mono ${!oddsValid && odds !== "" ? "border-red-500" : ""}`}
            />
            {!oddsValid && odds !== "" && (
              <p className="text-[10px] text-red-400 mt-1">Must be greater than 1.0</p>
            )}
          </div>

          {/* Stake */}
          <div>
            <Label className="text-xs mb-1.5 block">Stake</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={stake}
              onChange={e => setStake(e.target.value)}
              className={`h-8 text-xs font-mono ${!stakeValid && stake !== "" ? "border-red-500" : ""}`}
            />
          </div>

          {/* Selection */}
          <div>
            <Label className="text-xs mb-1.5 block">Selection</Label>
            <Input
              value={selection}
              onChange={e => setSelection(e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g. Home, Away, Draw, Over 2.5"
            />
          </div>

          {/* Market type */}
          <div>
            <Label className="text-xs mb-1.5 block">Market type</Label>
            <Input
              value={marketType}
              onChange={e => setMarketType(e.target.value)}
              className="h-8 text-xs"
              placeholder="e.g. moneyline, spread, total"
            />
          </div>

          {/* Result */}
          <div>
            <Label className="text-xs mb-1.5 block">Result</Label>
            <Select value={result} onValueChange={v => setResult(v as BetResult)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULT_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* P&L preview */}
          {previewPL !== null && (
            <div className="bg-muted/30 rounded-md px-3 py-2 text-xs">
              <span className="text-muted-foreground">P&amp;L preview: </span>
              <span className={`font-mono font-bold ${previewPL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {previewPL >= 0 ? "+" : ""}{previewPL.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-8">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave} className="text-xs h-8">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
