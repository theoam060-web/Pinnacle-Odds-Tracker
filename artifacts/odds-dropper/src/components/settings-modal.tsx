import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, Theme, BetSizeMethod, calcKellyStake, calcUnitStake } from "@/lib/settings-context";
import { useBetStore, CURRENCIES } from "@/lib/bet-store";
import { Info, Palette, Calculator, DollarSign, LogOut, Smartphone, Bell, BellOff, Download, CheckCircle2, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = "BNFtL8Llx7d_UNrd74MJ1ja7bzLlln6qFdJYdJ3qf2I6PtXob2s5NP9FW79okpFGWWtBzzRJ1jzK5dWkEXDWIRw";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

async function getClerkToken(): Promise<string | null> {
  try {
    const { useAuth } = await import("@clerk/react");
    void useAuth;
  } catch { return null; }
  return null;
}

interface Props {
  onClose: () => void;
}

const THEMES: { value: Theme; label: string; description: string }[] = [
  { value: "dark", label: "Dark", description: "Default dark background" },
  { value: "midnight", label: "Midnight", description: "Deep navy blue tones" },
  { value: "light", label: "Light", description: "White / light grey background" },
];

function useGetToken() {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return useCallback(async (): Promise<string | null> => {
    if (bypassAuth || !clerkKey) return null;
    try {
      const { useAuth } = await import("@clerk/react");
      void useAuth;
      return null;
    } catch { return null; }
  }, [bypassAuth, clerkKey]);
}

function AppTab() {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(!bypassAuth);
  const [saving, setSaving] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isSupported = typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    let token: string | null = null;
    if (!bypassAuth) {
      try {
        const clerkModule = (window as any).__clerk__;
        if (clerkModule?.session) token = await clerkModule.session.getToken();
      } catch { /* no token */ }
    }
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });
  }, [bypassAuth]);

  useEffect(() => {
    if (bypassAuth) return;
    authFetch("/api/user/settings")
      .then(r => r.ok ? r.json() : { notificationsEnabled: true })
      .then(data => setNotificationsEnabled(data.notificationsEnabled ?? true))
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, [bypassAuth, authFetch]);

  useEffect(() => {
    if (!isSupported) { setPushPermission("unsupported"); return; }
    setPushPermission(Notification.permission);
    const base = import.meta.env.BASE_URL ?? "/app/";
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .then(reg => {
        setSwReg(reg);
        return reg.pushManager.getSubscription();
      })
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [isSupported]);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsInstalled(mq.matches || (navigator as any).standalone === true);
    const mqHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener("change", mqHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      mq.removeEventListener("change", mqHandler);
    };
  }, []);

  async function handleNotificationsToggle(enabled: boolean) {
    setNotificationsEnabled(enabled);
    setSaving(true);
    try {
      await authFetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: enabled }),
      });
      if (!enabled && isSubscribed && swReg) {
        const sub = await swReg.pushManager.getSubscription();
        if (sub) {
          const endpoint = sub.endpoint;
          await sub.unsubscribe();
          await authFetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
          });
          setIsSubscribed(false);
        }
      }
      if (enabled && !isSubscribed && swReg && pushPermission === "granted") {
        await doSubscribe(swReg);
      }
    } catch {
      setNotificationsEnabled(!enabled);
    } finally {
      setSaving(false);
    }
  }

  async function doSubscribe(reg: ServiceWorkerRegistration): Promise<boolean> {
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await authFetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setIsSubscribed(true);
      return true;
    } catch {
      return false;
    }
  }

  async function handleEnablePush() {
    if (!swReg) return;
    setSubscribeLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm !== "granted") return;
      const ok = await doSubscribe(swReg);
      if (ok) {
        setNotificationsEnabled(true);
        await authFetch("/api/user/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationsEnabled: true }),
        });
      }
    } finally {
      setSubscribeLoading(false);
    }
  }

  async function handleTestNotification() {
    try {
      await authFetch("/api/push/test", { method: "POST" });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch { /* ignore */ }
  }

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") { setInstallPrompt(null); setIsInstalled(true); }
  }

  return (
    <div className="space-y-6">
      {/* Install to Home Screen */}
      <div>
        <Label className="text-xs font-semibold mb-3 block">Home Screen</Label>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-md bg-primary/10">
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold">Install SharpTracker</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                Add to your home screen for a full-screen app experience. Works on iOS (Safari) and Android (Chrome).
              </p>
            </div>
          </div>

          {isInstalled ? (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              App is installed on this device
            </div>
          ) : installPrompt ? (
            <Button size="sm" className="h-8 text-xs gap-1.5 w-full" onClick={handleInstall}>
              <Download className="w-3.5 h-3.5" />
              Add to Home Screen
            </Button>
          ) : (
            <div className="text-[10px] text-muted-foreground bg-muted/30 rounded-md px-3 py-2 leading-relaxed">
              <strong className="text-foreground">iOS Safari:</strong> Tap the Share button → "Add to Home Screen"
              <br />
              <strong className="text-foreground">Android Chrome:</strong> Tap the menu (⋮) → "Add to Home Screen"
            </div>
          )}
        </div>
      </div>

      {/* Push Notifications */}
      <div>
        <Label className="text-xs font-semibold mb-3 block">Push Notifications</Label>
        <div className="rounded-lg border border-border p-4 space-y-4">
          {settingsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading…
            </div>
          ) : pushPermission === "unsupported" ? (
            <p className="text-[10px] text-muted-foreground">
              Push notifications are not supported in this browser. Try Chrome or Firefox.
            </p>
          ) : pushPermission === "denied" ? (
            <div className="flex items-start gap-2">
              <BellOff className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-400">Notifications blocked</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Notifications are blocked for this site. Go to your browser settings and allow notifications.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Enable Notifications</Label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Receive alerts for significant odds drops
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsToggle}
                  disabled={saving}
                />
              </div>

              {notificationsEnabled && (
                <div className="space-y-3 pl-0.5">
                  {!isSubscribed ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-amber-400/90">
                        Grant browser permission to receive push notifications.
                      </p>
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={handleEnablePush}
                        disabled={subscribeLoading}
                      >
                        {subscribeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                        {subscribeLoading ? "Requesting…" : "Allow Notifications"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Notifications active on this device
                    </div>
                  )}

                  {isSubscribed && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1.5"
                        onClick={handleTestNotification}
                        disabled={testSent}
                      >
                        {testSent ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-400" /> Sent!</>
                        ) : (
                          <><Bell className="w-3 h-3" /> Send test notification</>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Notification settings are saved to your account and apply across all your devices.
      </p>
    </div>
  );
}

export function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings } = useSettings();
  const { currency, setCurrency } = useBetStore();
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  const previewStake = settings.betSizingEnabled
    ? settings.betSizeMethod === "kelly"
      ? calcKellyStake(settings.bankroll, settings.kellyFraction, 2.0, 0.52)
      : calcUnitStake(settings.bankroll, settings.unitSizePercent)
    : null;

  async function handleSignOut() {
    if (bypassAuth || !clerkKey) return;
    try {
      const { useClerk } = await import("@clerk/react");
      void useClerk;
    } catch { /* noop */ }
    window.location.href = "/";
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preferences" className="mt-2">
          <TabsList className="grid grid-cols-5 w-full mb-4 h-auto">
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
            <TabsTrigger value="app" className="text-[11px] flex flex-col gap-0.5 py-2">
              <Smartphone className="w-3.5 h-3.5" />
              App
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

          {/* ── APP (PWA + NOTIFICATIONS) ── */}
          <TabsContent value="app">
            <AppTab />
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
                  SharpTracker stores app preferences in your browser's localStorage and your
                  notification settings on our servers (linked to your account). No betting data
                  is ever transmitted to external servers.
                </p>
                <p>
                  We do not use cookies, analytics, or any third-party tracking services.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-border flex items-center">
          {!bypassAuth && clerkKey && (
            <SignOutButton onSignOut={handleSignOut} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  const [clerk, setClerk] = useState<any>(null);

  useEffect(() => {
    import("@clerk/react").then(m => setClerk(m)).catch(() => {});
  }, []);

  if (!clerk) return null;

  const Btn = () => {
    const { signOut } = clerk.useClerk();
    return (
      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors h-8 px-2 rounded-md hover:bg-accent"
        onClick={() => signOut()}
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    );
  };

  return <Btn />;
}
