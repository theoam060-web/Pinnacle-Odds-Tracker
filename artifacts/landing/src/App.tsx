import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, CartesianGrid
} from "recharts";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { 
  Activity, Bell,
  LineChart as LineChartIcon, Radar,
  TrendingUp, ChevronRight, CheckCircle2,
  Database, TrendingDown, ClipboardList,
  Calculator, CalendarDays, Wallet, Target
} from "lucide-react";
import {
  IconOddsDrop, IconBetTracker, IconCLV, IconStake,
  IconCalendar, IconMultiSport, IconBankroll,
  OddsDropPage, BetTrackerPage, CLVPage, StakeCalculatorPage,
  DailyCalendarPage, MultiSportPage, BankrollPage,
} from "./FeaturePages";
import WhyPage from "./WhyPage";
import PricingPage from "./PricingPage";
import SignUpPage from "./SignUpPage";
import TermsPage from "./TermsPage";
import PrivacyPage from "./PrivacyPage";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

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
            {/* Toggle */}
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
      {/* Counter at bottom */}
      <rect x="282" y="278" width="256" height="36" rx="6" fill="rgba(0,255,255,0.06)" stroke="rgba(0,255,255,0.2)" strokeWidth="1"/>
      <text x="410" y="292" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">MATCHING MARKETS</text>
      <text x="410" y="308" fontSize="13" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">14 382 events filtered in</text>
    </svg>
  );
}

function StepIlluMinDrop() {
  const drops = [
    { pct: 2.1,  pass: false },
    { pct: 4.8,  pass: false },
    { pct: 8.3,  pass: true  },
    { pct: 1.5,  pass: false },
    { pct: 11.2, pass: true  },
    { pct: 3.0,  pass: false },
    { pct: 9.7,  pass: true  },
    { pct: 0.8,  pass: false },
    { pct: 6.2,  pass: false },
    { pct: 13.5, pass: true  },
  ];
  const minDrop   = 7;   // %
  const barMax    = 16;  // % — tallest possible bar
  const baseline  = 275; // y of the chart floor
  const chartH    = 140; // px from floor to top
  const threshY   = baseline - (minDrop / barMax) * chartH; // 214
  const barW      = 36;
  const slotW     = 55;
  const startX    = 38;
  const cyan      = "hsl(186,100%,50%)";
  const cyanDim   = "rgba(0,255,255,0.22)";
  const cyanStroke= "rgba(0,255,255,0.55)";
  const gray      = "rgba(255,255,255,0.08)";
  const grayStroke= "rgba(255,255,255,0.13)";
  // Slider: 0–20%, knob at 7%
  const sliderX   = 30;
  const sliderW   = 490;
  const knobX     = sliderX + (minDrop / 20) * sliderW; // 201.5
  return (
    <svg viewBox="0 0 620 370" className="w-full" style={{ background: "#0c0c14" }}>
      {/* Window card */}
      <rect x="10" y="10" width="600" height="350" rx="12" fill="#111118" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {/* Title bar */}
      <rect x="10" y="10" width="600" height="36" rx="12" fill="#151520"/>
      <rect x="10" y="34"  width="600" height="12" fill="#151520"/>
      <circle cx="30" cy="28" r="6" fill="#ef4444" opacity="0.8"/>
      <circle cx="48" cy="28" r="6" fill="#eab308" opacity="0.8"/>
      <circle cx="66" cy="28" r="6" fill="#22c55e" opacity="0.8"/>
      <text x="86" y="32" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="monospace">SharpTracker — Set Your Bar</text>

      {/* Section heading */}
      <text x="30" y="72" fontSize="13" fill="white" fontFamily="monospace" fontWeight="bold" letterSpacing="0.5">MINIMUM DROP — SET YOUR BAR</text>

      {/* Slider label */}
      <text x="30" y="96" fontSize="9.5" fill="rgba(255,255,255,0.35)" fontFamily="monospace">Minimum line drop to trigger alert</text>

      {/* Slider track */}
      <rect x={sliderX} y="106" width={sliderW} height="7" rx="3.5" fill="rgba(255,255,255,0.08)"/>
      {/* Slider fill */}
      <rect x={sliderX} y="106" width={knobX - sliderX} height="7" rx="3.5" fill={cyan} opacity="0.85"/>
      {/* Slider knob */}
      <circle cx={knobX} cy="109.5" r="11" fill={cyan} stroke="#0c0c14" strokeWidth="2.5"/>
      {/* Slider value */}
      <text x="536" y="114" fontSize="15" fill={cyan} fontFamily="monospace" fontWeight="bold">7%</text>
      {/* Slider range labels */}
      <text x={sliderX} y="130" fontSize="8.5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">0%</text>
      <text x={sliderX + sliderW - 20} y="130" fontSize="8.5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">20%</text>

      {/* Min-drop dashed line */}
      <line x1="18" y1={threshY} x2="602" y2={threshY}
        stroke={cyan} strokeWidth="1.5" strokeDasharray="7,4" opacity="0.65"/>
      <text x="18" y={threshY - 5} fontSize="8.5" fill={cyan} fontFamily="monospace" fontWeight="bold">min. drop: −7%</text>

      {/* Bars */}
      {drops.map((d, i) => {
        const barH = (d.pct / barMax) * chartH;
        const x    = startX + i * slotW;
        const yTop = baseline - barH;
        return (
          <g key={i}>
            <rect x={x} y={yTop} width={barW} height={barH} rx="4"
              fill={d.pass ? cyanDim  : gray}
              stroke={d.pass ? cyanStroke : grayStroke}
              strokeWidth="1"/>
            <text x={x + barW / 2} y={baseline + 14} fontSize="7.5"
              fill={d.pass ? cyan : "rgba(255,255,255,0.28)"}
              textAnchor="middle" fontFamily="monospace" fontWeight={d.pass ? "bold" : "normal"}>
              −{d.pct}%
            </text>
            {/* Bell icon above passing bars */}
            {d.pass && (
              <text x={x + barW / 2} y={yTop - 7} fontSize="12"
                textAnchor="middle" fontFamily="monospace">🔔</text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <rect x="18"  y="307" width="156" height="24" rx="5" fill="rgba(255,255,255,0.05)"/>
      <text x="96"  y="323" fontSize="8.5" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace">filtered out (below bar)</text>

      <rect x="184" y="307" width="130" height="24" rx="5"
        fill="rgba(0,255,255,0.07)" stroke="rgba(0,255,255,0.25)" strokeWidth="1"/>
      <text x="249" y="323" fontSize="8.5" fill={cyan} textAnchor="middle" fontFamily="monospace" fontWeight="bold">alert triggered ✓</text>

      <text x="330" y="323" fontSize="8.5" fill="rgba(255,255,255,0.2)" fontFamily="monospace">— 4 alerts from 10 moves</text>
    </svg>
  );
}

function StepIlluMonitor() {
  const zones = [
    { city: "London",   tz: "GMT+1",  local: "14:32", events: 1842 },
    { city: "New York", tz: "GMT−4",  local: "09:32", events: 934  },
    { city: "Tokyo",    tz: "GMT+9",  local: "22:32", events: 612  },
    { city: "Sydney",   tz: "GMT+10", local: "23:32", events: 287  },
  ];
  const hours = Array.from({length: 24}, (_, i) => i);
  return (
    <svg viewBox="0 0 560 340" className="w-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="536" height="316" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <rect x="12" y="12" width="536" height="34" rx="10" fill="#13131c"/>
      <circle cx="28" cy="29" r="5" fill="#22c55e"/>
      <text x="40" y="33" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace" fontWeight="bold">24/7 LIVE MONITORING</text>
      <text x="490" y="33" fontSize="9" fill="hsl(186,100%,50%)" fontFamily="monospace" fontWeight="bold" textAnchor="end">RUNNING</text>

      {/* 24h bar */}
      <text x="28" y="62" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="monospace">ACTIVITY — LAST 24 HOURS</text>
      {hours.map(h => {
        const x = 28 + h * 20.5;
        const active = h >= 7 && h <= 23;
        const intensity = h >= 12 && h <= 22 ? 0.8 : h >= 7 ? 0.4 : 0.15;
        return (
          <rect key={h} x={x} y="70" width="18" height="30" rx="2"
            fill={active ? `hsl(186,100%,50%)` : "rgba(255,255,255,0.05)"}
            opacity={intensity}/>
        );
      })}
      <text x="28" y="115" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">00:00</text>
      <text x="232" y="115" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace">12:00</text>
      <text x="510" y="115" fontSize="7" fill="rgba(255,255,255,0.2)" fontFamily="monospace" textAnchor="end">24:00</text>

      {/* World clocks */}
      <text x="28" y="138" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="monospace">GLOBAL COVERAGE</text>
      {zones.map((z, i) => {
        const x = 28 + i * 130;
        return (
          <g key={i}>
            <rect x={x} y="145" width="120" height="68" rx="6" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>
            <circle cx={x+12} cy="161" r="5" fill="#22c55e" opacity="0.8"/>
            <text x={x+24} y="165" fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">{z.city}</text>
            <text x={x+10} y="180" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="monospace">{z.tz}</text>
            <text x={x+10} y="198" fontSize="16" fill="hsl(186,100%,60%)" fontFamily="monospace" fontWeight="bold">{z.local}</text>
            <text x={x+10} y="208" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{z.events.toLocaleString()} events</text>
          </g>
        );
      })}

      {/* Rolling event ticker */}
      <rect x="28" y="228" width="508" height="86" rx="6" fill="rgba(0,255,255,0.03)" stroke="rgba(0,255,255,0.12)" strokeWidth="1"/>
      <text x="40" y="246" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="monospace">RECENT POLLS</text>
      {[
        ["13:34:09","Soccer","15 168 matchups checked","49 803 markets"],
        ["13:34:08","Tennis","182 matchups checked","2 021 markets"],
        ["13:34:07","Basketball","369 matchups checked","3 685 markets"],
        ["13:34:05","Hockey","343 matchups checked","1 416 markets"],
      ].map(([t,s,m,k], i) => (
        <g key={i}>
          <text x="40" y={260 + i * 14} fontSize="8" fill="rgba(255,255,255,0.2)" fontFamily="monospace">{t}</text>
          <text x="100" y={260 + i * 14} fontSize="8" fill="hsl(186,100%,55%)" fontFamily="monospace">{s}</text>
          <text x="180" y={260 + i * 14} fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="monospace">{m} — {k}</text>
        </g>
      ))}
    </svg>
  );
}

function StepIlluAlert() {
  return (
    <svg viewBox="0 0 560 340" className="w-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="536" height="316" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Timeline header */}
      <rect x="12" y="12" width="536" height="34" rx="10" fill="#13131c"/>
      <text x="28" y="33" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace" fontWeight="bold">ALERT DELIVERY — YOUR EDGE WINDOW</text>

      {/* Timeline bar */}
      <line x1="40" y1="110" x2="520" y2="110" stroke="rgba(255,255,255,0.07)" strokeWidth="2"/>

      {/* Segment 1: Line moves (t=0) */}
      <circle cx="80" cy="110" r="8" fill="hsl(186,100%,50%)"/>
      <line x1="80" y1="70" x2="80" y2="102" stroke="hsl(186,100%,50%)" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="30" y="42" width="100" height="26" rx="5" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.25)" strokeWidth="1"/>
      <text x="80" y="54" fontSize="7.5" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">SHARP BOOK</text>
      <text x="80" y="64" fontSize="10" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">LINE MOVES</text>
      <text x="80" y="126" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">t = 0 ms</text>

      {/* Segment 2: SharpTracker detects */}
      <circle cx="200" cy="110" r="8" fill="#4ade80"/>
      <line x1="200" y1="70" x2="200" y2="102" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="148" y="42" width="104" height="26" rx="5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" strokeWidth="1"/>
      <text x="200" y="54" fontSize="7.5" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">SHARPTRACKER</text>
      <text x="200" y="64" fontSize="10" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">DETECTS</text>
      <text x="200" y="126" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">t = 400 ms</text>

      {/* Segment 3: Your alert */}
      <circle cx="310" cy="110" r="10" fill="#4ade80" stroke="#0c0c14" strokeWidth="2"/>
      <text x="310" y="114" fontSize="11" textAnchor="middle">🔔</text>
      <line x1="310" y1="62" x2="310" y2="100" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="256" y="34" width="108" height="26" rx="5" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
      <text x="310" y="46" fontSize="7.5" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">YOUR PHONE</text>
      <text x="310" y="56" fontSize="10" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">ALERT SENT</text>
      <text x="310" y="126" fontSize="8" fill="#4ade80" textAnchor="middle" fontFamily="monospace">t = &lt;1 s</text>

      {/* Segment 4: Market adjusts */}
      <circle cx="480" cy="110" r="8" fill="rgba(255,255,255,0.2)"/>
      <line x1="480" y1="70" x2="480" y2="102" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="428" y="42" width="104" height="26" rx="5" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="480" y="54" fontSize="7.5" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">REC BOOKS</text>
      <text x="480" y="64" fontSize="10" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">ADJUST</text>
      <text x="480" y="126" fontSize="8" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="monospace">t = 30–90 s</text>

      {/* Edge window brace */}
      <path d="M80,148 L80,160 L480,160 L480,148" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
      <rect x="190" y="162" width="180" height="22" rx="5" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.25)" strokeWidth="1"/>
      <text x="280" y="177" fontSize="11" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">YOUR EDGE WINDOW</text>

      {/* Alert notification card */}
      <rect x="40" y="200" width="480" height="100" rx="8" fill="#17171f" stroke="rgba(0,255,255,0.18)" strokeWidth="1.5"/>
      <rect x="40" y="200" width="480" height="3" rx="8" fill="hsl(186,100%,50%)" opacity="0.7"/>
      <text x="56" y="224" fontSize="9" fill="hsl(186,100%,60%)" fontFamily="monospace" fontWeight="bold">⚡ SHARP ODDS DROP — MAN CITY vs ARSENAL</text>
      <text x="56" y="241" fontSize="11" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif">1X2 Home Win: 2.10 → 1.84  (−12.4%)</text>
      <text x="56" y="258" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">Sharp move detected · Premier League · Kickoff in 2h 14m</text>
      <rect x="56" y="268" width="90" height="22" rx="4" fill="hsl(186,100%,50%)"/>
      <text x="101" y="283" fontSize="9" fill="#000" textAnchor="middle" fontFamily="monospace" fontWeight="bold">BET NOW →</text>
      <rect x="156" y="268" width="90" height="22" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
      <text x="201" y="283" fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">+ LOG BET</text>
    </svg>
  );
}

const STEPS = [
  {
    visual: StepIlluMarkets,
    title: "Pick Your Markets",
    description: "Choose which sports, leagues, and bet types matter to you. Everything else is filtered out — you only see what you asked for."
  },
  {
    visual: StepIlluMinDrop,
    title: "Set Your Bar",
    description: "Decide how big a move needs to be before it alerts you. Small shifts are ignored. Only the ones that clear your limit come through."
  },
  {
    visual: StepIlluMonitor,
    title: "We Watch Around the Clock",
    description: "SharpTracker runs all day and night. The moment a line moves enough to matter, we catch it — no matter when it happens."
  },
  {
    visual: StepIlluAlert,
    title: "You Hear About It First",
    description: "The alert reaches you while other bettors are still unaware. The gap between the move and the market catching up is where your edge lives."
  }
];

// --- Components ---

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
    route: "clv",
    Icon: IconCLV,
    name: "CLV & +EV",
    desc: "See if your bets beat the closing line every time",
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

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToFeature = (route: string) => {
    setFeaturesOpen(false);
    navigate(`/features/${route}`);
  };

  const closePanel = () => setFeaturesOpen(false);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${scrolled ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto pl-2 pr-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-sans font-bold text-xl tracking-tight text-foreground">Sharp<span className="text-primary">Tracker</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wide text-muted-foreground">
          {/* Features mega-panel trigger */}
          <button
            ref={triggerRef}
            onClick={() => setFeaturesOpen(v => !v)}
            className={`flex items-center gap-1.5 hover:text-primary transition-colors ${featuresOpen ? "text-primary" : ""}`}
          >
            Features
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
              viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={() => { closePanel(); navigate("/why"); }} className="hover:text-primary transition-colors">Why SharpTracker?</button>
          <button onClick={() => { closePanel(); navigate("/pricing"); }} className="hover:text-primary transition-colors">Pricing</button>
          <button
            onClick={() => {
              closePanel();
              if (window.location.pathname.replace(/\/+$/, "").endsWith("/landing") || window.location.pathname === "/") {
                document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/");
                setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 300);
              }
            }}
            className="hover:text-primary transition-colors"
          >FAQ</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={closePanel} className="hidden md:block text-sm font-mono text-foreground hover:text-primary transition-colors" data-testid="btn-login">Log In</button>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] font-bold text-green-400 leading-none tracking-wide">14 days free</span>
            <button onClick={closePanel} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-md font-mono text-sm transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]" data-testid="btn-get-access">
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Features mega-panel — full width, anchored below navbar */}
      <AnimatePresence>
        {featuresOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-[0_24px_80px_-8px_rgba(0,0,0,0.9)]"
          >
            <div className="container mx-auto px-6 py-8">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">All Features</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-2">
                {FEATURE_ITEMS.map((f) => (
                  <button
                    key={f.route}
                    onClick={() => goToFeature(f.route)}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border/40 bg-card/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,255,255,0.08)] transition-all duration-200 text-center"
                  >
                    <div className="text-primary group-hover:scale-110 transition-transform duration-200">
                      <f.Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-semibold text-foreground group-hover:text-primary transition-colors">
                        {f.name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const HERO_STATS = [
  { value: "€2.6B", label: "Made every year by private bettors who follow sharp money" },
  { value: "< 1s",  label: "From the moment a line moves to the moment you get alerted" },
  { value: "10K+",  label: "Sharp odds drops tracked and logged every single day" },
];

const API_BASE = "https://84e61830-7611-4d35-8623-77d057b02e4e-00-30ovvqhxka0d5.kirk.replit.dev";

function Hero() {
  const [, navigate] = useLocation();
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    const load = () =>
      fetch(`${API_BASE}/api/odds/summary`)
        .then(r => r.json())
        .then(d => { if (typeof d.totalEvents === "number") setLiveCount(d.totalEvents); })
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-1/2 h-1/3 bg-blue-900/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center max-w-4xl">

          {/* Live markets badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-green-950/60 border border-green-500/25 text-green-400 text-sm font-mono mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            {liveCount !== null
              ? <>Monitoring <span className="font-bold text-green-300">{liveCount.toLocaleString()}</span> live markets right now</>
              : "Connecting to live markets…"}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-5xl sm:text-6xl md:text-8xl font-bold font-sans tracking-tighter leading-[1.05] mb-6 text-foreground"
          >
            The market moves.<br />
            <span
              style={{
                background: "linear-gradient(90deg, hsl(186 100% 50%), hsl(186 100% 80%), hsl(186 100% 50%))",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}
            >You move first.</span>
          </motion.h1>

          {/* Subtitle — simple, direct */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-xl md:text-2xl text-foreground/70 font-sans leading-relaxed mb-10 max-w-2xl"
          >
            Place bets that are mathematically in your favour. Our real-time alerts are driven by the world's sharpest bookmaker — the global benchmark every market follows.
          </motion.p>

          {/* Stat cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10 w-full max-w-3xl"
          >
            {HERO_STATS.map((s, i) => (
              <div key={i} className="flex-1 bg-card border border-border/60 rounded-xl px-5 py-5 text-left">
                <div className="text-3xl font-bold font-sans text-primary mb-2">{s.value}</div>
                <div className="text-sm font-sans text-foreground/70 leading-snug">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => navigate("/signup")}
              className="bg-primary text-primary-foreground px-10 py-4 rounded-md font-mono font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_30px_hsl(var(--primary)/0.35)]"
              data-testid="btn-sign-up"
            >
              Sign Up <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/pricing")}
                className="bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-md font-mono tracking-wide hover:bg-secondary/80 transition-colors"
                data-testid="btn-pricing"
              >
                Pricing
              </button>
              <span className="text-green-400 text-sm font-mono font-bold whitespace-nowrap">14 days free</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Carousel pinned to bottom of section */}
      <div className="relative z-10 border-t border-border/20">
        <MarqueeBand />
      </div>
    </section>
  );
}

function TerminalSection() {
  return (
    <section id="terminal" className="py-24 bg-background relative border-t border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-6">Observe the Matrix.</h2>
          <p className="text-muted-foreground text-xl">
            Stop refreshing sportsbooks. Our terminal ingests thousands of WebSocket events per second, surfacing meaningful price discovery instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono mb-2 border border-border">
                <Radar className="w-4 h-4 text-primary" /> Event Stream
              </div>
              <h3 className="text-2xl font-bold font-sans">See the steam.</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                When a syndicate hits the market, the line moves across books in milliseconds. SharpTracker visualizes these drops instantly, highlighting significant EV+ opportunities before they disappear.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono mb-2 border border-border">
                <LineChartIcon className="w-4 h-4 text-primary" /> Price History
              </div>
              <h3 className="text-2xl font-bold font-sans">Chart the sentiment.</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Every line movement is charted tick-by-tick. Identify resistance levels in spreads and totals, and understand the narrative arc of the market leading up to gametime.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 bg-primary/5 blur-xl rounded-full z-0"></div>
            <div className="bg-card border border-border rounded-xl p-1 relative z-10 shadow-2xl">
              <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
                {/* Mockup Top Bar */}
                <div className="flex border-b border-border/50 text-xs font-mono">
                  <div className="px-4 py-2 bg-muted/50 border-r border-border/50 flex items-center gap-2 text-foreground">
                    <Activity className="w-3 h-3 text-primary" /> Live Feed
                  </div>
                  <div className="px-4 py-2 text-muted-foreground flex items-center gap-2 hover:bg-muted/30 cursor-pointer">
                    <TrendingUp className="w-3 h-3" /> CLV Tracker
                  </div>
                </div>
                
                {/* Mockup Content */}
                <div className="flex h-[400px]">
                  {/* Left Sidebar */}
                  <div className="w-48 border-r border-border/50 bg-muted/10 p-4 space-y-4 hidden md:block">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Sports</div>
                    <div className="space-y-1">
                      {['NBA', 'NFL', 'MLB', 'NHL', 'Soccer'].map((sport, i) => (
                        <div key={sport} className={`text-xs font-mono px-2 py-1.5 rounded cursor-pointer ${i === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}>
                          {sport}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main Feed */}
                  <div className="flex-1 bg-background p-4 overflow-hidden relative">
                    {/* Animated grid background inside terminal */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    
                    <div className="relative z-10 space-y-3">
                       <div className="flex justify-between items-center pb-2 border-b border-border/30">
                         <div className="text-xs font-mono text-muted-foreground">Latest Sharp Drops</div>
                         <div className="text-[10px] font-mono text-primary flex items-center gap-1">● LIVE</div>
                       </div>
                       
                       <div className="space-y-2">
                         {[1,2,3,4].map((i) => (
                           <div key={i} className="flex justify-between items-center bg-card border border-border/50 p-3 rounded text-sm font-mono">
                             <div className="flex flex-col gap-1">
                               <span className="text-foreground font-medium">BOS Celtics @ MIA Heat</span>
                               <span className="text-xs text-muted-foreground">Spread - BOS -4.5</span>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-2">
                                 <span className="text-muted-foreground line-through text-xs">-110</span>
                                 <span className="text-primary font-bold">-125</span>
                               </div>
                               <span className="text-[10px] text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">EV: +4.2%</span>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

type BookLogo = {
  name: string;
  img?: string;
  large?: boolean;
  xlarge?: boolean;
};

const BASE = import.meta.env.BASE_URL;

const BOOKS: BookLogo[] = [
  { name: "bet365",       img: `${BASE}logos/bet365.png`, large: true },
  { name: "Unibet",       large: true },
  { name: "DraftKings" },
  { name: "William Hill", img: `${BASE}logos/williamhill.png`, large: true },
  { name: "Betclic",      img: `${BASE}logos/betclic.png` },
  { name: "FanDuel",      img: `${BASE}logos/fanduel.png`,    large: true },
  { name: "Betsson",      img: `${BASE}logos/betsson.png` },
  { name: "BetMGM",       large: true },
  { name: "Tipico",       img: `${BASE}logos/tipico.png` },
  { name: "888sport",     img: `${BASE}logos/888sport2.png`,  large: true },
  { name: "Betway",       img: `${BASE}logos/betway.png`,     xlarge: true },
  { name: "Ladbrokes",    large: true },
  { name: "Pinnacle" },
  { name: "Marathonbet" },
  { name: "Interwetten" },
  { name: "1xBet" },
  { name: "SBObet" },
];

function MarqueeBand() {
  const tripled = [...BOOKS, ...BOOKS, ...BOOKS];
  return (
    <div className="border-y border-border/30 bg-background py-5 overflow-hidden relative">
      {/* Left label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
        <div className="bg-gradient-to-r from-background via-background to-transparent w-52 h-full flex items-center pl-6 pr-8 shrink-0">
          <p className="text-sm font-mono text-muted-foreground leading-snug whitespace-nowrap">
            Works on<br />
            <span className="text-foreground font-bold">all major books →</span>
          </p>
        </div>
      </div>
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-background to-transparent w-20 pointer-events-none" />

      {/* Scrolling track */}
      <div className="flex animate-marquee items-center gap-0">
        {tripled.map((book, i) => (
          <div
            key={i}
            className="shrink-0 px-5 flex items-center justify-center"
            style={{ width: book.xlarge ? "190px" : book.large ? "150px" : "120px" }}
          >
            {book.img ? (
              <img
                src={book.img}
                alt={book.name}
                className="select-none"
                style={{
                  width: "100%",
                  height: book.xlarge ? "64px" : book.large ? "46px" : "30px",
                  objectFit: "contain",
                  objectPosition: "center",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.35,
                }}
                draggable={false}
              />
            ) : (
              <span
                className="select-none whitespace-nowrap font-sans font-bold tracking-wide"
                style={{
                  fontSize: book.xlarge ? "20px" : book.large ? "16px" : "13px",
                  color: "rgba(255,255,255,0.30)",
                }}
              >
                {book.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesGrid() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="py-20 bg-secondary/30 border-y border-border/20 overflow-hidden">
      <div className="container mx-auto px-6">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-3 leading-tight">
            Your filters.{" "}
            <span className="relative inline-block">
              <span
                className="relative z-10"
                style={{
                  background: "linear-gradient(90deg, hsl(186 100% 50%), hsl(186 100% 75%), hsl(186 100% 50%))",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 3s linear infinite",
                }}
              >Your rules.</span>
            </span>
          </h2>
          <p className="text-foreground/60 font-sans text-lg">Tell SharpTracker exactly what matters to you. It watches the markets around the clock and alerts you the moment something moves.</p>
        </motion.div>

        {/* Tabbed layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-5xl mx-auto">

          {/* Left — step selector */}
          <div className="flex flex-row lg:flex-col gap-2 lg:w-64 shrink-0 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-3.5 rounded-xl border transition-all duration-200 ${
                  active === i
                    ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(0,255,255,0.08)]"
                    : "bg-background/40 border-border hover:border-primary/20 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`text-sm font-mono font-bold tracking-widest ${active === i ? "text-primary" : "text-foreground/40"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {active === i && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <p className={`text-base font-sans font-bold leading-tight ${active === i ? "text-primary" : "text-foreground/70"}`}>
                  {step.title}
                </p>
                <p className={`text-sm font-sans mt-1.5 leading-snug hidden lg:block ${active === i ? "text-foreground/75" : "text-foreground/45"}`}>
                  {step.description}
                </p>
              </button>
            ))}
          </div>

          {/* Right — screenshot */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 relative min-h-[280px]"
          >
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden border border-primary/25 shadow-[0_0_60px_rgba(0,255,255,0.1)]">
              <div className="bg-[#0f1117] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 text-[10px] font-mono text-white/25 truncate">SharpTracker — {STEPS[active].title}</span>
              </div>
              <div className="w-full block">
                {(() => { const Visual = STEPS[active].visual; return <Visual />; })()}
              </div>
            </div>

            {/* Description shown below image on mobile */}
            <p className="lg:hidden mt-4 text-base font-sans text-foreground/60 leading-relaxed">
              {STEPS[active].description}
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

const USAGE_OPTIONS = [
  { value: "light",  label: "Light (2–5 hours / week)"   },
  { value: "medium", label: "Medium (5–10 hours / week)"  },
  { value: "heavy",  label: "Heavy (10–20 hours / week)"  },
];
const TIMEFRAME_OPTIONS = [
  { value: "2w", label: "2 weeks",  weeks: 2  },
  { value: "1m", label: "1 month",  weeks: 4  },
  { value: "3m", label: "3 months", weeks: 13 },
  { value: "6m", label: "6 months", weeks: 26 },
];
// Profit ranges in € for a €1 000 bankroll — scales linearly with bankroll
const PROFIT_TABLE: Record<string, Record<string, [number, number]>> = {
  light:  { "2w": [10, 40],   "1m": [20, 80],   "3m": [60, 240],   "6m": [120, 480]  },
  medium: { "2w": [20, 80],   "1m": [40, 160],  "3m": [120, 500],  "6m": [250, 900]  },
  heavy:  { "2w": [40, 150],  "1m": [80, 300],  "3m": [250, 1200], "6m": [500, 2500] },
};

function ProfitCalculatorSection() {
  const [bankroll, setBankroll] = useState(1000);
  const [usage, setUsage]       = useState("medium");
  const [timeframe, setTimeframe] = useState("3m");
  const [result, setResult]     = useState<{ data: { w: string; v: number }[]; profit: number; roi: number } | null>(null);

  function calculate() {
    const tf = TIMEFRAME_OPTIONS.find(o => o.value === timeframe)!;

    // XOR-shift seeded RNG so each Calculate click gives a different path
    let rng = ((Date.now() * 1000003) ^ 0xdeadbeef) >>> 0;
    const rand = () => {
      rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
      return (rng >>> 0) / 4294967296;
    };

    // Profit range from table, scaled linearly with bankroll
    const [pMin, pMax] = PROFIT_TABLE[usage][timeframe];
    const scaleFactor  = bankroll / 1000;
    const targetProfit = (pMin + rand() * (pMax - pMin)) * scaleFactor;
    const targetFinal  = bankroll + targetProfit;

    const days        = tf.weeks * 7;
    const noiseFactor = 0.04; // ±4% per day → very jagged

    let cur = bankroll;
    const raw: number[] = [cur];

    for (let i = 1; i <= days; i++) {
      const r    = rand();
      const move = (r - 0.46) * noiseFactor * 2; // noise only, no drift
      cur = Math.max(cur * (1 + move), bankroll * 0.5);
      raw.push(cur);
    }

    // Blend in a linear drift so: start = bankroll, end = targetFinal, zigzag preserved
    const rawFinal = raw[raw.length - 1];
    const driftScale = targetFinal / rawFinal;
    // Store profit (gain only), so chart starts at 0 and trends upward
    const data = raw.map((v, i) => {
      const t = i / (raw.length - 1);
      const drift = 1 + t * (driftScale - 1);
      return { w: String(i), v: Math.max(0, Math.round(v * drift - bankroll)) };
    });

    const profit = data[data.length - 1].v;
    setResult({ data, profit, roi: (profit / bankroll) * 100 });
  }

  const inputCls = "w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors";

  return (
    <section id="profit-calculator" className="py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono tracking-widest text-primary uppercase">Tools</span>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mt-3 mb-4">Profit Calculator.</h2>
          <p className="text-foreground/65 text-xl max-w-xl mx-auto">
            See what SharpTracker could do for your bankroll based on how you plan to use it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,255,255,0.04)]"
        >
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">

            {/* ── LEFT: inputs ── */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Initial Bankroll</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">€</span>
                  <input
                    type="number"
                    min={100}
                    value={bankroll}
                    onChange={e => setBankroll(Math.max(0, Number(e.target.value)))}
                    className={inputCls + " pl-8"}
                  />
                </div>
                <p className="text-xs text-muted-foreground">We recommend starting with at least €500</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Weekly Usage</label>
                <div className="relative">
                  <select
                    value={usage}
                    onChange={e => setUsage(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {USAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
                <p className="text-xs text-muted-foreground">How many hours a week you plan to use SharpTracker</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Timeframe</label>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {TIMEFRAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              <button
                onClick={calculate}
                className="w-full bg-primary text-background font-bold font-sans py-3.5 rounded-lg hover:bg-primary/85 active:scale-[0.98] transition-all text-sm tracking-wide"
              >
                Calculate
              </button>
            </div>

            {/* ── RIGHT: chart / placeholder ── */}
            <div className="p-8 flex flex-col min-h-[340px]">
              {result ? (
                <>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={result.data} margin={{ top: 6, right: 6, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="calcGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="hsl(186 100% 50%)" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="hsl(186 100% 50%)" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <YAxis
                          tickFormatter={v => `€${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
                          tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false} tickLine={false} width={52}
                        />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}
                          formatter={(v: number) => [`+€${v.toLocaleString()}`, "Profit"]}
                          labelFormatter={l => l}
                        />
                        <Area type="monotone" dataKey="v" stroke="hsl(186 100% 50%)" strokeWidth={2} fill="url(#calcGrad)" dot={false} activeDot={{ r: 3, fill: "hsl(186 100% 50%)" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 pt-5 border-t border-border/50">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">Estimated Profit</p>
                        <p className="text-2xl font-bold font-mono text-primary">+€{result.profit.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-mono mb-1">ROI</p>
                        <p className="text-2xl font-bold font-mono text-primary">+{result.roi.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Data may not reflect actual results. Illustrative purposes only. Past performance does not guarantee future results.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-foreground/50 text-sm font-mono">Fill in your details and press</p>
                    <p className="text-foreground font-bold font-sans mt-1">Calculate</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-card border-t border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 relative z-10 text-center max-w-3xl"
      >
        <h2 className="text-4xl md:text-6xl font-bold font-sans mb-6">Stop playing with a handicap.</h2>
        <p className="text-xl text-muted-foreground mb-10">
          Join the sharpest bettors leveraging real-time sharp market data to print CLV.
        </p>
        <div className="flex justify-center">
          <button className="bg-primary text-primary-foreground px-10 py-4 rounded-md font-mono font-bold tracking-wide text-lg hover:bg-primary/90 transition-colors shadow-[0_0_30px_hsl(var(--primary)/0.3)]" data-testid="btn-footer-signup">
            Start 14-Day Free Trial
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-border/50 text-center md:text-left">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
        <div className="grid md:grid-cols-4 gap-8 mb-8 border-b border-border/50 pb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Activity className="w-6 h-6 text-primary" />
              <span className="font-sans font-bold text-xl tracking-tight text-foreground">SharpTracker</span>
            </div>
            <p className="text-muted-foreground text-base max-w-sm mx-auto md:mx-0">
              Professional odds tracking and CLV analysis terminal.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/why" className="hover:text-primary">Why SharpTracker?</Link></li>
              <li><Link href="/signup" className="hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground text-center space-y-3">
          <p>&copy; {new Date().getFullYear()} SharpTracker. All rights reserved.</p>

          <p className="max-w-3xl mx-auto leading-relaxed">
            SharpTracker is a data and analytics service. This site is strictly for educational and informational purposes only and does not involve real-money betting or facilitate wagering of any kind.
            References to "sharp bookmakers" are general in nature and do not constitute endorsement of any specific operator.
            "Pinnacle" is a registered trademark of the Pinnacle group of companies.
          </p>

          <p className="max-w-3xl mx-auto leading-relaxed">
            Gambling involves risk. Only bet what you can afford to lose. This service is intended for adults aged 18 and over.
            If you or someone you know has a gambling problem, help is available — visit{" "}
            <a
              href="https://www.begambleaware.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              BeGambleAware.org
            </a>{" "}
            or contact the{" "}
            <a
              href="https://www.gamblersanonymous.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Gamblers Anonymous
            </a>{" "}
            helpline in your country.
          </p>
        </div>
        </motion.div>
      </div>
    </footer>
  );
}

function AlertConfigSection() {
  return (
    <section id="alerts" className="py-28 bg-card border-y border-border/20 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left — text + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center lg:text-left space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20">
              <Bell className="w-3.5 h-3.5" /> Mobile App
            </div>

            <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight leading-none">
              Never miss<br />a drop.
            </h2>

            <p className="text-muted-foreground text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
              Download for free. Get a push notification the moment a sharp odds drop hits — act before the line moves.
            </p>

            {/* Notification preview pills */}
            <div className="space-y-2 py-2">
              {[
                { sport: "Football", ev: "+5.6%", time: "just now" },
                { sport: "Basketball", ev: "+4.1%", time: "2 min ago" },
                { sport: "Soccer", ev: "+3.8%", time: "5 min ago" },
              ].map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-3 bg-background border border-primary/20 rounded-xl px-4 py-2.5 w-full max-w-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  <div className="flex-1 text-left">
                    <span className="text-xs font-mono text-muted-foreground">{n.sport} · Sharp drop</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-primary">{n.ev}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">{n.time}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA button */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold font-sans text-base px-8 py-4 rounded-xl shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_60px_-8px_hsl(var(--primary)/0.8)] transition-shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download App
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 bg-secondary border border-border text-foreground font-bold font-sans text-base px-8 py-4 rounded-xl hover:border-primary/30 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18.5v-13c0-.83.94-1.3 1.6-.8l10 6.5c.6.39.6 1.21 0 1.6l-10 6.5c-.66.5-1.6.03-1.6-.8z"/>
                </svg>
                Google Play
              </motion.a>
            </div>

            <p className="text-xs font-mono text-muted-foreground/50">Free download · No credit card required</p>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32, y: 16 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] scale-75 translate-y-8" />
            <div className="relative w-[300px] md:w-[380px]">
              <img
                src={`${import.meta.env.BASE_URL}screenshots/app-mobile.png`}
                alt="SharpTracker mobile app"
                className="w-full h-auto rounded-[2rem] shadow-[0_0_100px_-10px_hsl(var(--primary)/0.5)] border border-primary/15"
                style={{ transform: "perspective(1200px) rotateY(-6deg) rotateX(1deg)", imageRendering: "crisp-edges" }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

const EV_DATA = [
  { week: "Start", sharp: 0,    avg: 0    },
  { week: "W1",    sharp: 8,    avg: 28   },
  { week: "W2",    sharp: -7,   avg: 20   },
  { week: "W3",    sharp: 15,   avg: 52   },
  { week: "W4",    sharp: -3,   avg: 32   },
  { week: "W5",    sharp: 22,   avg: 7    },
  { week: "W6",    sharp: 14,   avg: 25   },
  { week: "W7",    sharp: 46,   avg: -5   },
  { week: "W8",    sharp: 26,   avg: 17   },
  { week: "W9",    sharp: 44,   avg: -18  },
  { week: "W10",   sharp: 19,   avg: 10   },
  { week: "W11",   sharp: 34,   avg: -12  },
  { week: "W12",   sharp: 62,   avg: -30  },
  { week: "W13",   sharp: 40,   avg: 5    },
  { week: "W14",   sharp: 75,   avg: -23  },
  { week: "W15",   sharp: 45,   avg: -3   },
  { week: "W16",   sharp: 57,   avg: -35  },
  { week: "W17",   sharp: 39,   avg: -10  },
  { week: "W18",   sharp: 69,   avg: -48  },
  { week: "W19",   sharp: 89,   avg: -30  },
  { week: "W20",   sharp: 61,   avg: -55  },
  { week: "W21",   sharp: 79,   avg: -25  },
  { week: "W22",   sharp: 44,   avg: -45  },
  { week: "W23",   sharp: 86,   avg: -10  },
  { week: "W24",   sharp: 101,  avg: -40  },
  { week: "W25",   sharp: 76,   avg: -62  },
  { week: "W26",   sharp: 106,  avg: -34  },
  { week: "W27",   sharp: 91,   avg: -69  },
  { week: "W28",   sharp: 129,  avg: -49  },
  { week: "W29",   sharp: 109,  avg: -77  },
  { week: "W30",   sharp: 134,  avg: -45  },
  { week: "W31",   sharp: 102,  avg: -75  },
  { week: "W32",   sharp: 130,  avg: -53  },
  { week: "W33",   sharp: 165,  avg: -91  },
  { week: "W34",   sharp: 147,  avg: -66  },
  { week: "W35",   sharp: 167,  avg: -94  },
  { week: "W36",   sharp: 125,  avg: -59  },
  { week: "W37",   sharp: 163,  avg: -101 },
  { week: "W38",   sharp: 185,  avg: -83  },
  { week: "W39",   sharp: 160,  avg: -115 },
  { week: "W40",   sharp: 190,  avg: -87  },
  { week: "W41",   sharp: 175,  avg: -122 },
  { week: "W42",   sharp: 220,  avg: -102 },
  { week: "W43",   sharp: 192,  avg: -132 },
  { week: "W44",   sharp: 227,  avg: -97  },
  { week: "W45",   sharp: 207,  avg: -125 },
  { week: "W46",   sharp: 237,  avg: -110 },
  { week: "W47",   sharp: 219,  avg: -148 },
  { week: "W48",   sharp: 261,  avg: -126 },
  { week: "W49",   sharp: 239,  avg: -158 },
  { week: "W50",   sharp: 274,  avg: -130 },
  { week: "W51",   sharp: 259,  avg: -165 },
  { week: "W52",   sharp: 299,  avg: -150 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl text-xs font-mono">
      <div className="text-muted-foreground mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          <span className="text-foreground">{p.name}:</span>
          <span style={{ color: p.color }} className="font-bold">
            {p.value > 0 ? "+" : ""}{p.value} units
          </span>
        </div>
      ))}
    </div>
  );
}

function EVComparisonSection() {
  return (
    <section id="bankroll" className="py-24 bg-card border-y border-border/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20 mb-5">
            <TrendingUp className="w-3.5 h-3.5" /> +EV vs. Average Bettor
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            The edge compounds over time.
          </h2>
          <p className="text-muted-foreground text-xl">
            Playing +EV doesn't mean winning every bet. It means the math works in your favour across hundreds of bets — while the average bettor bleeds slowly.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-8 mb-10"
        >
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-primary">+299 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">SharpTracker · 52 weeks</div>
          </div>
          <div className="w-px bg-border/50 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-destructive">-150 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Average bettor · 52 weeks</div>
          </div>
          <div className="w-px bg-border/50 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-foreground">449 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Difference in outcome</div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-background border border-border/50 rounded-2xl p-6 md:p-8 relative"
        >
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-6 h-0.5 rounded bg-[#00FFFF] inline-block" />
              <span className="text-foreground">SharpTracker user</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-6 h-0.5 rounded bg-[#FF4D4D] inline-block" />
              <span className="text-foreground">Average bettor</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={EV_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSharp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00FFFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF4D4D" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(240 8% 42%)", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                interval={12}
                ticks={["Start", "W13", "W26", "W39", "W52"]}
              />
              <YAxis
                tick={{ fill: "hsl(240 8% 48%)", fontSize: 11, fontFamily: "Space Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}u`}
                width={58}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
              <Area
                type="linear"
                dataKey="avg"
                name="Average bettor"
                stroke="#FF4D4D"
                strokeWidth={2}
                fill="url(#gradAvg)"
                dot={false}
                activeDot={{ r: 4, fill: "#FF4D4D" }}
              />
              <Area
                type="linear"
                dataKey="sharp"
                name="SharpTracker"
                stroke="#00FFFF"
                strokeWidth={2}
                fill="url(#gradSharp)"
                dot={false}
                activeDot={{ r: 4, fill: "#00FFFF" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* End labels */}
          <div className="flex justify-between mt-4 px-14 text-xs font-mono">
            <span />
            <div className="flex gap-8">
              <span className="text-[#00FFFF] font-bold">↑ +299u · SharpTracker</span>
              <span className="text-[#FF4D4D] font-bold">↓ -150u · Average</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const FEATURE_TILES = [
  { icon: TrendingDown,   label: "Live Odds Drops",       href: "/features/odds-drops"      },
  { icon: ClipboardList,  label: "Bet Tracker",            href: "/features/bet-tracker"     },
  { icon: Target,         label: "CLV Analysis",           href: "/features/clv"             },
  { icon: Calculator,     label: "Stake Calculator",       href: "/features/stake-calculator"},
  { icon: CalendarDays,   label: "Daily Calendar",         href: "/features/daily-calendar"  },
  { icon: Wallet,         label: "Bankroll Management",    href: "/features/bankroll"        },
];

function FeatureStripSection() {
  const [, navigate] = useLocation();
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mb-2">Everything you need. Nothing you don't.</h2>
          <p className="text-foreground/55 text-lg font-sans">Six tools built for serious bettors — each one focused, fast, and actionable.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {FEATURE_TILES.map(({ icon: Icon, label, href }, i) => (
            <motion.button
              key={href}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              onClick={() => navigate(href)}
              className="group flex items-center gap-3 bg-card border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl px-5 py-4 text-left transition-all duration-200 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-sans font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BankrollFeatureCards() {
  const appBase = "https://84e61830-7611-4d35-8623-77d057b02e4e-00-30ovvqhxka0d5.kirk.replit.dev";

  const BetLoggerArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Bet Log</span>
        <span className="ml-auto text-white/20">April 2026</span>
      </div>
      {[
        { match: "Lakers vs Celtics", market: "ML", odds: "+155", stake: "2u", result: "+3.1u", win: true },
        { match: "Man Utd vs Arsenal", market: "AH -0.5", odds: "-108", stake: "1u", result: "-1u", win: false },
        { match: "Djokovic vs Alcaraz", market: "ML", odds: "+122", stake: "1.5u", result: "+1.8u", win: true },
        { match: "Bruins vs Rangers", market: "Puck -1.5", odds: "+170", stake: "1u", result: "+1.7u", win: true },
        { match: "Chiefs vs Ravens", market: "Spread -3", odds: "-110", stake: "2u", result: "-2u", win: false },
      ].map((row, i) => (
        <div key={i} className={`flex items-center gap-2 py-1.5 border-b border-white/4 last:border-0 ${i === 1 || i === 4 ? "opacity-60" : ""}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.win ? "bg-emerald-400" : "bg-red-500"}`} />
          <span className="text-white/60 truncate flex-1">{row.match}</span>
          <span className="text-white/30 shrink-0">{row.market}</span>
          <span className="text-white/40 shrink-0">{row.odds}</span>
          <span className={`shrink-0 font-bold ${row.win ? "text-emerald-400" : "text-red-400"}`}>{row.result}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
        <span className="text-white/30">5 bets logged</span>
        <span className="text-emerald-400 font-bold">Net: +3.6u</span>
      </div>
    </div>
  );

  const CalendarArt = () => {
    const days = ["M","T","W","T","F","S","S"];
    const cells = [
      null, null, { v: +2.1, w: true }, { v: -1.0, w: false }, { v: +3.5, w: true }, { v: 0, w: null }, { v: 0, w: null },
      { v: +1.8, w: true }, { v: +0.5, w: true }, { v: -2.3, w: false }, { v: 0, w: null }, { v: +4.1, w: true }, { v: -1.5, w: false }, { v: 0, w: null },
      { v: +0.9, w: true }, { v: -0.5, w: false }, { v: +2.8, w: true }, { v: +1.2, w: true }, { v: -3.1, w: false }, { v: 0, w: null }, { v: 0, w: null },
      { v: +3.3, w: true }, { v: +0.7, w: true }, { v: -1.8, w: false }, { v: +2.4, w: true }, { v: 0, w: null }, { v: 0, w: null }, { v: 0, w: null },
    ];
    return (
      <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
          <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Daily P&amp;L</span>
          <span className="ml-auto text-white/20">April 2026</span>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} className="text-center text-white/20 text-[8px] pb-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`h-6 rounded text-[8px] flex items-center justify-center font-bold
                ${!c ? "bg-transparent" :
                  c.w === null ? "bg-white/4 text-white/10" :
                  c.w ? "bg-emerald-500/25 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
            >
              {c && c.w !== null ? (c.w ? `+${c.v}` : c.v) : ""}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/> 15 profitable</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/> 6 losing</span>
        </div>
      </div>
    );
  };

  const CLVArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">CLV Tracker</span>
        <span className="ml-auto text-emerald-400 text-[9px]">+EV ✓</span>
      </div>
      {[
        { match: "Celtics ML", placed: "-108", close: "-116", clv: "+0.7%" },
        { match: "Over 225.5", placed: "-112", close: "-122", clv: "+0.9%" },
        { match: "Chiefs -3",  placed: "+102", close: "+108", clv: "+0.5%" },
        { match: "Djokovic ML",placed: "-110", close: "-120", clv: "+0.8%" },
      ].map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1.5 border-b border-white/4 last:border-0">
          <span className="text-white/60 truncate">{row.match}</span>
          <span className="text-white/30">Placed {row.placed}</span>
          <span className="text-white/30">Close {row.close}</span>
          <span className="text-emerald-400 font-bold">{row.clv}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
        <span className="text-white/30">Avg CLV this month</span>
        <span className="text-emerald-400 font-bold">+0.73% per bet</span>
      </div>
    </div>
  );

  const AutoSettleArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Auto-settle</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
          <span className="text-emerald-400 text-[9px]">LIVE</span>
        </span>
      </div>
      {[
        { match: "Lakers -5.5", time: "2h ago", result: "WON", outcome: "+1.9u", color: "emerald" },
        { match: "Man City ML", time: "4h ago", result: "LOST", outcome: "-1u", color: "red" },
        { match: "Djokovic ML", time: "6h ago", result: "WON", outcome: "+1.8u", color: "emerald" },
        { match: "Hawks +7.5", time: "9h ago", result: "PUSH", outcome: "0u", color: "yellow" },
        { match: "O/U 214.5",  time: "11h ago", result: "WON", outcome: "+2.2u", color: "emerald" },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/4 last:border-0">
          <div className="flex-1 min-w-0">
            <div className="text-white/60 truncate">{row.match}</div>
            <div className="text-white/20 text-[8px]">{row.time}</div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold shrink-0
            ${row.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" :
              row.color === "red" ? "bg-red-500/15 text-red-400" :
              "bg-yellow-500/15 text-yellow-400"}`}>
            {row.result}
          </span>
          <span className={`font-bold shrink-0 w-10 text-right
            ${row.color === "emerald" ? "text-emerald-400" :
              row.color === "red" ? "text-red-400" : "text-yellow-400"}`}>
            {row.outcome}
          </span>
        </div>
      ))}
    </div>
  );

  const cards = [
    {
      tag: "Bet Logger",
      title: "Log every bet. Miss nothing.",
      desc: "Record each wager with stake, odds, market and sport. Your full history in one place — filterable, sortable, exportable.",
      art: <BetLoggerArt />,
      href: `${appBase}/bet-tracker`,
    },
    {
      tag: "Daily Calendar",
      title: "Your P&L, day by day.",
      desc: "A color-coded calendar shows winning and losing days at a glance. Spot patterns, streaks, and tilt cycles before they cost you.",
      art: <CalendarArt />,
      href: `${appBase}/bet-stats`,
    },
    {
      tag: "CLV & +EV",
      title: "Did you beat the closing line?",
      desc: "Automatically compare your entry odds to where the market closed. Sustained positive CLV is the strongest predictor of long-term profit.",
      art: <CLVArt />,
      href: `${appBase}/bet-stats`,
    },
    {
      tag: "Auto-settle",
      title: "Results logged automatically.",
      desc: "Bets are resolved and settled the moment results come in. No manual updates, no spreadsheet maintenance — your bankroll stays accurate in real time.",
      art: <AutoSettleArt />,
      href: `${appBase}/bet-tracker`,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20 mb-5">
            <Activity className="w-3.5 h-3.5" /> Edge Tracking Suite
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            Follow your edge. Watch your bankroll grow.
          </h2>
          <p className="text-muted-foreground text-xl">
            Every metric that matters — tracked automatically. No spreadsheets, no guesswork.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.a
              key={i}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-5 cursor-pointer hover:border-primary/30 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.15)] transition-all duration-300"
            >
              <div className="pointer-events-none">
                {card.art}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-primary tracking-widest uppercase mb-2">
                  {card.tag}
                </div>
                <h3 className="text-lg font-bold font-sans text-foreground mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MultiSportSection() {
  const sports = [
    { name: "NFL Football", icon: "🏈", count: "32 Games/Wk", markets: "Moneyline, Spread, Total" },
    { name: "NBA Basketball", icon: "🏀", count: "15 Games/Day", markets: "Moneyline, Spread, Total" },
    { name: "MLB Baseball", icon: "⚾️", count: "15 Games/Day", markets: "Moneyline, Run Line, Total" },
    { name: "NHL Hockey", icon: "🏒", count: "12 Games/Day", markets: "Moneyline, Puck Line, Total" },
    { name: "Soccer", icon: "⚽️", count: "100+ Leagues", markets: "1x2, Asian Handicap, Total" },
    { name: "Tennis", icon: "🎾", count: "ATP / WTA", markets: "Match Winner, Set Spread" }
  ];

  return (
    <section id="sports" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-6">Total Market Coverage.</h2>
          <p className="text-muted-foreground font-mono text-lg">
            Track line movement across every major sport simultaneously. Our backend processes over 50,000 odds updates per minute across all markets.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sports.map((sport, i) => (
            <motion.div 
              key={sport.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-colors text-center group"
            >
              <div className="text-4xl mb-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">{sport.icon}</div>
              <h3 className="font-bold font-sans text-lg mb-1">{sport.name}</h3>
              <div className="text-xs font-mono text-muted-foreground">{sport.count}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Marcus W.",
    location: "Stockholm, Sweden",
    initials: "MW",
    color: "hsl(186,100%,40%)",
    quote: "I've been following sharp money on soccer for two years, but manually. SharpTracker completely changed my process. I now catch 3–4 high-value drops a day I would have missed entirely. My CLV has gone from roughly neutral to consistently positive. It's the only tool I use every single day.",
    profit: "€42,000",
    stat2label: "Duration",
    stat2: "14 Months",
  },
  {
    name: "Jake O'Brien",
    location: "Dublin, Ireland",
    initials: "JO",
    color: "#a78bfa",
    quote: "The speed is what got me. I used to watch Pinnacle manually on two screens and still felt like I was always a step behind. With SharpTracker I get the alert on my phone before I even have the tab open. I've gone from scratching a small edge to running a 7.4% yield on tennis — and I credit the alert speed entirely.",
    profit: "€18,500",
    stat2label: "Bets",
    stat2: "892",
  },
  {
    name: "Sofia Reyes",
    location: "Barcelona, Spain",
    initials: "SR",
    color: "#f472b6",
    quote: "What I love is the filtering. I only care about NBA and Euroleague, and I only want to see drops above 8%. SharpTracker gives me exactly that — no noise, just the signals I asked for. I log every bet directly from the feed and review my CLV weekly. My betting is finally disciplined.",
    profit: "€8,900",
    stat2label: "Yield",
    stat2: "6.2%",
  },
  {
    name: "Thomas B.",
    location: "Munich, Germany",
    initials: "TB",
    color: "#fb923c",
    quote: "I came from a trading background and was skeptical about sports betting. But the logic is solid — if the sharpest bookmaker moves a line, there's information in that move. SharpTracker makes it easy to act on that information before everyone else does. Eight months in and I've outperformed every other investment in my portfolio.",
    profit: "€31,200",
    stat2label: "Duration",
    stat2: "8 Months",
  },
  {
    name: "Luca Ferrari",
    location: "Milan, Italy",
    initials: "LF",
    color: "#4ade80",
    quote: "I specialise in Asian handicap markets on Serie A and Champions League. SharpTracker's coverage of those markets is excellent — I see drops I've never seen on any other tool. The bet tracker keeps my records spotless, and seeing my CLV score per bet has made me a much more selective bettor.",
    profit: "€12,600",
    stat2label: "Bets",
    stat2: "1 248",
  },
  {
    name: "Emma Clarke",
    location: "London, United Kingdom",
    initials: "EC",
    color: "#fbbf24",
    quote: "I was a recreational bettor losing money every month, mostly from betting on instinct. A friend showed me this and explained how sharp money works. Within three months I understood line movement, started tracking CLV, and turned a losing habit into a profitable one. The learning curve is not steep — the platform does the hard work.",
    profit: "€4,200",
    stat2label: "Duration",
    stat2: "3 Months",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-5">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Real users. Real results.</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            Hear what others<br className="hidden sm:block" /> are saying.
          </h2>
          <p className="text-foreground/55 font-sans text-lg max-w-xl mx-auto">
            Sharp bettors from across Europe and beyond — all using SharpTracker to catch moves before the market adjusts.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-border transition-colors"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                {/* Quote mark */}
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <path d="M0 18V10.8C0 4.8 3.6 1.2 10.8 0l1.2 2.4C8.4 3.6 6.6 5.4 6 8.4H10.8V18H0ZM13.2 18V10.8C13.2 4.8 16.8 1.2 24 0l1.2 2.4C21.6 3.6 19.8 5.4 19.2 8.4H24V18H13.2Z" fill="currentColor" className="text-primary/40"/>
                </svg>
                {/* Name + avatar */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold font-mono text-black shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-sans font-semibold text-foreground leading-none">{t.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5 leading-none">{t.location}</p>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="px-5 pb-5 flex-1">
                <p className="text-sm font-sans text-foreground/70 leading-relaxed">{t.quote}</p>
              </div>

              {/* Stats bar */}
              <div className="flex items-stretch border-t border-border/40">
                <div className="flex-1 px-5 py-3.5">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Profit</p>
                  <p className="text-sm font-bold font-mono text-green-400">{t.profit}</p>
                </div>
                <div className="w-px bg-border/40" />
                <div className="flex-1 px-5 py-3.5">
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{t.stat2label}</p>
                  <p className="text-sm font-bold font-mono text-foreground/80">{t.stat2}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: "What exactly is SharpTracker?",
    a: "SharpTracker monitors odds movements at sharp bookmakers in real time. The moment a line moves significantly, you get an alert — so you can place your bet before softer bookmakers and exchanges catch up and adjust their prices."
  },
  {
    q: "How fast are the alerts?",
    a: "Alerts are delivered within seconds of a line movement being detected. Speed is everything in odds dropping — even a 30-second head start can mean the difference between getting the value price and missing it entirely."
  },
  {
    q: "What sports do you cover?",
    a: "We cover football (soccer), basketball, American football, tennis, ice hockey, and baseball. More sports are added regularly based on user demand."
  },
  {
    q: "Do I need to be an expert bettor to use this?",
    a: "No. The app is built to be clear and simple. If you understand what odds are and want to get better prices on your bets, you can use SharpTracker right away. The CLV and bankroll tools are there when you're ready to go deeper."
  },
  {
    q: "What is CLV and why does it matter?",
    a: "CLV stands for Closing Line Value. It measures how much better your odds were at the time you bet compared to the final odds before the game starts. Consistently beating the closing line is the strongest indicator that you're a long-term winning bettor."
  },
  {
    q: "Which bookmakers does the data come from?",
    a: "We pull odds from sharp, high-limits bookmakers that professional bettors rely on as market benchmarks. These are the books that move first — if they move their line, the whole market follows."
  },
  {
    q: "Is there a free trial?",
    a: "Yes — every new account starts with a full 14-day free trial. No credit card required. You get complete access to every feature from day one. After 14 days you can choose a plan, or simply stop — no charge either way."
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no contracts or lock-in periods. You can cancel your subscription at any time from your account settings. You'll keep access until the end of your current billing period."
  },
  {
    q: "What is the Stake Calculator for?",
    a: "The Stake Calculator uses the Kelly Criterion to help you size each bet correctly based on your bankroll and the edge you have. Proper bet sizing is one of the most overlooked parts of profitable betting."
  },
  {
    q: "What's the difference between SharpTracker and a tipster service?",
    a: "We don't tell you who to bet on. We give you the tools to find and act on value yourself — live odds movement data, CLV tracking, and bet analysis. You stay in control of every decision."
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-card border-y border-border/20">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20 mb-5">
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-sans tracking-tight mb-3">Common questions, honest answers.</h2>
          <p className="text-foreground/60 font-sans text-lg">Everything you need to know before getting started.</p>
        </motion.div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-background border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left group hover:bg-primary/5 transition-colors"
              >
                <span className="font-sans font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors">{item.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform duration-200 ${open === i ? "rotate-90 text-primary" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-base font-sans text-foreground/65 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BetTrackerSection() {
  return (
    <section id="bet-tracker" className="py-24 bg-secondary/20 border-y border-border/20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-sans mb-6">Integrated Bet Tracker.</h2>
        <p className="text-muted-foreground font-mono text-lg max-w-2xl mx-auto mb-16">
          Log your bets with one click from the feed. We automatically grade them at game end and map your performance over time.
        </p>

        <div className="bg-card border border-border rounded-xl overflow-hidden max-w-5xl mx-auto shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-normal">Date</th>
                  <th className="px-6 py-4 font-normal">Matchup</th>
                  <th className="px-6 py-4 font-normal">Selection</th>
                  <th className="px-6 py-4 font-normal">Odds</th>
                  <th className="px-6 py-4 font-normal text-right">CLV</th>
                  <th className="px-6 py-4 font-normal text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { date: "Oct 24", match: "LAL @ DEN", pick: "DEN -4.5", odds: "-110", clv: "+3.2%", result: "WIN", resultColor: "text-green-500" },
                  { date: "Oct 24", match: "BOS @ NYK", pick: "Under 212.5", odds: "-105", clv: "+1.5%", result: "LOSS", resultColor: "text-destructive" },
                  { date: "Oct 23", match: "DAL @ SF", pick: "DAL ML", odds: "+145", clv: "+4.8%", result: "WIN", resultColor: "text-green-500" },
                  { date: "Oct 23", match: "PHI @ MIA", pick: "MIA -2.0", odds: "-115", clv: "-0.5%", result: "WIN", resultColor: "text-green-500" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-foreground">{row.match}</td>
                    <td className="px-6 py-4 font-bold">{row.pick}</td>
                    <td className="px-6 py-4">{row.odds}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={row.clv.startsWith('+') ? 'text-primary' : 'text-destructive'}>{row.clv}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${row.resultColor}`}>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function SharpDataSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="shrink-0 bg-primary/10 w-32 h-32 rounded-full flex items-center justify-center">
            <Database className="w-16 h-16 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold font-sans mb-4 text-foreground">Powered by Sharp Bookmaker Data.</h2>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-3xl">
              We track only the sharpest bookmakers — the true market makers where professional money flows. While other services blend data from slow recreational books, SharpTracker isolates the signal from the noise. When the sharp money moves, you see it first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppContent() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <EVComparisonSection />
        <FeatureStripSection />
        <BankrollFeatureCards />
        <AlertConfigSection />
        <ProfitCalculatorSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppContent} />
      <Route path="/why" component={WhyPage} />
      <Route path="/features/odds-drops" component={OddsDropPage} />
      <Route path="/features/bet-tracker" component={BetTrackerPage} />
      <Route path="/features/clv" component={CLVPage} />
      <Route path="/features/stake-calculator" component={StakeCalculatorPage} />
      <Route path="/features/daily-calendar" component={DailyCalendarPage} />
      <Route path="/features/multi-sport" component={MultiSportPage} />
      <Route path="/features/bankroll" component={BankrollPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
