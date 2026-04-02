import { useState, useEffect } from "react";
import { useCreateBet, useUpdateBet } from "@workspace/api-client-react";
import type { Bet } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface BetFormModalProps {
  open: boolean;
  onClose: () => void;
  existingBet?: Bet | null;
  defaultMatchName?: string;
  defaultSelection?: string;
}

export function BetFormModal({ open, onClose, existingBet, defaultMatchName, defaultSelection }: BetFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [matchName, setMatchName] = useState(existingBet?.matchName ?? defaultMatchName ?? "");
  const [selection, setSelection] = useState(existingBet?.selection ?? defaultSelection ?? "");
  const [sport, setSport] = useState(existingBet?.sport ?? "");
  const [league, setLeague] = useState(existingBet?.league ?? "");
  const [oddsValue, setOddsValue] = useState(existingBet ? String(existingBet.oddsValue) : "");
  const [stake, setStake] = useState(existingBet ? String(existingBet.stake) : "");
  const [result, setResult] = useState(existingBet?.result ?? "pending");
  const [closingOdds, setClosingOdds] = useState(existingBet?.closingOdds != null ? String(existingBet.closingOdds) : "");
  const [notes, setNotes] = useState(existingBet?.notes ?? "");
  const [betDate, setBetDate] = useState(
    existingBet
      ? format(new Date(existingBet.betDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (open) {
      setMatchName(existingBet?.matchName ?? defaultMatchName ?? "");
      setSelection(existingBet?.selection ?? defaultSelection ?? "");
      setSport(existingBet?.sport ?? "");
      setLeague(existingBet?.league ?? "");
      setOddsValue(existingBet ? String(existingBet.oddsValue) : "");
      setStake(existingBet ? String(existingBet.stake) : "");
      setResult(existingBet?.result ?? "pending");
      setClosingOdds(existingBet?.closingOdds != null ? String(existingBet.closingOdds) : "");
      setNotes(existingBet?.notes ?? "");
      setBetDate(existingBet ? format(new Date(existingBet.betDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
    }
  }, [open, existingBet]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
  };

  const { mutate: createBet, isPending: isCreating } = useCreateBet({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Bet logged successfully" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to create bet", variant: "destructive" });
      }
    }
  });

  const { mutate: updateBet, isPending: isUpdating } = useUpdateBet({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Bet updated" });
        onClose();
      },
      onError: () => {
        toast({ title: "Failed to update bet", variant: "destructive" });
      }
    }
  });

  const isPending = isCreating || isUpdating;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!matchName || !selection || !oddsValue || !stake || !result) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const payload = {
      matchName,
      selection,
      sport: sport || undefined,
      league: league || undefined,
      oddsValue: parseFloat(oddsValue),
      stake: parseFloat(stake),
      result: result as any,
      closingOdds: closingOdds ? parseFloat(closingOdds) : null,
      notes: notes || null,
      betDate: new Date(betDate).toISOString(),
    };

    if (existingBet) {
      updateBet({ id: existingBet.id, data: payload });
    } else {
      createBet({ data: payload });
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-auto max-h-[90vh]">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold">{existingBet ? "Edit Bet" : "Log a New Bet"}</h2>
          <p className="text-sm text-muted-foreground">Record your bet details to track performance.</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="matchName">Match / Event <span className="text-destructive">*</span></Label>
              <Input
                id="matchName"
                placeholder="e.g. Liverpool vs Arsenal"
                value={matchName}
                onChange={e => setMatchName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="selection">Selection <span className="text-destructive">*</span></Label>
              <Input
                id="selection"
                placeholder="e.g. Liverpool"
                value={selection}
                onChange={e => setSelection(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="betDate">Bet Date</Label>
              <Input
                id="betDate"
                type="date"
                value={betDate}
                onChange={e => setBetDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                placeholder="e.g. soccer"
                value={sport}
                onChange={e => setSport(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="league">League</Label>
              <Input
                id="league"
                placeholder="e.g. Premier League"
                value={league}
                onChange={e => setLeague(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="oddsValue">Odds Taken <span className="text-destructive">*</span></Label>
              <Input
                id="oddsValue"
                type="number"
                step="0.001"
                min="1"
                placeholder="e.g. 2.10"
                value={oddsValue}
                onChange={e => setOddsValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="stake">Stake <span className="text-destructive">*</span></Label>
              <Input
                id="stake"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 100"
                value={stake}
                onChange={e => setStake(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="result">Result <span className="text-destructive">*</span></Label>
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger id="result">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="closingOdds">Closing Odds</Label>
              <Input
                id="closingOdds"
                type="number"
                step="0.001"
                min="1"
                placeholder="e.g. 2.05"
                value={closingOdds}
                onChange={e => setClosingOdds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Used to calculate CLV</p>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes or reasoning..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : existingBet ? "Update Bet" : "Log Bet"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
