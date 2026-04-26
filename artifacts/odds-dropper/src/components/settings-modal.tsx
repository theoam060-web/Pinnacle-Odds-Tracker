import { useState } from "react";
import { useAppAuth } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, Theme, BetSizeMethod, calcKellyStake, calcUnitStake } from "@/lib/settings-context";
import { useBetStore, CURRENCIES } from "@/lib/bet-store";
import { Info, Palette, Calculator, DollarSign, LogOut, CreditCard, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
}

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Default dark background" },
  { value: "midnight", label: "Midnight", description: "Deep navy blue tones" },
  { value: "light", label: "Light", description: "White / light grey background" },
];

export function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings } = useSettings();
  const { currency, setCurrency } = useBetStore();
  const { signOut, token } = useAppAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json" },
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.open(data.url, "_blank");
    } finally {
      setPortalLoading(false);
    }
  }

  // Preview bet size calculation
  const previewStake = settings.betSizingEnabled
    ? settings.betSizeMethod === "kelly"
      ? calcKellyStake(settings.bankroll, settings.kellyFraction, 2.0, 0.52)
      : calcUnitStake(settings.bankroll, settings.unitSizePercent)
    : null;

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full mb-4 h-auto">
            <TabsTrigger value="preferences" className="text-[11px] flex flex-col gap-0.5 py-2">
              <Palette className="w-3.5 h-3.5" />
              Prefs
            </TabsTrigger>
            <TabsTrigger value="betsizing" className="text-[11px] flex flex-col gap-0.5 py-2">
              <Calculator className="w-3.5 h-3.5" />
              Bet Size
            </TabsTrigger>
            <TabsTrigger value="currency" className="text-[11px] flex flex-col gap-0.5 py-2">
              <DollarSign className="w-3.5 h-3.5" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="about" className="text-[11px] flex flex-col gap-0.5 py-2">
              <Info className="w-3.5 h-3.5" />
              About
            </TabsTrigger>
          </TabsList>

          {/* ── PREFERENCES ── */}
          <TabsContent value="preferences" className="space-y-5">
            <div>
              <Label className="text-xs font-semibold mb-3 block">Background Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => updateSettings({ theme: t.value })}
                    className={`rounded-md border px-3 py-3 text-left transition-all ${
                      settings.theme === t.value
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.description}</div>
                    <div className={`mt-2 h-4 rounded-sm ${
                      t.value === "dark" ? "bg-zinc-900" :
                      t.value === "midnight" ? "bg-blue-950" :
                      "bg-gray-100 border border-gray-200"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Auto-Settle Bets</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Show "Match Started" on pending bets once the match kick-off time has passed
                </p>
              </div>
              <Switch
                checked={settings.autoSettle}
                onCheckedChange={v => updateSettings({ autoSettle: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Compact Mode</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Reduce row height in the feed table</p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={v => updateSettings({ compactMode: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Show No-Vig Column</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">Display fair-value no-vig odds in the feed</p>
              </div>
              <Switch
                checked={settings.showNovig}
                onCheckedChange={v => updateSettings({ showNovig: v })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-2 block">Odds Format</Label>
              <Select value={settings.oddsFormat} onValueChange={v => updateSettings({ oddsFormat: v as any })}>
                <SelectTrigger className="h-8 text-xs w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal" className="text-xs">Decimal (2.000)</SelectItem>
                  <SelectItem value="american" className="text-xs">American (+100)</SelectItem>
                  <SelectItem value="fractional" className="text-xs">Fractional (1/1)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Note: odds format applies to display only — calculations always use decimal.
              </p>
            </div>
          </TabsContent>

          {/* ── BET SIZING ── */}
          <TabsContent value="betsizing" className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Auto-Calculate Bet Size</Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Pre-fill stake in Log Bet modal based on your bankroll &amp; method
                </p>
              </div>
              <Switch
                checked={settings.betSizingEnabled}
                onCheckedChange={v => updateSettings({ betSizingEnabled: v })}
              />
            </div>

            <div className={`space-y-4 ${!settings.betSizingEnabled ? "opacity-40 pointer-events-none" : ""}`}>
              <div>
                <Label className="text-xs mb-1.5 block">Starting Bankroll</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    step="100"
                    value={settings.bankroll}
                    onChange={e => updateSettings({ bankroll: parseFloat(e.target.value) || 1000 })}
                    className="h-8 text-xs font-mono w-[160px]"
                  />
                  <span className="text-xs text-muted-foreground">in your selected currency</span>
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Bet Size Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["kelly", "percent"] as BetSizeMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => updateSettings({ betSizeMethod: m })}
                      className={`rounded-md border px-3 py-2.5 text-left transition-all ${
                        settings.betSizeMethod === m
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/40"
                      }`}
                    >
                      <div className="text-xs font-semibold capitalize">{m === "kelly" ? "Kelly Criterion" : "Fixed %"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {m === "kelly"
                          ? "Bet size based on edge vs fair odds"
                          : "Fixed percentage of bankroll per bet"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {settings.betSizeMethod === "kelly" ? (
                <div>
                  <Label className="text-xs mb-1.5 block">
                    Kelly Fraction <span className="text-muted-foreground">({Math.round(settings.kellyFraction * 100)}%)</span>
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={Math.round(settings.kellyFraction * 100)}
                      onChange={e => updateSettings({ kellyFraction: parseInt(e.target.value) / 100 })}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-10 text-right">{Math.round(settings.kellyFraction * 100)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    25% (quarter-Kelly) is recommended for risk management.
                  </p>
                </div>
              ) : (
                <div>
                  <Label className="text-xs mb-1.5 block">Unit Size (% of bankroll per bet)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={settings.unitSizePercent}
                      onChange={e => updateSettings({ unitSizePercent: parseFloat(e.target.value) || 2 })}
                      className="h-8 text-xs font-mono w-[100px]"
                    />
                    <span className="text-xs text-muted-foreground">% per bet</span>
                  </div>
                </div>
              )}

              {previewStake !== null && (
                <div className="bg-muted/30 rounded-md px-4 py-3 text-xs">
                  <div className="text-muted-foreground mb-1">Example calculated stake:</div>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {previewStake.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {settings.betSizeMethod === "kelly"
                      ? `At 2.0 odds with 52% implied win probability · ${Math.round(settings.kellyFraction * 100)}% Kelly`
                      : `${settings.unitSizePercent}% of ${settings.bankroll.toFixed(0)} bankroll`}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── CURRENCY ── */}
          <TabsContent value="currency" className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Select your preferred currency. Profit, loss, and stake values in the Bet Tracker will be labelled with this currency symbol.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`rounded-md border px-3 py-2.5 text-left transition-all ${
                    currency === c.code
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground w-8">{c.symbol}</span>
                    <div>
                      <div className="text-xs font-semibold">{c.code}</div>
                      <div className="text-[10px] text-muted-foreground">{c.label}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          {/* ── ABOUT / LEGAL ── */}
          <TabsContent value="about" className="space-y-5 text-xs">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">About SharpTracker</h3>
              <p className="text-muted-foreground leading-relaxed">
                SharpTracker is a real-time Pinnacle odds monitoring dashboard designed for
                professional bettors and sharp syndicate members. It detects significant odds
                drops, computes no-vig fair values, and helps you identify where sharp money is
                moving in the market.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Data is sourced from the Pinnacle API and refreshed every 15 seconds. When the
                API is unavailable a realistic mock data stream is used automatically.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-mono">v1.0.0</span>
                <span className="text-muted-foreground text-[10px]">Built with React + Vite + Recharts</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="font-semibold">Terms of Service</h3>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  By using SharpTracker you agree that this tool is provided for informational
                  purposes only. It does not constitute betting advice. You are solely responsible
                  for all betting decisions made using this application.
                </p>
                <p>
                  Gambling can be addictive. Only bet what you can afford to lose. If you have a
                  gambling problem, seek help from your national support service.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <h3 className="font-semibold">Privacy Policy</h3>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>
                  SharpTracker stores all data exclusively in your browser's localStorage. No
                  personal data, bets, or settings are ever transmitted to external servers beyond
                  the Pinnacle API calls used to retrieve live market data.
                </p>
                <p>
                  We do not use cookies, analytics, or any third-party tracking services.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── ACCOUNT ACTIONS ── */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => signOut()}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CreditCard className="w-3.5 h-3.5" />
              )}
              Manage / Cancel subscription
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
