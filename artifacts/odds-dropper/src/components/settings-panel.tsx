import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, RotateCcw, XCircle } from "lucide-react";

export interface FilterSettings {
  minDropPercent: number;
  sports: string[];
  marketTypes: string[];
  minOdds: number;
  maxOdds: number;
  maxHoursUntilMatch: number;
}

export const DEFAULT_FILTERS: FilterSettings = {
  minDropPercent: 2,
  sports: [],
  marketTypes: [],
  minOdds: 1.0,
  maxOdds: 50,
  maxHoursUntilMatch: 24,
};

const ALL_SPORTS = [
  { slug: "soccer", label: "⚽ Football" },
  { slug: "basketball", label: "🏀 Basketball" },
  { slug: "tennis", label: "🎾 Tennis" },
  { slug: "hockey", label: "🏒 Ice Hockey" },
  { slug: "american_football", label: "🏈 American Football" },
  { slug: "baseball", label: "⚾ Baseball" },
];

const ALL_MARKET_TYPES = [
  { slug: "moneyline", label: "Moneyline" },
  { slug: "spread", label: "Spread" },
  { slug: "total", label: "Total (O/U)" },
  { slug: "asian_handicap", label: "Asian Handicap" },
];

interface Props {
  filters: FilterSettings;
  onChange: (f: FilterSettings) => void;
  onCancelSubscription?: () => void;
  canCancelSubscription?: boolean;
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

export function SettingsPanel({ filters, onChange, onCancelSubscription, canCancelSubscription }: Props) {
  function update(partial: Partial<FilterSettings>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters & Settings
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[340px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filter Settings
          </SheetTitle>
        </SheetHeader>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold">Min Odds Drop</Label>
            <span className="text-sm font-mono text-primary">{filters.minDropPercent.toFixed(1)}%</span>
          </div>
          <Slider
            min={0.5}
            max={30}
            step={0.5}
            value={[filters.minDropPercent]}
            onValueChange={([v]) => update({ minDropPercent: v })}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0.5%</span>
            <span>30%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Only show rows where odds dropped by at least this much from opening. Also controls alert threshold.
          </p>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <Label className="text-sm font-semibold mb-3 block">Odds Range</Label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Label className="text-[11px] text-muted-foreground">Min odds</Label>
              <Input
                type="number"
                min={1}
                max={filters.maxOdds}
                step={0.05}
                value={filters.minOdds}
                onChange={e => update({ minOdds: parseFloat(e.target.value) || 1 })}
                className="h-8 text-sm mt-1"
              />
            </div>
            <div className="pt-4 text-muted-foreground text-xs">—</div>
            <div className="flex-1">
              <Label className="text-[11px] text-muted-foreground">Max odds</Label>
              <Input
                type="number"
                min={filters.minOdds}
                max={1000}
                step={0.5}
                value={filters.maxOdds}
                onChange={e => update({ maxOdds: parseFloat(e.target.value) || 50 })}
                className="h-8 text-sm mt-1"
              />
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-semibold">Max time until match</Label>
            <span className="text-sm font-mono text-primary">{filters.maxHoursUntilMatch}h</span>
          </div>
          <Slider
            min={1}
            max={48}
            step={1}
            value={[filters.maxHoursUntilMatch]}
            onValueChange={([v]) => update({ maxHoursUntilMatch: v })}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1h</span>
            <span>48h</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <Label className="text-sm font-semibold mb-3 block">Sports</Label>
          <p className="text-[11px] text-muted-foreground mb-3">Leave all unchecked to show every sport.</p>
          <div className="space-y-2">
            {ALL_SPORTS.map(s => (
              <div key={s.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`sport-${s.slug}`}
                  checked={filters.sports.includes(s.slug)}
                  onCheckedChange={() => update({ sports: toggleItem(filters.sports, s.slug) })}
                />
                <Label htmlFor={`sport-${s.slug}`} className="text-sm cursor-pointer">{s.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="mb-6">
          <Label className="text-sm font-semibold mb-3 block">Market Types</Label>
          <p className="text-[11px] text-muted-foreground mb-3">Leave all unchecked to show all markets.</p>
          <div className="space-y-2">
            {ALL_MARKET_TYPES.map(m => (
              <div key={m.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`mkt-${m.slug}`}
                  checked={filters.marketTypes.includes(m.slug)}
                  onCheckedChange={() => update({ marketTypes: toggleItem(filters.marketTypes, m.slug) })}
                />
                <Label htmlFor={`mkt-${m.slug}`} className="text-sm cursor-pointer">{m.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <RotateCcw className="w-3 h-3 mr-2" />
          Reset to defaults
        </Button>

        {canCancelSubscription && onCancelSubscription && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full mt-3"
            onClick={onCancelSubscription}
          >
            <XCircle className="w-3 h-3 mr-2" />
            Avbryt prenumeration
          </Button>
        )}
      </SheetContent>
    </Sheet>
  );
}
