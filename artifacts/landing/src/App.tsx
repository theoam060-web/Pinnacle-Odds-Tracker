import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, CartesianGrid
} from "recharts";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { LanguageProvider, useLang } from "./LanguageContext";
import { LANGUAGES, t } from "./i18n";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { ClerkProvider, Show, useClerk, useUser, useAuth } from "@clerk/react";
import { 
  Activity, Bell,
  LineChart as LineChartIcon, Radar,
  TrendingUp, ChevronRight, ChevronLeft, CheckCircle2,
  Database, TrendingDown, ClipboardList, BarChart2,
  Calculator, CalendarDays, Wallet
} from "lucide-react";
import {
  IconOddsDrop, IconBetTracker, IconBookmakerComparison, IconStake,
  IconCalendar, IconMultiSport, IconBankroll,
  OddsDropPage, BetTrackerPage, BookmakerComparisonPage, StakeCalculatorPage,
  DailyCalendarPage, MultiSportPage, BankrollPage,
} from "./FeaturePages";
import WhyPage from "./WhyPage";
import PricingPage from "./PricingPage";
import SuccessPage from "./SuccessPage";
import CancelPage from "./CancelPage";
import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";

import NotFound from "@/pages/not-found";
import GoogleIcon from "./components/GoogleIcon";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

// --- Mock Data ---

const LIVE_ODDS = [
  { id: 1, match: "LAL @ DEN", market: "Moneyline", old: "+145", new: "+120", drop: "17.2%", time: "0.8s ago", sharp: true },
  { id: 2, match: "MIA @ MIA", market: "Spread -4.5", old: "-110", new: "-125", drop: "13.6%", time: "1.2s ago", sharp: true },
  { id: 3, match: "ARS vs CHE", market: "Total O 2.5", old: "+105", new: "-115", drop: "19.0%", time: "2.4s ago", sharp: false },
  { id: 4, match: "NYY @ BOS", market: "Moneyline", old: "-130", new: "-150", drop: "15.3%", time: "3.1s ago", sharp: true },
  { id: 5, match: "DAL @ SF", market: "Total U 42.5", old: "-115", new: "-135", drop: "17.4%", time: "4.5s ago", sharp: false },
];

// ── Step illustrations ────────────────────────────────────────────────────────

function StepIlluMarkets() {
  const sports = [
    { icon: "⚽", name: "Soccer",      leagues: "100+ leagues", on: true  },
    { icon: "🏀", name: "Basketball", leagues: "NBA, EuroLeague", on: true  },
    { icon: "🏈", name: "Football",   leagues: "NFL",            on: false },
    { icon: "🎾", name: "Tennis",     leagues: "ATP, WTA",       on: true  },
    { icon: "🏒", name: "Hockey",     leagues: "NHL",            on: false },
    { icon: "⚾", name: "Baseball",   leagues: "MLB",            on: true  },
  ];
  const marketTypes = ["1X2", "Asian HDP", "Over/Under", "Moneyline", "Spread"];
  return (
    <svg viewBox="0 0 560 340" className="w-full" style={{ background: "#0c0c14" }}>
      {/* Left panel: sports */}
      <rect x="12" y="12" width="248" height="316" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <rect x="12" y="12" width="248" height="34" rx="10" fill="#13131c"/>
      <text x="28" y="33" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace" fontWeight="bold">SPORTS</text>
      {sports.map((s, i) => {
        const y = 60 + i * 43;
        return (
          <g key={i}>
            <rect x="22" y={y - 10} width="228" height="36" rx="6"
              fill={s.on ? "rgba(0,255,255,0.04)" : "transparent"}
              stroke={s.on ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)"} strokeWidth="0.8"/>
            <text x="38" y={y + 8} fontSize="15">{s.icon}</text>
            <text x="58" y={y + 7} fontSize="10" fill={s.on ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)"} fontFamily="sans-serif">{s.name}</text>
            <text x="58" y={y + 20} fontSize="8" fill={s.on ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)"} fontFamily="monospace">{s.leagues}</text>
            <rect x="214" y={y} width="26" height="14" rx="7"
              fill={s.on ? "hsl(186,100%,50%)" : "rgba(255,255,255,0.12)"}/>
            <circle cx={s.on ? 233 : 221} cy={y + 7} r="5" fill="white"/>
          </g>
        );
      })}

      {/* Right panel: market types */}
      <rect x="272" y="12" width="276" height="316" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <rect x="272" y="12" width="276" height="34" rx="10" fill="#13131c"/>
      <text x="288" y="33" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace" fontWeight="bold">BET TYPES</text>
      {marketTypes.map((m, i) => {
        const y = 62 + i * 38;
        const on = i !== 2;
        return (
          <g key={i}>
            <rect x="282" y={y - 6} width="256" height="28" rx="5"
              fill={on ? "rgba(0,255,255,0.04)" : "transparent"}
              stroke={on ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.04)"} strokeWidth="0.8"/>
            <rect x="290" y={y - 1} width="14" height="14" rx="3"
              fill={on ? "hsl(186,100%,50%)" : "rgba(255,255,255,0.08)"}/>
            {on && <text x="297" y={y + 10} fontSize="9" fill="#000" textAnchor="middle" fontFamily="monospace" fontWeight="bold">✓</text>}
            <text x="312" y={y + 10} fontSize="10" fill={on ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)"} fontFamily="sans-serif">{m}</text>
          </g>
        );
      })}
      <rect x="282" y="278" width="256" height="36" rx="6" fill="rgba(0,255,255,0.06)" stroke="rgba(0,255,255,0.2)" strokeWidth="1"/>
      <text x="410" y="292" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">MATCHING MARKETS</text>
      <text x="410" y="308" fontSize="13" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">14 382 events filtered in</text>
    </svg>
  );
}

function StepIlluMinDrop() {
  const drops = [
    { pct: 3,  pass: false },
    { pct: 6,  pass: false },
    { pct: 10, pass: true  },
    { pct: 4,  pass: false },
    { pct: 13, pass: true  },
  ];
  const minDrop  = 7;
  const barMax   = 15;
  const baseline = 300;
  const chartH   = 165;
  const threshY  = Math.round(baseline - (minDrop / barMax) * chartH);
  const barW     = 72;
  const slotW    = 102;
  const startX   = 30;
  const cyan     = "hsl(186,100%,50%)";
  const sliderX  = 24;
  const sliderW  = 450;
  const knobX    = Math.round(sliderX + (minDrop / 20) * sliderW);
  return (
    <svg viewBox="0 0 560 360" className="w-full" style={{ background: "#0c0c14" }}>
      <text x="24" y="68" fontSize="11" fill="rgba(255,255,255,0.45)" fontFamily="monospace">Minimum drop to trigger alert</text>
      <rect x={sliderX} y="80" width={sliderW} height="10" rx="5" fill="rgba(255,255,255,0.07)"/>
      <rect x={sliderX} y="80" width={knobX - sliderX} height="10" rx="5" fill={cyan} opacity="0.9"/>
      <circle cx={knobX} cy="85" r="14" fill={cyan} stroke="#111118" strokeWidth="3"/>
      <rect x="488" y="72" width="58" height="28" rx="6" fill="rgba(0,255,255,0.12)" stroke="rgba(0,255,255,0.35)" strokeWidth="1"/>
      <text x="517" y="91" fontSize="17" fill={cyan} fontFamily="monospace" fontWeight="bold" textAnchor="middle">7%</text>
      <text x={sliderX} y="107" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace">0%</text>
      <text x={sliderX + sliderW - 16} y="107" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace">20%</text>
      <line x1="16" y1={threshY} x2="546" y2={threshY} stroke={cyan} strokeWidth="2" strokeDasharray="8,5" opacity="0.7"/>
      <text x="540" y={threshY - 6} fontSize="10" fill={cyan} fontFamily="monospace" fontWeight="bold" textAnchor="end">← min. drop: 7%</text>
      {drops.map((d, i) => {
        const barH = Math.round((d.pct / barMax) * chartH);
        const x    = startX + i * slotW;
        const yTop = baseline - barH;
        return (
          <g key={i}>
            <rect x={x} y={yTop} width={barW} height={barH} rx="6" fill={d.pass ? "rgba(0,255,255,0.2)"  : "rgba(255,255,255,0.07)"} stroke={d.pass ? "rgba(0,255,255,0.6)" : "rgba(255,255,255,0.12)"} strokeWidth="1.5"/>
            <text x={x + barW / 2} y={baseline + 18} fontSize="11" fill={d.pass ? cyan : "rgba(255,255,255,0.3)"} textAnchor="middle" fontFamily="monospace" fontWeight={d.pass ? "bold" : "normal"}>−{d.pct}%</text>
            {d.pass && <>
              <rect x={x - 4} y={yTop - 28} width={barW + 8} height="22" rx="5" fill="rgba(0,255,255,0.15)" stroke="rgba(0,255,255,0.4)" strokeWidth="1"/>
              <text x={x + barW / 2} y={yTop - 12} fontSize="10" fill={cyan} textAnchor="middle" fontFamily="monospace" fontWeight="bold">ALERT ✓</text>
            </>}
          </g>
        );
      })}
      <text x="280" y="338" fontSize="10" fill="rgba(255,255,255,0.22)" fontFamily="monospace" textAnchor="middle">Drops below the line are ignored. Drops above it trigger an alert.</text>
    </svg>
  );
}

function StepIlluMonitor() {
  const zones = [
    { city: "London",   tz: "GMT+1", local: "14:32", events: 1842 },
    { city: "New York", tz: "GMT−4", local: "09:32", events: 934  },
    { city: "Tokyo",    tz: "GMT+9", local: "22:32", events: 612  },
  ];
  const cyan = "hsl(186,100%,50%)";
  const cardW = 168;
  const cardH = 200;
  const gap   = 14;
  return (
    <svg viewBox="0 0 560 300" className="w-full" style={{ background: "#0c0c14" }}>
      {zones.map((z, i) => {
        const x = 14 + i * (cardW + gap);
        return (
          <g key={i}>
            <rect x={x} y="14" width={cardW} height={cardH} rx="10" fill="#111118" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            <circle cx={x + 18} cy="44" r="7" fill="#22c55e"/>
            <text x={x + 34} y="49" fontSize="15" fill="white" fontFamily="sans-serif" fontWeight="bold">{z.city}</text>
            <text x={x + 16} y="70" fontSize="11" fill="rgba(255,255,255,0.28)" fontFamily="monospace">{z.tz}</text>
            <text x={x + 14} y="128" fontSize="40" fill={cyan} fontFamily="monospace" fontWeight="bold">{z.local}</text>
            <line x1={x + 14} y1="142" x2={x + cardW - 14} y2="142" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
            <text x={x + 14} y="164" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="monospace">Active events</text>
            <text x={x + 14} y="188" fontSize="22" fill="rgba(255,255,255,0.65)" fontFamily="monospace" fontWeight="bold">{z.events.toLocaleString()}</text>
          </g>
        );
      })}
      <rect x="14" y="228" width="532" height="56" rx="8" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <circle cx="36" cy="256" r="7" fill="#22c55e"/>
      <text x="54" y="250" fontSize="13" fill="white" fontFamily="monospace" fontWeight="bold">Monitoring non-stop</text>
      <text x="54" y="268" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="monospace">Price check every 2 seconds · All sports · Every time zone</text>
    </svg>
  );
}

function StepIlluAlert() {
  const cyan = "hsl(186,100%,50%)";
  return (
    <svg viewBox="0 0 560 300" className="w-full" style={{ background: "#0c0c14" }}>
      <rect x="20" y="18" width="520" height="170" rx="10" fill="#17171f" stroke="rgba(0,255,255,0.22)" strokeWidth="1.5"/>
      <rect x="20" y="18" width="520" height="5" rx="10" fill={cyan} opacity="0.8"/>
      <text x="40" y="50" fontSize="13" fill={cyan} fontFamily="monospace" fontWeight="bold">⚡  SHARP ODDS DROP</text>
      <text x="40" y="68" fontSize="13" fill="rgba(255,255,255,0.5)" fontFamily="monospace">MAN CITY vs ARSENAL</text>
      <text x="40" y="106" fontSize="26" fill="white" fontFamily="monospace" fontWeight="bold">2.10  →  1.84</text>
      <rect x="350" y="86" width="90" height="30" rx="6" fill="rgba(0,255,255,0.12)" stroke="rgba(0,255,255,0.35)" strokeWidth="1"/>
      <text x="395" y="106" fontSize="16" fill={cyan} textAnchor="middle" fontFamily="monospace" fontWeight="bold">−12.4%</text>
      <text x="40" y="130" fontSize="11" fill="rgba(255,255,255,0.38)" fontFamily="monospace">Premier League  ·  Sharp move  ·  Kickoff in 2h 14m</text>
      <rect x="40" y="148" width="110" height="28" rx="6" fill={cyan}/>
      <text x="95" y="166" fontSize="12" fill="#000" textAnchor="middle" fontFamily="monospace" fontWeight="bold">BET NOW →</text>
      <rect x="164" y="148" width="110" height="28" rx="6" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <text x="219" y="166" fontSize="12" fill="rgba(255,255,255,0.45)" textAnchor="middle" fontFamily="monospace">+ LOG BET</text>
      <rect x="20" y="204" width="248" height="78" rx="10" fill="rgba(74,222,128,0.07)" stroke="rgba(74,222,128,0.3)" strokeWidth="1.5"/>
      <circle cx="46" cy="230" r="8" fill="#4ade80"/>
      <text x="64" y="235" fontSize="13" fill="white" fontFamily="monospace" fontWeight="bold">You</text>
      <text x="36" y="262" fontSize="28" fill="#4ade80" fontFamily="monospace" fontWeight="bold">&lt; 1s</text>
      <text x="36" y="278" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="monospace">from line move to your phone</text>
      <rect x="292" y="204" width="248" height="78" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <circle cx="318" cy="230" r="8" fill="rgba(255,255,255,0.25)"/>
      <text x="336" y="235" fontSize="13" fill="rgba(255,255,255,0.4)" fontFamily="monospace" fontWeight="bold">Everyone else</text>
      <text x="308" y="262" fontSize="28" fill="rgba(255,255,255,0.35)" fontFamily="monospace" fontWeight="bold">30–90s</text>
      <text x="308" y="278" fontSize="10" fill="rgba(255,255,255,0.2)" fontFamily="monospace">until rec books catch up</text>
    </svg>
  );
}

const STEPS = [
  {
    visual: StepIlluMarkets,
    title: "Pick Your Markets",
    description: "Choose the sports and leagues you follow. Only what you pick gets through — nothing else."
  },
  {
    visual: StepIlluMinDrop,
    title: "Set Your Minimum Drop",
    description: "Choose how big a price drop must be before you get an alert. Small moves are ignored. You only hear about the ones that matter."
  },
  {
    visual: StepIlluMonitor,
    title: "We Watch 24/7",
    description: "SharpTracker tracks every market all day and night. The second a line drops, we catch it — no matter when it happens."
  },
  {
    visual: StepIlluAlert,
    title: "You Hear About It First",
    description: "You get the alert before anyone else. That time gap is your advantage."
  }
];

const GlitchText = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -translate-x-[2px] translate-y-[1px] text-primary opacity-50 z-0 blur-[1px]">{text}</span>
      <span className="absolute top-0 left-0 translate-x-[2px] -translate-y-[1px] text-destructive opacity-50 z-0 blur-[1px]">{text}</span>
    </span>
  );
};

const FEATURE_ITEMS = [
  {
    route: "odds-drops",
    Icon: IconOddsDrop,
    name: "Odds Drop Alerts",
    desc: "Instant push notification when sharp money moves",
  },
  {
    route: "bet-tracker",
    Icon: IconBetTracker,
    name: "Bet Tracker",
    desc: "Log every bet and track every unit you've ever placed",
  },
  {
    route: "bookmaker-comparison",
    Icon: IconBookmakerComparison,
    name: "Bookmaker Comparison",
    desc: "Compare live odds across 32+ bookmakers per alert",
  },
  {
    route: "stake-calculator",
    Icon: IconStake,
    name: "Stake Calculator",
    desc: "Size bets correctly with Kelly criterion built in",
  },
  {
    route: "daily-calendar",
    Icon: IconCalendar,
    name: "Daily P&L Calendar",
    desc: "Visual win/loss calendar — spot patterns instantly",
  },
  {
    route: "multi-sport",
    Icon: IconMultiSport,
    name: "Multi-Sport Coverage",
    desc: "NFL, NBA, MLB, NHL, Soccer, Tennis and more",
  },
  {
    route: "bankroll",
    Icon: IconBankroll,
    name: "Bankroll Growth",
    desc: "Catch value before anyone else and watch your edge compound",
  },
];

function SubscriptionButton({ closePanel, className, children }: { closePanel: () => void; className?: string; children: React.ReactNode }) {
  const handleClick = () => {
    closePanel();
    window.location.href = "/pricing";
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}

function NavUserMenu({ closePanel, hasAccess }: { closePanel: () => void; hasAccess: boolean }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isLoaded || !user) return null;

  const initials = (user.firstName?.[0] ?? user.emailAddresses?.[0]?.emailAddress?.[0] ?? "U").toUpperCase();
  const displayName = user.firstName ?? user.emailAddresses?.[0]?.emailAddress ?? "Account";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-mono text-foreground hover:text-primary transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">
          {initials}
        </div>
        <span className="hidden md:block max-w-[120px] truncate">{displayName}</span>
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-1 z-50">
          <div className="px-4 py-2 border-b border-border/40">
            <p className="text-xs font-mono text-muted-foreground truncate">{user.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          {hasAccess && (
            <button
              onClick={() => { window.location.href = "/app/"; }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-mono text-primary hover:bg-primary/5 transition-colors"
            >
              Go to Live Feed →
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              window.location.href = "/pricing";
            }}
            className="w-full text-left px-4 py-2 text-sm font-mono text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            Pricing
          </button>
          <div className="border-t border-border/40 my-1" />
          <button
            onClick={() => {
              setOpen(false);
              closePanel();
              signOut();
            }}
            className="w-full text-left px-4 py-2 text-sm font-mono text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function LangDropdown() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
        aria-label="Select language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-background/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] z-50 py-1 overflow-hidden">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-mono transition-colors ${
                l.code === lang
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 shrink-0">{l.flag}</span>
              <span className="flex-1 text-left">{l.name}</span>
              <span className="text-[10px] text-muted-foreground/60">{l.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LandingContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const isSignedIn = false;
  const hasAccess = false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-xl">SharpTracker</a>
        </div>
      </header>
      <main className="container mx-auto px-6 py-16">
        <section className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold">SharpTracker</h1>
          <p className="text-muted-foreground">Dark themed sports odds tracker for sharp bettors.</p>
        </section>
      </main>
      <footer className="border-t border-border/20 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-sans font-bold mb-4 text-foreground">Navigate</h4>
              <ul className="space-y-2 font-mono text-sm text-muted-foreground">
                <li><Link href="/why" className="hover:text-primary">Why SharpTracker?</Link></li>
                {isSignedIn
                  ? <li><a href="/app/" className="hover:text-primary">Dashboard</a></li>
                  : <li><a href="/app/" className="hover:text-primary">Sign Up</a></li>
                }
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-bold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 font-mono text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><a href="mailto:info@sharptracker.io" className="hover:text-primary">info@sharptracker.io</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <LandingContent />;
}
