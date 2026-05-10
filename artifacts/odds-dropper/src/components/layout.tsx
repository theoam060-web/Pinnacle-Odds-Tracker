import { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Activity, TrendingDown, BookMarked, BellRing, Volume2, VolumeX, Cog, BarChart2, Zap, X, Lock, User, Menu } from "lucide-react";
import { useAlertStore } from "@/lib/alert-context";
import { useGetOddsSummary, getGetOddsSummaryQueryKey } from "@workspace/api-client-react";
import { SettingsModal } from "@/components/settings-modal";
import { useOddsStream, type OddsDropEvent, type OddsStreamFilters } from "@/hooks/use-odds-stream";
import { useBetStore, getCurrencySymbol, calcEVCurrency } from "@/lib/bet-store";
import { playChime } from "@/lib/chime";
import { usePlan } from "@/lib/plan-context";
import { useLang } from "@/lib/lang-context";
import { tApp } from "@/lib/i18n";
import { MobileInstallGuide } from "@/components/MobileInstallGuide";

type NavItem = { href: string; labelKey: keyof ReturnType<typeof tApp>["nav"]; icon: React.ElementType; goldPlus?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "liveFeed", icon: TrendingDown },
  { href: "/bet-tracker", labelKey: "betTracker", icon: BookMarked, goldPlus: true },
  { href: "/bet-stats", labelKey: "betStats", icon: BarChart2, goldPlus: true },
  { href: "/alert-configurations", labelKey: "alertConfigurations", icon: BellRing },
  { href: "/account", labelKey: "account", icon: User },
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

function InstallPWABadge() {
  const { lang } = useLang();
  const tr = tApp(lang);
  return (
    <div className="mx-3 mb-3">
      <div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono bg-cyan-400/[0.06] border border-cyan-400/20 text-cyan-300/70">
        <span className="relative flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 block animate-pulse" />
        </span>
        <span>{tr.sidebar.installHint}</span>
      </div>
    </div>
  );
}

export function Layout({ children, notificationFilters }: LayoutProps) {
  const [location] = useLocation();
  const { configs, soundEnabled, setSoundEnabled } = useAlertStore();
  const tier = usePlan();
  const { lang } = useLang();
  const tr = tApp(lang);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeConfigCount = configs.filter(c => c.enabled).length;

  const { data: summary } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 60000 }
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const NavContent = (
    <>
      <a href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border/30 hover:opacity-80 transition-opacity group">
        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <span className="font-bold tracking-tight text-[15px] leading-tight">
          Sharp<span className="text-primary">Tracker</span>
        </span>
      </a>

      <nav className="flex flex-col gap-0.5 px-2 pt-2 pb-2">
        {NAV_ITEMS.map(({ href, labelKey, icon: Icon, goldPlus }) => {
          const active = location === href;
          const locked = goldPlus && tier === "silver";
          const inner = (
            <div
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
                ${active
                  ? "bg-primary/12 text-primary font-semibold"
                  : locked
                    ? "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/3"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary shadow-[0_0_8px_rgba(0,229,255,0.6)]" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="flex-1">{tr.nav[labelKey]}</span>
              {locked && <Lock className="w-3 h-3 shrink-0 text-muted-foreground/40" />}
            </div>
          );
          return (
            <Link key={href} href={href}>
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mb-3 mt-1">
        <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>

      <div className="mx-3 mb-3 rounded-xl border border-border/30 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(0,0,0,0) 100%)" }}>
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-border/20">
          <Zap className="w-3 h-3 text-primary/70" />
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{tr.sidebar.quickStats}</div>
        </div>
        <div className="px-3 py-2.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{tr.sidebar.events}</span>
            <span className="font-mono font-bold text-foreground tabular-nums">
              {summary ? summary.totalEvents : "—"}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{tr.sidebar.activeConfigs}</span>
            <span className="font-mono font-bold text-primary tabular-nums">{activeConfigCount}</span>
          </div>
        </div>
      </div>

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
          <span className="text-xs font-mono">{soundEnabled ? tr.sidebar.soundOn : tr.sidebar.soundOff}</span>
        </button>
      </div>

      <div className="mx-3 mb-3 rounded-xl border border-border/30 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(0,0,0,0) 100%)" }}>
        <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-border/20">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{tr.sidebar.bets}</div>
          <Link href="/bet-tracker">
            <span className="text-[10px] text-primary hover:text-primary/80 cursor-pointer transition-colors">{tr.sidebar.viewAll}</span>
          </Link>
        </div>
        <div className="px-3 py-2.5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{tr.sidebar.unsettled}</span>
            <span className="font-mono font-bold text-foreground tabular-nums">{unsettled.length}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{tr.sidebar.staked}</span>
            <span className="font-mono font-bold text-foreground tabular-nums">
              {sym}{totalStaked.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-0.5">
            <span className="text-muted-foreground">{tr.sidebar.pl}</span>
            <span className={`font-mono font-bold text-sm tabular-nums ${currentPL >= 0 ? "text-green-400" : "text-red-400"}`}
              style={{ textShadow: currentPL >= 0 ? "0 0 10px rgba(74,222,128,0.4)" : "0 0 10px rgba(248,113,113,0.4)" }}>
              {currentPL < 0 ? "-" : ""}{sym}{Math.abs(currentPL).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{tr.sidebar.expProfit}</span>
            <span className={`font-mono font-bold tabular-nums ${expectedProfit >= 0 ? "text-sky-400" : "text-red-400"}`}>
              {expectedProfit >= 0 ? "+" : ""}{sym}{Math.abs(expectedProfit).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-border/30">
        <a
          href="https://t.me/+i23SOkc0K9k2YWFk"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-5 py-3.5 text-primary hover:text-primary-foreground hover:bg-primary/90 transition-all text-xs border border-primary/30 bg-primary/10"
        >
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.957l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.978.602z" />
          </svg>
          Join Telegram group
        </a>
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-2.5 px-5 py-3.5 text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all text-xs"
        >
          <Cog className="w-3.5 h-3.5 shrink-0" />
          {tr.nav.settings}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <OddsStreamListener soundEnabled={soundEnabled} filters={notificationFilters} />

      <aside className="hidden md:flex md:w-56 shrink-0 flex-col border-r border-border/40 sticky top-0 h-screen overflow-y-auto"
        style={{ background: "linear-gradient(180deg, #0d0e14 0%, #0a0b0f 100%)" }}>
        {NavContent}
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <a href="/" className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm tracking-tight">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </a>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 bg-white/5 text-foreground"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-xs flex flex-col border-r border-border/40 overflow-y-auto bg-[#0d0e14] shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <a href="/" className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-primary" />
                <span className="font-bold tracking-tight text-[15px] leading-tight">
                  Sharp<span className="text-primary">Tracker</span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-white/5 text-foreground"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-2 pb-4">{NavContent}</div>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 p-3 pt-16 md:pt-6 md:p-6 overflow-y-auto">
        {children}
      </main>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <MobileInstallGuide />
    </div>
  );
}
