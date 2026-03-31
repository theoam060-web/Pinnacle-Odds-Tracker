import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, BellRing } from "lucide-react";
import {
  useAlertStore,
  AlertConfig,
  SPORT_OPTIONS,
  MARKET_TYPE_OPTIONS,
  NOVIG_METHOD_LABELS,
  NovigMethod,
} from "@/lib/alert-context";

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

function ConfigCard({ config }: { config: AlertConfig }) {
  const { updateConfig, removeConfig, configs } = useAlertStore();

  function patch(partial: Partial<AlertConfig>) {
    updateConfig(config.id, partial);
  }

  return (
    <Card className={`transition-opacity ${config.enabled ? "" : "opacity-50"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={config.enabled}
            onCheckedChange={enabled => patch({ enabled })}
          />
          <Input
            value={config.name}
            onChange={e => patch({ name: e.target.value })}
            className="h-7 text-sm font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 w-32"
          />
          <Badge variant="outline" className="text-[10px] ml-auto">
            {config.enabled ? "Active" : "Paused"}
          </Badge>
          {configs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeConfig(config.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sport */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Sport</Label>
          <Select value={config.sport} onValueChange={v => patch({ sport: v })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORT_OPTIONS.map(s => (
                <SelectItem key={s.slug} value={s.slug}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Drop % */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Min Drop %</Label>
            <span className="text-xs font-mono text-green-400">{config.minDropPercent.toFixed(1)}%</span>
          </div>
          <Slider
            min={0.5}
            max={30}
            step={0.5}
            value={[config.minDropPercent]}
            onValueChange={([v]) => patch({ minDropPercent: v })}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0.5%</span><span>30%</span>
          </div>
        </div>

        {/* Max time until match */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-xs text-muted-foreground">Max time until match</Label>
            <span className="text-xs font-mono text-primary">{config.maxHoursUntilMatch}h</span>
          </div>
          <Slider
            min={1}
            max={48}
            step={1}
            value={[config.maxHoursUntilMatch]}
            onValueChange={([v]) => patch({ maxHoursUntilMatch: v })}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1h</span><span>48h</span>
          </div>
        </div>

        {/* Odds range */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Odds Range</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              max={config.maxOdds}
              step={0.05}
              value={config.minOdds}
              onChange={e => patch({ minOdds: parseFloat(e.target.value) || 1 })}
              className="h-8 text-sm"
              placeholder="Min"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="number"
              min={config.minOdds}
              max={1000}
              step={0.5}
              value={config.maxOdds}
              onChange={e => patch({ maxOdds: parseFloat(e.target.value) || 50 })}
              className="h-8 text-sm"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Limit range */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Limit Range</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              value={config.minLimit}
              onChange={e => patch({ minLimit: parseInt(e.target.value) || 0 })}
              className="h-8 text-sm"
              placeholder="Min limit"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="number"
              min={0}
              value={config.maxLimit === 999999 ? "" : config.maxLimit}
              onChange={e => patch({ maxLimit: parseInt(e.target.value) || 999999 })}
              className="h-8 text-sm"
              placeholder="Max limit"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Leave max empty for no upper limit. Requires live API for limit data.</p>
        </div>

        {/* Markets */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Markets <span className="text-[10px]">(empty = all)</span></Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {MARKET_TYPE_OPTIONS.map(m => (
              <div key={m.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`${config.id}-mkt-${m.slug}`}
                  checked={config.markets.includes(m.slug)}
                  onCheckedChange={() => patch({ markets: toggleItem(config.markets, m.slug) })}
                />
                <Label htmlFor={`${config.id}-mkt-${m.slug}`} className="text-xs cursor-pointer">{m.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AlertConfigurationsPage() {
  const { configs, novigMethod, setNovigMethod, addConfig } = useAlertStore();

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BellRing className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Alert Configurations</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Configure up to 9 independent alert setups. Each one filters the live feed and triggers a sound notification.
        </p>
      </div>

      {/* Global: No-vig method */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">No-vig Method</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">Applied globally across the feed and expanded charts.</p>
          </div>
          <Select value={novigMethod} onValueChange={v => setNovigMethod(v as NovigMethod)}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(NOVIG_METHOD_LABELS) as [NovigMethod, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Config cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {configs.map(config => (
          <ConfigCard key={config.id} config={config} />
        ))}

        {configs.length < 9 && (
          <button
            onClick={addConfig}
            className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors min-h-[200px]"
          >
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Add Config</span>
            <span className="text-[11px] mt-1">{9 - configs.length} remaining</span>
          </button>
        )}
      </div>
    </Layout>
  );
}
