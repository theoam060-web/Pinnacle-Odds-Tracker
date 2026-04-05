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

type MarketType = "moneyline" | "spread" | "total";

const MARKET_OPTIONS: { value: MarketType; label: string }[] = [
  { value: "moneyline", label: "Moneyline" },
  { value: "spread", label: "Spread" },
  { value: "total", label: "Total (Over/Under)" },
];

const RESULT_OPTIONS: { value: BetResult; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "win", label: "Win" },
  { value: "loss", label: "Loss" },
  { value: "void", label: "Void" },
];

// Direction options per market type
const DIRECTIONS: Record<MarketType, string[]> = {
  moneyline: ["Home", "Away", "Draw"],
  spread: ["Home", "Away"],
  total: ["Over", "Under"],
};

// Parse existing selection string into { direction, line }
// e.g. "home 0.5" → { direction: "Home", line: "0.5" }
// e.g. "over 2.75" → { direction: "Over", line: "2.75" }
// e.g. "draw" → { direction: "Draw", line: "" }
function parseSelection(sel: string): { direction: string; line: string } {
  const [dir, ...rest] = sel.trim().split(" ");
  const direction = dir.charAt(0).toUpperCase() + dir.slice(1).toLowerCase();
  return { direction, line: rest.join(" ") };
}

function normalizeMarket(raw: string): MarketType {
  const m = raw.toLowerCase();
  if (m === "spread") return "spread";
  if (m === "total" || m === "totals") return "total";
  return "moneyline";
}

export function EditBetModal({ bet, onClose }: Props) {
  const { updateBet } = useBetStore();

  const [odds, setOdds] = useState(bet.bettingOdds.toString());
  const [stake, setStake] = useState(bet.stake.toString());
  const [closingOdds, setClosingOdds] = useState(bet.closingOdds ? bet.closingOdds.toString() : "");
  const [result, setResult] = useState<BetResult>(bet.result);
  const [marketType, setMarketType] = useState<MarketType>(normalizeMarket(bet.marketType));

  const { direction: initDir, line: initLine } = parseSelection(bet.selection);
  const [direction, setDirection] = useState(initDir);
  const [line, setLine] = useState(initLine);

  const parsedOdds = parseFloat(odds);
  const parsedStake = parseFloat(stake);
  const oddsValid = !isNaN(parsedOdds) && parsedOdds > 1;
  const stakeValid = !isNaN(parsedStake) && parsedStake > 0;
  const canSave = oddsValid && stakeValid && direction.length > 0 && closingOddsValid;

  // When market type changes, reset direction to the first valid option
  function handleMarketChange(m: MarketType) {
    setMarketType(m);
    const dirs = DIRECTIONS[m];
    if (!dirs.includes(direction)) {
      setDirection(dirs[0]);
    }
    if (m === "moneyline") setLine("");
  }

  // Reconstruct full selection string
  const finalSelection = line.trim() ? `${direction} ${line.trim()}` : direction;

  // Live P&L preview
  const previewProfit = oddsValid && stakeValid ? parseFloat(((parsedOdds - 1) * parsedStake).toFixed(2)) : null;
  const previewPL = result === "win" && previewProfit !== null
    ? previewProfit
    : result === "loss" && stakeValid
      ? -parsedStake
      : null;

  const parsedClosingOdds = closingOdds !== "" ? parseFloat(closingOdds) : undefined;
  const closingOddsValid = parsedClosingOdds === undefined || (!isNaN(parsedClosingOdds) && parsedClosingOdds > 1);

  function handleSave() {
    if (!canSave) return;
    updateBet(bet.id, {
      bettingOdds: parsedOdds,
      stake: parsedStake,
      selection: finalSelection,
      marketType,
      result,
      closingOdds: parsedClosingOdds && parsedClosingOdds > 1 ? parsedClosingOdds : undefined,
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
          {/* Market type */}
          <div>
            <Label className="text-xs mb-1.5 block">Market type</Label>
            <Select value={marketType} onValueChange={v => handleMarketChange(v as MarketType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKET_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection — direction + optional line value */}
          <div>
            <Label className="text-xs mb-1.5 block">Selection</Label>
            <div className="flex gap-2">
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS[marketType].map(d => (
                    <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Line value only shown for spread and total */}
              {(marketType === "spread" || marketType === "total") && (
                <Input
                  type="number"
                  step="0.25"
                  value={line}
                  onChange={e => setLine(e.target.value)}
                  placeholder="Line (e.g. 2.5)"
                  className="h-8 text-xs font-mono w-[110px]"
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Selection: <span className="font-mono text-foreground">{finalSelection}</span>
            </p>
          </div>

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

          {/* Closing odds */}
          <div>
            <Label className="text-xs mb-1.5 block">
              Closing odds <span className="text-muted-foreground font-normal">(valfritt — för CLV)</span>
            </Label>
            <Input
              type="number"
              step="0.001"
              min="1.01"
              value={closingOdds}
              onChange={e => setClosingOdds(e.target.value)}
              placeholder="t.ex. 1.750"
              className={`h-8 text-xs font-mono ${!closingOddsValid && closingOdds !== "" ? "border-red-500" : ""}`}
            />
            {!closingOddsValid && closingOdds !== "" && (
              <p className="text-[10px] text-red-400 mt-1">Måste vara större än 1.0</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              Pinnacles odds vid matchstart — aktiverar CLV-linjen i Bet Stats
            </p>
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
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
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
