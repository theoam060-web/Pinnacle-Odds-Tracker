import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, TrendingDown, BookMarked, BellRing, Volume2, VolumeX, Settings, LayoutDashboard, Cog } from "lucide-react";
import { useAlertStore } from "@/lib/alert-context";
import { useGetOddsSummary, getGetOddsSummaryQueryKey } from "@workspace/api-client-react";
import { SettingsModal } from "@/components/settings-modal";

const NAV_ITEMS = [
  { href: "/", label: "Live Feed", icon: TrendingDown },
  { href: "/bet-tracker", label: "Bet Tracker", icon: BookMarked },
  { href: "/alert-configurations", label: "Alert Configurations", icon: BellRing },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { configs, soundEnabled, setSoundEnabled } = useAlertStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const activeConfigCount = configs.filter(c => c.enabled).length;

  const { data: summary } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 15000 }
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-52 shrink-0 flex flex-col border-r border-border/60 bg-card/60 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border/40">
          <Activity className="h-5 w-5 text-primary shrink-0" />
          <span className="font-bold tracking-tight text-sm leading-tight">
            Pinnacle<span className="text-primary">Tracker</span>
          </span>
        </div>

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

        {/* Shortcuts */}
        <div className="mx-3 mb-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-2">Shortcuts</div>
          <Link href="/alert-configurations">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <Settings className="w-3.5 h-3.5 shrink-0" />
              Alert settings
            </div>
          </Link>
          <Link href="/bet-tracker">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
              My bets
            </div>
          </Link>
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
