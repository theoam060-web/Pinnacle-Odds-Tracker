import { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Activity, TrendingDown, BookMarked, BellRing, Volume2, VolumeX, Cog, BarChart2, Zap, X } from "lucide-react";
import { useAlertStore } from "@/lib/alert-context";
import { useGetOddsSummary, getGetOddsSummaryQueryKey } from "@workspace/api-client-react";
import { SettingsModal } from "@/components/settings-modal";
import { useOddsStream, type OddsDropEvent, type OddsStreamFilters } from "@/hooks/use-odds-stream";
import { useBetStore, getCurrencySymbol, calcEVCurrency } from "@/lib/bet-store";
import { playChime } from "@/lib/chime";
const NAV_ITEMS = [
  { href: "/", label: "Live Feed", icon: TrendingDown },
  { href: "/bet-tracker", label: "Bet Tracker", icon: BookMarked },
  { href: "/bet-stats", label: "Bet Stats", icon: BarChart2 },
  { href: "/alert-configurations", label: "Alert Configurations", icon: BellRing },
];

function OddsStreamListener({
  soundEnabled,
  filters,
}: {
  soundEnabled: boolean;
  filters?: OddsStreamFilters;
}) {
  const handleDrop = useCallback(
    (_drop: OddsDropEvent) => {
      if (soundEnabled) playChime();
    },
    [soundEnabled],
  );

  useOddsStream({ filters, onDrop: handleDrop });
  return null;
}

interface LayoutProps {
  children: React.ReactNode;
  notificationFilters?: OddsStreamFilters;
}

function MobileAppComingSoon() {
  return (
    <div className="mx-3 mb-3">
      <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono bg-amber-400/[0.04] border border-amber-400/20 text-amber-300/60">
        <span className="relative flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 block animate-pulse" />
        </span>
        <span>Mobile app — coming soon</span>
      </div>
    </div>
  );
}

export function Layout({ children, notificationFilters }: LayoutProps) {
  const [location] = useLocation();
  const { configs, soundEnabled, setSoundEnabled } = useAlertStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeConfigCount = configs.filter(c => c.enabled).length;

  const { data: summary } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 15000 }
  });

  const { bets, currency } = useBetStore();
  const sym = getCurrencySymbol(currency);
  const unsettled = bets.filter(b => b.result === "pending");
  const totalStaked = unsettled.reduce((s, b) => s + b.stake, 0);
  const settledWins = bets.filter(b => b.result === "win");
  const settledLosses = bets.filter(b => b.result === "loss");
  const currentPL = settledWins.reduce((s, b) => s + b.potentialProfit, 0)
    - settledLosses.reduce((s, b) => s + b.stake, 0);
  const expectedProfit = unsettled.reduce((s, b) => s + calcEVCurrency(b.bettingOdds, b.novigOdds, b.stake), 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <OddsStreamListener soundEnabled={soundEnabled} filters={notificationFilters} />

      <aside className="w-56 shrink-0 flex flex-col border-r border-border/40 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "linear-gradient(180deg, #0d0e14 0%, #0a0b0f 100%)" }}>

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border/30 hover:opacity-80 transition-opacity group">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold tracking-tight text-[15px] leading-tight">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-2 pt-4 pb-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                    ${active
                      ? "bg-primary/12 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mb-3 mt-1">
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        {/* Quick stats */}
        <div className="mx-3 mb-3 rounded-xl border border-border/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-border/20">
            <Zap className="w-3 h-3 text-primary/70" />
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Quick Stats</div>
          </div>
          <div className="px-3 py-2.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Events</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {summary ? summary.totalEvents : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Active configs</span>
              <span className="font-mono font-bold text-primary tabular-nums">{activeConfigCount}</span>
            </div>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="mx-3 mb-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
            aria-label={soundEnabled ? "Mute notifications" : "Unmute notifications"}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
              ${soundEnabled
                ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                : "bg-white/3 text-muted-foreground border border-border/20 hover:bg-white/6 hover:text-foreground"
              }`}
          >
            {soundEnabled
              ? <Volume2 className="w-3.5 h-3.5 shrink-0" />
              : <VolumeX className="w-3.5 h-3.5 shrink-0" />}
            <span className="text-xs font-mono">{soundEnabled ? "Sound: ON" : "Sound: OFF"}</span>
          </button>
        </div>

        {/* Bets section */}
        <div className="mx-3 mb-3 rounded-xl border border-border/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border/20">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Bets</div>
            <Link href="/bet-tracker">
              <span className="text-[10px] text-primary hover:text-primary/80 cursor-pointer transition-colors">View all →</span>
            </Link>
          </div>

          <div className="px-3 py-2.5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Unsettled</span>
              <span className="font-mono font-bold text-foreground tabular-nums">{unsettled.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Staked</span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                {sym}{totalStaked.toFixed(2)}
              </span>
            </div>

            {/* P/L — highlighted */}
            <div className="flex justify-between items-center text-xs pt-0.5">
              <span className="text-muted-foreground">P / L</span>
              <span className={`font-mono font-bold text-sm tabular-nums ${currentPL >= 0 ? "text-green-400" : "text-red-400"}`}
                style={{ textShadow: currentPL >= 0 ? "0 0 10px rgba(74,222,128,0.4)" : "0 0 10px rgba(248,113,113,0.4)" }}>
                {currentPL < 0 ? "-" : ""}{sym}{Math.abs(currentPL).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Exp. profit</span>
              <span className={`font-mono font-bold tabular-nums ${expectedProfit >= 0 ? "text-sky-400" : "text-red-400"}`}>
                {expectedProfit >= 0 ? "+" : ""}{sym}{Math.abs(expectedProfit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <MobileAppComingSoon />

        {/* Footer settings */}
        <div className="mt-auto border-t border-border/30">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-5 py-3.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all text-xs"
          >
            <Cog className="w-3.5 h-3.5 shrink-0" />
            Settings
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-6 overflow-y-auto">
        {children}
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
