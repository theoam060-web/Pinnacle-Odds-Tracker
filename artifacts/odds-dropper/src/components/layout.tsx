import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Activity, TrendingDown, BookMarked, BellRing, Volume2, VolumeX, Cog, BarChart2 } from "lucide-react";
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

// OddsStreamListener subscribes to SSE and plays a chime when sound is enabled.
// Toasts/popups are intentionally removed — only audio notification fires.
function OddsStreamListener({
  soundEnabled,
  filters,
}: {
  soundEnabled: boolean;
  filters?: OddsStreamFilters;
}) {
  const handleDrop = useCallback(
    (_drop: OddsDropEvent) => {
      // Only play sound — no popup toast notifications
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

export function Layout({ children, notificationFilters }: LayoutProps) {
  const [location] = useLocation();
  const { configs, soundEnabled, setSoundEnabled } = useAlertStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeConfigCount = configs.filter(c => c.enabled).length;

  const { data: summary } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 15000 }
  });

  // Bet stats for sidebar Bets section
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

      <aside className="w-52 shrink-0 flex flex-col border-r border-border/60 bg-card/60 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 px-4 py-5 border-b border-border/40 hover:opacity-80 transition-opacity">
          <Activity className="h-5 w-5 text-primary shrink-0" />
          <span className="font-bold tracking-tight text-sm leading-tight">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </a>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer
                    ${active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick stats */}
        <div className="mx-3 mb-3 border border-border/40 rounded-md px-3 py-2.5 bg-background/40 space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quick Stats</div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Events</span>
            <span className="font-mono font-bold text-foreground">
              {summary ? summary.totalEvents : "—"}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Active configs</span>
            <span className="font-mono font-bold text-primary">{activeConfigCount}</span>
          </div>
        </div>

        {/* Sound toggle */}
        <div className="mx-3 mb-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
            aria-label={soundEnabled ? "Mute notifications" : "Unmute notifications"}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
              ${soundEnabled
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
            <span className="text-xs">{soundEnabled ? "Sound: ON" : "Sound: OFF"}</span>
          </button>
        </div>

        {/* Bets section — live summary of all tracked bets */}
        <div className="mx-3 mb-3 border border-border/40 rounded-md px-3 py-2.5 bg-background/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Bets</div>
            <Link href="/bet-tracker">
              <span className="text-[10px] text-primary hover:underline cursor-pointer">View all →</span>
            </Link>
          </div>

          {/* Unsettled (pending) bets */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Unsettled</span>
            <span className="font-mono font-bold text-foreground">{unsettled.length}</span>
          </div>

          {/* Total staked on unsettled bets */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Staked</span>
            <span className="font-mono font-bold text-foreground">
              {sym}{totalStaked.toFixed(2)}
            </span>
          </div>

          {/* Current settled P/L */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">P / L</span>
            <span className={`font-mono font-bold ${currentPL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {currentPL >= 0 ? "+" : ""}{sym}{Math.abs(currentPL).toFixed(2)}
            </span>
          </div>

          {/* Expected profit (EV) on unsettled bets */}
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Exp. profit</span>
            <span className={`font-mono font-bold ${expectedProfit >= 0 ? "text-sky-400" : "text-red-400"}`}>
              {expectedProfit >= 0 ? "+" : ""}{sym}{Math.abs(expectedProfit).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer: gear settings button */}
        <div className="mt-auto border-t border-border/40">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-3 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors text-xs"
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
