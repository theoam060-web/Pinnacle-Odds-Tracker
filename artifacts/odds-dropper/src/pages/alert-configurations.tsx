import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronsUpDown, Plus, Trash2, BellRing, BarChart2, X, Lock } from "lucide-react";
import { usePlan, PLAN_LIMITS } from "@/lib/plan-context";
import {
  useAlertStore,
  AlertConfig,
  SPORT_OPTIONS,
  MARKET_TYPE_OPTIONS,
  SPORT_MARKETS,
  SPORT_DEFAULTS,
  NOVIG_METHOD_LABELS,
  NovigMethod,
  BOOKMAKER_OPTIONS,
  BookmakerOption,
} from "@/lib/alert-context";

function BookmakerLogo({ domain, size = 16 }: { domain: string; size?: number }) {
  const [ok, setOk] = useState(true);
  const src = `https://www.google.com/s2/favicons?domain=${domain}&sz=${size * 2}`;
  if (!ok) return <span className="inline-block rounded-sm bg-muted" style={{ width: size, height: size }} />;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="rounded-sm object-contain"
      onError={() => setOk(false)}
      style={{ imageRendering: "crisp-edges" }}
    />
  );
}

function BookmakerMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (keys: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (key: string) => {
    onChange(
      selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    );
  };

  const grouped: Record<string, BookmakerOption[]> = {};
  for (const bm of BOOKMAKER_OPTIONS) {
    const g = bm.region.split("/")[0];
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(bm);
  }

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm font-normal h-9"
          >
            <span className="text-muted-foreground">
              {selected.length === 0
                ? "Select bookmakers…"
                : `${selected.length} bookmaker${selected.length > 1 ? "s" : ""} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="start" side="bottom">
          <Command>
            <CommandInput placeholder="Sök spelbolag…" className="h-9" />
            <CommandList className="max-h-[280px]">
              <CommandEmpty>Inga matchningar.</CommandEmpty>
              {Object.entries(grouped).map(([region, bms]) => (
                <CommandGroup key={region} heading={region}>
                  {bms.map((bm) => {
                    const isSelected = selected.includes(bm.key);
                    return (
                      <CommandItem
                        key={bm.key}
                        value={`${bm.title} ${bm.region}`}
                        onSelect={() => toggle(bm.key)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <BookmakerLogo domain={bm.domain} size={14} />
                        <span className="flex-1 text-xs">{bm.title}</span>
                        <span className="text-[10px] text-muted-foreground/60 mr-1">{bm.region}</span>
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "opacity-100 text-primary" : "opacity-0"}`}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((key) => {
            const bm = BOOKMAKER_OPTIONS.find((b) => b.key === key);
            if (!bm) return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px]"
              >
                <BookmakerLogo domain={bm.domain} size={12} />
                {bm.title}
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toggleItem(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter(x => x !== item) : [...list, item];
}

function getSportIcon(sportSlug: string): string {
  const sport = SPORT_OPTIONS.find(s => s.slug === sportSlug);
  if (!sport) return "🌍";
  const match = sport.label.match(/^(\S+)/);
  return match ? match[1] : "🌍";
}

function ConfigDetail({ config }: { config: AlertConfig }) {
  const { updateConfig, removeConfig, configs } = useAlertStore();
  const tier = usePlan();
  const limits = PLAN_LIMITS[tier];

  function patch(partial: Partial<AlertConfig>) {
    updateConfig(config.id, partial);
  }

  return (
    <div className="space-y-6">
      {/* Header row: switch, name, status badge, delete */}
      <div className="flex items-center gap-3">
        <Switch
          checked={config.enabled}
          onCheckedChange={enabled => patch({ enabled })}
        />
        <Input
          value={config.name}
          onChange={e => patch({ name: e.target.value })}
          className="h-8 text-base font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 flex-1"
        />
        <Badge variant="outline" className="text-[10px]">
          {config.enabled ? "Active" : "Paused"}
        </Badge>
        {configs.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeConfig(config.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Sport */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Sport</Label>
        <Select
          value={config.sport}
          onValueChange={v => {
            const defaults = SPORT_DEFAULTS[v] ?? {};
            const validSlugs = SPORT_MARKETS[v] ?? [];
            patch({
              sport: v,
              markets: config.markets.filter(m => validSlugs.includes(m)),
              ...defaults,
            });
          }}
        >
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
        <Label className="text-xs text-muted-foreground mb-2 block">
          Markets <span className="text-[10px]">(empty = all)</span>
        </Label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {MARKET_TYPE_OPTIONS.filter(m => (SPORT_MARKETS[config.sport] ?? []).includes(m.slug)).map(m => {
            const isLocked = limits.markets !== null && !limits.markets.includes(m.slug);
            return (
              <div key={m.slug} className={`flex items-center gap-2 ${isLocked ? "opacity-50" : ""}`}>
                <Checkbox
                  id={`${config.id}-mkt-${m.slug}`}
                  checked={!isLocked && config.markets.includes(m.slug)}
                  onCheckedChange={() => !isLocked && patch({ markets: toggleItem(config.markets, m.slug) })}
                  disabled={isLocked}
                />
                <Label htmlFor={`${config.id}-mkt-${m.slug}`} className={`text-xs ${isLocked ? "cursor-not-allowed" : "cursor-pointer"} flex items-center gap-1`}>
                  {m.label}
                  {isLocked && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-1 py-0 rounded"><Lock className="w-2 h-2" />Gold</span>}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AlertConfigurationsPage() {
  const { configs, novigMethod, setNovigMethod, addConfig, comparisonBookmakers, setComparisonBookmakers } = useAlertStore();
  const tier = usePlan();
  const maxConfigs = PLAN_LIMITS[tier].maxConfigs;
  // Cap visible configs to tier limit so downgraded users can't access extra configs
  const visibleConfigs = configs.slice(0, maxConfigs);

  const [selectedId, setSelectedId] = useState<string>(() => visibleConfigs[0]?.id ?? "");
  const prevCountRef = useRef<number>(visibleConfigs.length);
  useEffect(() => {
    if (visibleConfigs.length > prevCountRef.current) {
      const newest = visibleConfigs[visibleConfigs.length - 1];
      if (newest) setSelectedId(newest.id);
    }
    prevCountRef.current = visibleConfigs.length;
  }, [visibleConfigs.length]);

  useEffect(() => {
    if (!visibleConfigs.find(c => c.id === selectedId) && visibleConfigs.length > 0) {
      setSelectedId(visibleConfigs[0].id);
    }
  }, [visibleConfigs, selectedId]);

  const selectedConfig = visibleConfigs.find(c => c.id === selectedId) ?? visibleConfigs[0];

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BellRing className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Alert Configurations</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Configure up to {maxConfigs} independent alert setups. Each one filters the live feed and triggers a sound notification.
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

      {/* Bookmaker Comparison section — Platinum only */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Bookmaker Comparison</Label>
          {tier !== "platinum" && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-violet-400/90 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" /> Platinum
            </span>
          )}
        </div>
        {tier !== "platinum" ? (
          <p className="text-[11px] text-muted-foreground">
            Compare your bookmaker odds against sharp Pinnacle lines in the live feed.{" "}
            <a href="/" className="text-violet-400 hover:underline">Upgrade to Platinum</a> to unlock this feature.
          </p>
        ) : (
          <>
            <p className="text-[11px] text-muted-foreground mb-3">
              Select bookmakers to compare against sharp odds in the live feed.
            </p>
            <BookmakerMultiSelect
              selected={comparisonBookmakers}
              onChange={setComparisonBookmakers}
            />
            {comparisonBookmakers.length === 0 && (
              <p className="text-[11px] text-amber-400 mt-2">Inga spelbolag valda — jämförelse inaktiverad.</p>
            )}
          </>
        )}
      </div>

      <Separator className="mb-6" />

      {/* Master-detail layout */}
      <div className="flex gap-0 border rounded-lg overflow-hidden min-h-[500px]">
        {/* Left sidebar: config list */}
        <div className="w-56 shrink-0 border-r bg-card flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {visibleConfigs.map(config => (
              <button
                key={config.id}
                onClick={() => setSelectedId(config.id)}
                className={`w-full text-left px-3 py-3 flex items-center gap-2.5 transition-colors border-b border-border/50 last:border-b-0 ${
                  config.id === selectedId
                    ? "bg-primary/10 text-foreground"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-base leading-none">{getSportIcon(config.sport)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{config.name}</p>
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 h-4 mt-0.5 ${config.enabled ? "text-green-400 border-green-400/30" : "text-muted-foreground"}`}
                  >
                    {config.enabled ? "Active" : "Paused"}
                  </Badge>
                </div>
                {config.id === selectedId && (
                  <div className="w-0.5 h-6 bg-primary rounded-full shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Add Config button */}
          <div className="p-3 border-t border-border/50 space-y-2">
            {visibleConfigs.length < maxConfigs ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => { addConfig(maxConfigs); }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Config
              </Button>
            ) : (
              <div className="text-center space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-mono">
                  {tier === "silver" ? `Silver: max ${maxConfigs} konfigurationer` : `Max ${maxConfigs} konfigurationer`}
                </p>
                {tier === "silver" && (
                  <p className="text-[10px] text-amber-400/80">
                    <Lock className="w-2.5 h-2.5 inline mr-0.5" />
                    Uppgradera till Gold för fler
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: detail editor */}
        <div className="flex-1 p-6 bg-background overflow-y-auto">
          {selectedConfig ? (
            <ConfigDetail key={selectedConfig.id} config={selectedConfig} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a configuration to edit.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
