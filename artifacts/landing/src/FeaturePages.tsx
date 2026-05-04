import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowLeft, ChevronRight } from "lucide-react";
import { useLang } from "./LanguageContext";
import { tPages } from "./i18n-pages";

// ─────────────────────────────────────────────
// Shared SVG Icon Components
// ─────────────────────────────────────────────

export function IconOddsDrop({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,10 14,24 22,16 34,32 44,20" />
      <polyline points="34,32 44,32 44,20" fill="currentColor" stroke="none" opacity="0.15" />
      <line x1="34" y1="32" x2="44" y2="32" />
      <circle cx="36" cy="40" r="4" strokeWidth="2" />
      <line x1="36" y1="36" x2="36" y2="33" />
      <path d="M32 40 C32 37.8 33.8 36 36 36" />
    </svg>
  );
}

export function IconBetTracker({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="32" height="36" rx="3" />
      <line x1="8" y1="16" x2="40" y2="16" />
      <line x1="8" y1="24" x2="40" y2="24" />
      <line x1="8" y1="32" x2="40" y2="32" />
      <line x1="20" y1="16" x2="20" y2="42" />
      <polyline points="13,20 16,23 24,19" />
      <polyline points="13,28 16,31 24,27" />
      <line x1="25" y1="36" x2="36" y2="36" strokeWidth="1.5" opacity="0.5" />
      <line x1="25" y1="20" x2="36" y2="20" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function IconBookmakerComparison({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="40" height="28" rx="3" />
      <line x1="4" y1="18" x2="44" y2="18" />
      <line x1="18" y1="10" x2="18" y2="38" />
      <line x1="32" y1="10" x2="32" y2="38" />
      <circle cx="11" cy="14" r="2" fill="currentColor" stroke="none" opacity="0.5" />
      <polyline points="7,27 10,30 15,23" strokeWidth="1.8" />
      <line x1="21" y1="23" x2="29" y2="23" strokeWidth="1.5" opacity="0.35" />
      <line x1="21" y1="30" x2="29" y2="30" strokeWidth="1.5" opacity="0.35" />
      <polyline points="35,27 38,30 43,23" strokeWidth="1.8" opacity="0.5" />
    </svg>
  );
}

export function IconStake({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <path d="M24 6 A18 18 0 0 1 42 24" strokeWidth="3" opacity="0.3" />
      <path d="M24 6 A18 18 0 0 1 36 36" strokeWidth="3" />
      <line x1="24" y1="24" x2="24" y2="10" strokeWidth="2.5" />
      <line x1="24" y1="24" x2="34" y2="30" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none" />
      <text x="19" y="38" fontSize="7" fill="currentColor" fontFamily="monospace" stroke="none" opacity="0.7">KELLY</text>
    </svg>
  );
}

export function IconCalendar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="36" height="32" rx="3" />
      <line x1="6" y1="20" x2="42" y2="20" />
      <line x1="16" y1="6" x2="16" y2="14" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <rect x="11" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.5" />
      <rect x="21" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
      <rect x="31" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.7" />
      <rect x="11" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="21" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.6" />
      <rect x="31" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
    </svg>
  );
}

export function IconMultiSport({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <path d="M6 24 Q16 18 24 24 Q32 30 42 24" />
      <path d="M6 24 Q16 30 24 24 Q32 18 42 24" opacity="0.4" />
      <line x1="24" y1="6" x2="24" y2="42" />
      <path d="M12 10 Q18 16 12 22" opacity="0.5" />
      <path d="M36 10 Q30 16 36 22" opacity="0.5" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function IconBankroll({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,38 14,26 22,30 32,16 44,8" />
      <circle cx="44" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.4" />
      <line x1="4" y1="42" x2="44" y2="42" />
      <line x1="4" y1="38" x2="4" y2="42" />
      <path d="M28 22 L32 16 L36 22" />
    </svg>
  );
}

export const FEATURE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  "odds-drops": IconOddsDrop,
  "bet-tracker": IconBetTracker,
  "bookmaker-comparison": IconBookmakerComparison,
  "stake-calculator": IconStake,
  "daily-calendar": IconCalendar,
  "multi-sport": IconMultiSport,
  "bankroll": IconBankroll,
};

// ─────────────────────────────────────────────
// Custom SVG Illustrations
// ─────────────────────────────────────────────

// Odds Drop: syndicate money hitting → line shifts down fast
function IlluSyndicateDrop() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      {/* Grid lines */}
      {[60,110,160,210,260].map(y => (
        <line key={y} x1="40" y1={y} x2="450" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      {/* Y-axis labels */}
      {[["2.40",60],["2.20",110],["2.00",160],["1.80",210],["1.60",260]].map(([v,y]) => (
        <text key={String(y)} x="32" y={Number(y)+4} fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="end" fontFamily="monospace">{v}</text>
      ))}
      {/* Stable line before drop */}
      <polyline points="40,110 160,110 170,108 180,110 200,109" stroke="rgba(0,255,255,0.5)" strokeWidth="2" fill="none"/>
      {/* The sharp drop */}
      <polyline points="200,109 220,170 230,210 240,230 260,240" stroke="#ef4444" strokeWidth="2.5" fill="none"/>
      {/* Stabilise at new level */}
      <polyline points="260,240 300,238 340,237 380,238 440,237" stroke="rgba(0,255,255,0.5)" strokeWidth="2" fill="none"/>
      {/* Drop annotation arrow */}
      <line x1="210" y1="90" x2="225" y2="135" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="3,2"/>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/>
        </marker>
      </defs>
      <rect x="150" y="68" width="140" height="18" rx="4" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"/>
      <text x="220" y="81" fontSize="9" fill="#ef4444" textAnchor="middle" fontFamily="monospace">SYNDICATE BET DETECTED</text>
      {/* Big money label */}
      <rect x="270" y="228" width="80" height="20" rx="4" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.25)" strokeWidth="1"/>
      <text x="310" y="242" fontSize="9" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace">NEW PRICE: 1.62</text>
      {/* Time axis */}
      <text x="245" y="295" fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">TIME →</text>
    </svg>
  );
}

// Odds Drop: real-time alert feed UI mockup
function IlluLiveFeed() {
  const rows = [
    { sport: "⚽", match: "Man City vs Arsenal", mkt: "1X2", drop: "−12%", odds: "2.10 → 1.85", time: "0.4s", hot: true },
    { sport: "🏀", match: "Lakers vs Celtics", mkt: "ML",  drop: "−8%",  odds: "1.95 → 1.79", time: "0.7s", hot: false },
    { sport: "🎾", match: "Djokovic vs Alcaraz", mkt: "ML", drop: "−15%", odds: "1.70 → 1.44", time: "0.2s", hot: true },
    { sport: "🏈", match: "Chiefs vs Ravens",  mkt: "Spread", drop: "−6%",  odds: "2.05 → 1.93", time: "0.9s", hot: false },
  ];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      {/* Card BG */}
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Header */}
      <rect x="12" y="12" width="456" height="36" rx="10" fill="#13131c"/>
      <circle cx="32" cy="30" r="5" fill="#22c55e"/>
      <text x="44" y="34" fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="monospace" fontWeight="bold">LIVE FEED</text>
      <text x="430" y="34" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace" textAnchor="end">21 581 markets</text>
      {/* Column headers */}
      {[["Match",80],["Market",270],["Drop",320],["Alert",390]].map(([lbl,x]) => (
        <text key={String(x)} x={Number(x)} y={64} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{lbl}</text>
      ))}
      <line x1="20" y1="68" x2="460" y2="68" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      {/* Rows */}
      {rows.map((r, i) => {
        const y = 82 + i * 52;
        const bg = r.hot ? "rgba(0,255,255,0.04)" : "transparent";
        return (
          <g key={i}>
            <rect x="14" y={y - 12} width="452" height="48" rx="4" fill={bg}/>
            {r.hot && <rect x="14" y={y - 12} width="3" height="48" rx="2" fill="hsl(186,100%,50%)"/>}
            <text x="40" y={y + 6} fontSize="13">{r.sport}</text>
            <text x="60" y={y + 6} fontSize="10" fill="rgba(255,255,255,0.85)" fontFamily="sans-serif">{r.match}</text>
            <text x="60" y={y + 22} fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="monospace">{r.odds}</text>
            <rect x="262" y={y - 5} width="38" height="14" rx="3" fill="rgba(0,200,100,0.12)" stroke="rgba(0,200,100,0.3)" strokeWidth="0.8"/>
            <text x="281" y={y + 6} fontSize="8" fill="#4ade80" textAnchor="middle" fontFamily="monospace">{r.mkt}</text>
            <rect x="308" y={y - 5} width="38" height="14" rx="3" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.3)" strokeWidth="0.8"/>
            <text x="327" y={y + 6} fontSize="8" fill="#f87171" textAnchor="middle" fontFamily="monospace">{r.drop}</text>
            <rect x="372" y={y - 5} width="44" height="14" rx="3" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.25)" strokeWidth="0.8"/>
            <text x="394" y={y + 6} fontSize="8" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace">{r.time}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Odds Drop: timing window — sharp moves, you bet, market catches up
function IlluTimingWindow() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Timeline bar */}
      <rect x="40" y="130" width="400" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>
      {/* Segments */}
      <rect x="40" y="128" width="60" height="10" rx="3" fill="hsl(186,100%,50%)" opacity="0.9"/>
      <rect x="104" y="128" width="100" height="10" rx="3" fill="#22c55e" opacity="0.8"/>
      <rect x="208" y="128" width="232" height="10" rx="3" fill="rgba(255,255,255,0.1)"/>
      {/* Labels above */}
      <text x="70" y="110" fontSize="9" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">SHARP MOVE</text>
      <line x1="70" y1="114" x2="70" y2="127" stroke="hsl(186,100%,50%)" strokeWidth="1" strokeDasharray="2,2"/>
      <text x="154" y="110" fontSize="9" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">YOUR BET</text>
      <line x1="154" y1="114" x2="154" y2="127" stroke="#22c55e" strokeWidth="1" strokeDasharray="2,2"/>
      <text x="324" y="110" fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace">MARKET CATCHES UP</text>
      {/* Labels below */}
      <text x="70" y="160" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">0 ms</text>
      <text x="104" y="160" fontSize="8" fill="hsl(186,100%,50%)" textAnchor="middle" fontFamily="monospace">400 ms</text>
      <text x="154" y="160" fontSize="8" fill="#4ade80" textAnchor="middle" fontFamily="monospace">alert</text>
      <text x="208" y="160" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">~3 s</text>
      <text x="440" y="160" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">30–90 s</text>
      {/* Brace indicating the edge window */}
      <path d="M40,185 L40,195 L204,195 L204,185" stroke="#4ade80" strokeWidth="1.5" fill="none"/>
      <text x="122" y="215" fontSize="11" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">YOUR EDGE WINDOW</text>
      {/* Prices */}
      <rect x="40" y="40" width="90" height="32" rx="6" fill="rgba(0,255,255,0.07)" stroke="rgba(0,255,255,0.2)" strokeWidth="1"/>
      <text x="85" y="54" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">SHARP PRICE</text>
      <text x="85" y="66" fontSize="13" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1.85</text>
      <rect x="148" y="40" width="90" height="32" rx="6" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
      <text x="193" y="54" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">YOUR PRICE</text>
      <text x="193" y="66" fontSize="13" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2.10</text>
      <rect x="300" y="40" width="100" height="32" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="350" y="54" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">MARKET AFTER</text>
      <text x="350" y="66" fontSize="13" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1.85</text>
      <text x="240" y="265" fontSize="9" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="monospace">TIME →</text>
    </svg>
  );
}

// Bet Tracker: Memory bias — what you think vs reality
function IlluMemoryBias() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Two columns */}
      <text x="130" y="48" fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontFamily="monospace">WHAT YOU THINK</text>
      <text x="350" y="48" fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="middle" fontFamily="monospace">WHAT ACTUALLY HAPPENED</text>
      <line x1="240" y1="24" x2="240" y2="276" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Memory bars */}
      {[["Last 10 bets",7,3,"rgba(34,197,94"],["Unit P&L","+22u","−11u","rgba(34,197,94"],["Win Rate","68%","49%","rgba(34,197,94"],["ROI","+18%","−9%","rgba(34,197,94"]].map(([label,a,b,c],i) => {
        const y = 80 + i * 52;
        const aStr = String(a);
        const bStr = String(b);
        const isGood = !bStr.startsWith("-");
        return (
          <g key={i}>
            <text x="26" y={y - 2} fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">{label}</text>
            {/* Left (memory) */}
            <rect x="26" y={y + 6} width="200" height="24" rx="4" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
            <text x="126" y={y + 23} fontSize="12" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{aStr}</text>
            {/* Right (reality) */}
            <rect x="250" y={y + 6} width="200" height="24" rx="4" fill={isGood ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.12)"} stroke={isGood ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"} strokeWidth="1"/>
            <text x="350" y={y + 23} fontSize="12" fill={isGood ? "#4ade80" : "#f87171"} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{bStr}</text>
          </g>
        );
      })}
      <text x="240" y="272" fontSize="9" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Without tracking, memory always flatters you.</text>
    </svg>
  );
}

// Bet Tracker: one-click log from feed
function IlluOneClickLog() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Feed row highlighted */}
      <rect x="24" y="36" width="432" height="64" rx="6" fill="rgba(0,255,255,0.04)" stroke="rgba(0,255,255,0.18)" strokeWidth="1"/>
      <rect x="24" y="36" width="3" height="64" rx="2" fill="hsl(186,100%,50%)"/>
      <text x="38" y="56" fontSize="11" fill="rgba(255,255,255,0.85)" fontFamily="sans-serif">⚽ Real Madrid vs Barcelona — 1X2</text>
      <text x="38" y="72" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">Odds drop:  2.40 → 2.08  (−13.3%)</text>
      <text x="38" y="88" fontSize="8" fill="hsl(186,100%,50%)" fontFamily="monospace">DETECTED 0.3s ago</text>
      {/* Log button */}
      <rect x="370" y="52" width="76" height="28" rx="5" fill="hsl(186,100%,50%)" />
      <text x="408" y="70" fontSize="11" fill="#000" textAnchor="middle" fontFamily="monospace" fontWeight="bold">+ LOG BET</text>
      {/* Arrow */}
      <line x1="240" y1="112" x2="240" y2="132" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#a2)"/>
      <defs><marker id="a2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.3)"/></marker></defs>
      {/* Modal */}
      <rect x="80" y="134" width="320" height="138" rx="8" fill="#17171f" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="240" y="154" fontSize="11" fill="rgba(255,255,255,0.7)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">LOG BET</text>
      {[["Match","Real Madrid vs Barcelona"],["Market","1X2 — Home Win"],["Odds (pre-filled)","2.08"],["Your Stake","€50"]].map(([k,v],i) => {
        const y = 170 + i * 24;
        return (
          <g key={i}>
            <text x="96" y={y} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{k}</text>
            <rect x="200" y={y - 12} width="180" height="16" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8"/>
            <text x="210" y={y} fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace">{v}</text>
          </g>
        );
      })}
      <rect x="160" y="254" width="160" height="10" rx="5" fill="hsl(186,100%,50%)" opacity="0.8"/>
      <text x="240" y="263" fontSize="9" fill="#000" textAnchor="middle" fontFamily="monospace" fontWeight="bold">SAVE BET</text>
    </svg>
  );
}

// Bet Tracker: auto-graded results table
function IlluBetTable() {
  const bets = [
    { match: "Man City vs Arsenal", odds: "2.05", stake: "€40", result: "WIN",  clv: "+4.2%", pnl: "+€42" },
    { match: "Lakers vs Celtics",   odds: "1.92", stake: "€30", result: "LOSS", clv: "+1.8%", pnl: "−€30" },
    { match: "Chiefs vs Ravens",    odds: "1.85", stake: "€50", result: "WIN",  clv: "+6.1%", pnl: "+€42" },
    { match: "Djokovic vs Sinner",  odds: "2.10", stake: "€25", result: "WIN",  clv: "+2.9%", pnl: "+€27" },
  ];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <rect x="12" y="12" width="456" height="32" rx="10" fill="#13131c"/>
      <text x="28" y="32" fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="monospace" fontWeight="bold">BET TRACKER</text>
      <text x="440" y="32" fontSize="10" fill="#4ade80" fontFamily="monospace" textAnchor="end" fontWeight="bold">P&L: +€81</text>
      {/* Headers */}
      {[["Match",28],["Odds",250],["Result",310],["CLV",375],["P&L",440]].map(([l,x]) => (
        <text key={String(x)} x={Number(x)} y={62} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{l}</text>
      ))}
      <line x1="20" y1="66" x2="460" y2="66" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {bets.map((b,i) => {
        const y = 84 + i * 50;
        const win = b.result === "WIN";
        return (
          <g key={i}>
            <text x="28" y={y + 4} fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif">{b.match}</text>
            <text x="28" y={y + 19} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">Stake {b.stake}  ·  Odds {b.odds}</text>
            <rect x="298" y={y - 7} width="40" height="16" rx="4"
              fill={win ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)"}
              stroke={win ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"} strokeWidth="0.8"/>
            <text x="318" y={y + 6} fontSize="8" fill={win ? "#4ade80" : "#f87171"} textAnchor="middle" fontFamily="monospace" fontWeight="bold">{b.result}</text>
            <text x="375" y={y + 4} fontSize="9" fill="hsl(186,100%,60%)" fontFamily="monospace">{b.clv}</text>
            <text x="440" y={y + 4} fontSize="10" fill={b.pnl.startsWith("+") ? "#4ade80" : "#f87171"} fontFamily="monospace" fontWeight="bold" textAnchor="end">{b.pnl}</text>
            <line x1="20" y1={y + 28} x2="460" y2={y + 28} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          </g>
        );
      })}
    </svg>
  );
}

// CLV: closing line comparison visual
function IlluClosingLine() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="44" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">CLOSING LINE VALUE EXPLAINED</text>
      {/* Timeline */}
      <line x1="60" y1="150" x2="420" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      {/* Bet placed */}
      <circle cx="120" cy="150" r="6" fill="hsl(186,100%,50%)"/>
      <line x1="120" y1="110" x2="120" y2="144" stroke="hsl(186,100%,50%)" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="60" y="80" width="120" height="28" rx="5" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.25)" strokeWidth="1"/>
      <text x="120" y="93" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">BET PLACED</text>
      <text x="120" y="105" fontSize="13" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">2.20</text>
      {/* Game start / close */}
      <circle cx="360" cy="150" r="6" fill="#ef4444" opacity="0.8"/>
      <line x1="360" y1="110" x2="360" y2="144" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2"/>
      <rect x="300" y="80" width="120" height="28" rx="5" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.25)" strokeWidth="1"/>
      <text x="360" y="93" fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">CLOSING LINE</text>
      <text x="360" y="105" fontSize="13" fill="#f87171" textAnchor="middle" fontFamily="monospace" fontWeight="bold">1.95</text>
      {/* CLV arrow */}
      <line x1="120" y1="180" x2="360" y2="180" stroke="#4ade80" strokeWidth="2" markerEnd="url(#a3)"/>
      <defs><marker id="a3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4ade80"/></marker></defs>
      <rect x="185" y="186" width="110" height="22" rx="5" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
      <text x="240" y="201" fontSize="11" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">+CLV: +12.8%</text>
      {/* Explanation */}
      <text x="240" y="245" fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace">You got 2.20. Market closed at 1.95.</text>
      <text x="240" y="260" fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="middle" fontFamily="monospace">You beat the market by 12.8% → positive CLV</text>
      <text x="240" y="276" fontSize="9" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">That is a sign of long-term skill.</text>
    </svg>
  );
}

// CLV: lucky vs skilled bettor scatter plot
function IlluLuckyVsSkilled() {
  const lucky = [[50,55],[120,40],[160,65],[80,35],[200,50],[240,60],[180,30],[300,45],[280,70],[320,35]];
  const skilled = [[50,100],[80,130],[120,155],[160,190],[200,210],[240,240],[280,265],[320,280],[360,295]];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Axes */}
      <line x1="50" y1="270" x2="440" y2="270" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <line x1="50" y1="20" x2="50" y2="270" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <text x="245" y="292" fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">NUMBER OF BETS →</text>
      <text x="16" y="145" fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace" transform="rotate(-90,16,145)">BANKROLL</text>
      {/* Lucky bettor - jagged line staying flat */}
      <polyline points={lucky.map(([x,y]) => `${x+50},${270-y}`).join(" ")} stroke="#f87171" strokeWidth="2" fill="none" strokeDasharray="5,3"/>
      {/* Skilled bettor - steady upward slope */}
      <polyline points={skilled.map(([x,y]) => `${x+50},${270-y}`).join(" ")} stroke="#4ade80" strokeWidth="2.5" fill="none"/>
      {/* Legend */}
      <line x1="60" y1="40" x2="90" y2="40" stroke="#f87171" strokeWidth="2" strokeDasharray="5,3"/>
      <text x="96" y="44" fontSize="9" fill="#f87171" fontFamily="monospace">Lucky bettor (negative CLV)</text>
      <line x1="60" y1="58" x2="90" y2="58" stroke="#4ade80" strokeWidth="2.5"/>
      <text x="96" y="62" fontSize="9" fill="#4ade80" fontFamily="monospace">Skilled bettor (positive CLV)</text>
      <text x="245" y="245" fontSize="9" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Same win rate over 200 bets — very different futures.</text>
    </svg>
  );
}

// CLV: expected value calculation
function IlluExpectedValue() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="42" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">EXPECTED VALUE CALCULATION</text>
      {/* True probability bar */}
      <text x="28" y="76" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">True Win Probability</text>
      <rect x="28" y="82" width="424" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="28" y="82" width={424*0.55} height="28" rx="4" fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.4)" strokeWidth="1"/>
      <text x={28+424*0.55/2} y="101" fontSize="11" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">55%</text>
      {/* Implied probability bar */}
      <text x="28" y="134" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace">Implied by Odds (2.00)</text>
      <rect x="28" y="140" width="424" height="28" rx="4" fill="rgba(255,255,255,0.04)"/>
      <rect x="28" y="140" width={424*0.50} height="28" rx="4" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.35)" strokeWidth="1"/>
      <text x={28+424*0.50/2} y="159" fontSize="11" fill="#f87171" textAnchor="middle" fontFamily="monospace" fontWeight="bold">50%</text>
      {/* Gap annotation */}
      <rect x={28+424*0.50} y="82" width={424*0.05} height="86" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.3)" strokeWidth="1"/>
      <text x={28+424*0.525} y="134" fontSize="8" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" transform={`rotate(-90,${28+424*0.525},134)`}>GAP = EDGE</text>
      {/* EV result */}
      <rect x="80" y="192" width="320" height="56" rx="8" fill="rgba(34,197,94,0.07)" stroke="rgba(34,197,94,0.25)" strokeWidth="1.5"/>
      <text x="240" y="218" fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">EV per €100 bet</text>
      <text x="240" y="240" fontSize="18" fill="#4ade80" textAnchor="middle" fontFamily="monospace" fontWeight="bold">+€10.00</text>
      <text x="240" y="268" fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">(0.55 × €100) − (0.45 × €100) = +€10 expected profit per bet</text>
    </svg>
  );
}

// Stake: Kelly formula visual
function IlluKellyFormula() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="44" fontSize="11" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">KELLY CRITERION</text>
      {/* Formula */}
      <rect x="60" y="58" width="360" height="58" rx="8" fill="rgba(0,255,255,0.05)" stroke="rgba(0,255,255,0.2)" strokeWidth="1"/>
      <text x="240" y="80" fontSize="16" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">f* = (b·p − q) / b</text>
      <text x="240" y="100" fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">fraction of bankroll to bet</text>
      {/* Variable explanations */}
      {[
        ["b", "Decimal odds minus 1", "1.85 − 1 = 0.85"],
        ["p", "Your estimated win probability", "0.58"],
        ["q", "Loss probability (1 − p)", "0.42"],
        ["f*", "Optimal bet fraction", "12.9% of bankroll"],
      ].map(([v, label, val], i) => {
        const y = 138 + i * 38;
        return (
          <g key={i}>
            <rect x="28" y={y - 12} width="424" height="30" rx="4" fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}/>
            <rect x="28" y={y - 10} width="22" height="22" rx="3" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.2)" strokeWidth="0.8"/>
            <text x="39" y={y + 6} fontSize="11" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{v}</text>
            <text x="60" y={y + 5} fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="monospace"> = {label}</text>
            <text x="440" y={y + 5} fontSize="9" fill="rgba(255,255,255,0.7)" fontFamily="monospace" textAnchor="end" fontWeight="bold">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Stake: Full vs half Kelly bankroll simulation
function IlluKellyVariants() {
  // Simulate two paths using fixed pseudo-random pattern
  const fullKelly = [10000];
  const halfKelly = [10000];
  const outcomes = [1,1,-1,1,-1,-1,1,1,1,-1,1,1,-1,1,1,1,-1,1,-1,1,1,1,-1,-1,1,1,1,-1,1,1];
  for (const o of outcomes) {
    const lastFull = fullKelly[fullKelly.length - 1];
    const lastHalf = halfKelly[halfKelly.length - 1];
    const fFull = 0.12;
    const fHalf = 0.06;
    fullKelly.push(Math.max(0, lastFull * (1 + (o > 0 ? 0.85 * fFull : -fFull))));
    halfKelly.push(Math.max(0, lastHalf * (1 + (o > 0 ? 0.85 * fHalf : -fHalf))));
  }
  const maxVal = Math.max(...fullKelly, ...halfKelly);
  const minVal = Math.min(...fullKelly, ...halfKelly);
  const range = maxVal - minVal || 1;
  const toY = (v: number) => 240 - ((v - minVal) / range) * 200;
  const toX = (i: number) => 40 + (i / (fullKelly.length - 1)) * 400;
  const fullPts = fullKelly.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const halfPts = halfKelly.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="38" fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">SAME EDGE — DIFFERENT KELLY FRACTION</text>
      <line x1="40" y1="240" x2="440" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <line x1="40" y1="40" x2="40" y2="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <polyline points={fullPts} stroke="#f87171" strokeWidth="2" fill="none"/>
      <polyline points={halfPts} stroke="#4ade80" strokeWidth="2" fill="none"/>
      <line x1="56" y1="58" x2="86" y2="58" stroke="#f87171" strokeWidth="2"/>
      <text x="92" y="62" fontSize="9" fill="#f87171" fontFamily="monospace">Full Kelly (high variance)</text>
      <line x1="56" y1="74" x2="86" y2="74" stroke="#4ade80" strokeWidth="2"/>
      <text x="92" y="78" fontSize="9" fill="#4ade80" fontFamily="monospace">Half Kelly (smoother growth)</text>
      <text x="240" y="270" fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Both profitable — Half Kelly has less drawdown risk</text>
    </svg>
  );
}

// Stake: disciplined vs emotional bettor bankroll
function IlluDisciplineVsEmotion() {
  const disciplined = [100,102,104,103,106,108,107,110,112,114,113,116,118,117,120,122,121,124,126,128];
  const emotional = [100,105,115,90,130,80,60,100,140,70,40,90,110,60,80,110,70,50,90,120];
  const toY = (v: number) => 260 - ((v - 30) / 120) * 210;
  const toX = (i: number) => 40 + (i / 19) * 400;
  const dPts = disciplined.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const ePts = emotional.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="38" fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">DISCIPLINE vs EMOTION OVER 20 BETS</text>
      <line x1="40" y1="260" x2="440" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <polyline points={ePts} stroke="#f87171" strokeWidth="2" fill="none" strokeDasharray="5,3"/>
      <polyline points={dPts} stroke="#4ade80" strokeWidth="2.5" fill="none"/>
      <line x1="56" y1="58" x2="86" y2="58" stroke="#f87171" strokeWidth="2" strokeDasharray="5,3"/>
      <text x="92" y="62" fontSize="9" fill="#f87171" fontFamily="monospace">Emotional bettor (chasing losses)</text>
      <line x1="56" y1="74" x2="86" y2="74" stroke="#4ade80" strokeWidth="2.5"/>
      <text x="92" y="78" fontSize="9" fill="#4ade80" fontFamily="monospace">Kelly bettor (systematic sizing)</text>
      <text x="240" y="285" fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Remove emotion. The formula decides.</text>
    </svg>
  );
}

// Calendar: P&L heatmap
function IlluCalendarHeatmap() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weeks = 5;
  const vals = [
    3,-2,5,-1,4,8,-3,
    2,6,-4,3,-2,5,7,
    -1,4,2,-5,6,-3,2,
    5,-2,8,3,-1,4,-2,
    1,3,-2,5,2,-4,6,
  ];
  const color = (v: number) => v > 5 ? "#166534" : v > 2 ? "#16a34a" : v > 0 ? "#4ade80" : v > -3 ? "#ef4444" : "#991b1b";
  const opacity = (v: number) => Math.min(0.9, 0.3 + Math.abs(v) * 0.1);
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="40" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">DAILY P&L CALENDAR — APRIL 2026</text>
      {days.map((d, i) => (
        <text key={d} x={54 + i * 60} y="62" fontSize="9" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">{d}</text>
      ))}
      {Array.from({length: weeks}).map((_, week) =>
        Array.from({length: 7}).map((_, day) => {
          const idx = week * 7 + day;
          const v = vals[idx] ?? 0;
          const x = 24 + day * 60;
          const y = 70 + week * 42;
          return (
            <g key={idx}>
              <rect x={x} y={y} width="54" height="34" rx="4" fill={color(v)} opacity={opacity(v)}/>
              <text x={x+27} y={y+14} fontSize="8" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">{idx + 1}</text>
              <text x={x+27} y={y+27} fontSize="9" fill="white" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                {v > 0 ? `+${v}u` : `${v}u`}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// Calendar: streak highlight on calendar
function IlluStreakCalendar() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="40" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">STREAK ANALYSIS</text>
      {/* Running P&L line */}
      <line x1="40" y1="220" x2="440" y2="220" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <polyline
        points="40,180 70,175 100,165 130,170 160,155 190,145 220,140 250,160 280,175 310,190 340,200 370,195 400,185 430,175"
        stroke="hsl(186,100%,50%)" strokeWidth="2" fill="none"
      />
      {/* Loss streak highlight */}
      <rect x="238" y="100" width="120" height="128" rx="4" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.25)" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="298" y="122" fontSize="9" fill="#f87171" textAnchor="middle" fontFamily="monospace">LOSING STREAK</text>
      <text x="298" y="135" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">−40 units over 12 bets</text>
      {/* Win streak highlight */}
      <rect x="38" y="115" width="180" height="113" rx="4" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" strokeDasharray="4,3"/>
      <text x="128" y="133" fontSize="9" fill="#4ade80" textAnchor="middle" fontFamily="monospace">WIN STREAK</text>
      <text x="128" y="146" fontSize="8" fill="rgba(255,255,255,0.3)" textAnchor="middle" fontFamily="monospace">+40 units over 9 bets</text>
      {/* Baseline */}
      <line x1="40" y1="175" x2="440" y2="175" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="6,4"/>
      <text x="445" y="178" fontSize="8" fill="rgba(255,255,255,0.2)" fontFamily="monospace">avg</text>
      <text x="240" y="260" fontSize="9" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Streaks are normal — the calendar makes them visible.</text>
    </svg>
  );
}

// Calendar: sport breakdown bar chart
function IlluSportBreakdown() {
  const sports = [
    { name: "⚽ Soccer",     val: 42,  color: "#4ade80" },
    { name: "🏀 NBA",        val: 18,  color: "#4ade80" },
    { name: "🏈 NFL",        val: -12, color: "#ef4444" },
    { name: "🎾 Tennis",     val: 28,  color: "#4ade80" },
    { name: "🏒 NHL",        val: -5,  color: "#ef4444" },
    { name: "⚾ Baseball",   val: 8,   color: "#4ade80" },
  ];
  const maxAbs = 42;
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="40" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">P&L BY SPORT — LAST 90 DAYS (UNITS)</text>
      <line x1="160" y1="54" x2="160" y2="270" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {sports.map((s, i) => {
        const y = 62 + i * 36;
        const barW = Math.abs(s.val) / maxAbs * 240;
        const positive = s.val >= 0;
        return (
          <g key={i}>
            <text x="154" y={y + 12} fontSize="10" fill="rgba(255,255,255,0.7)" textAnchor="end" fontFamily="sans-serif">{s.name}</text>
            <rect x={positive ? 164 : 164 - barW} y={y} width={barW} height="22" rx="3" fill={s.color} opacity="0.25"/>
            <rect x={positive ? 164 : 164 - barW} y={y} width={barW} height="22" rx="3" fill="none" stroke={s.color} strokeWidth="1" opacity="0.5"/>
            <text x={positive ? 164 + barW + 6 : 164 - barW - 6} y={y + 15} fontSize="10" fill={s.color} fontFamily="monospace" fontWeight="bold" textAnchor={positive ? "start" : "end"}>
              {s.val > 0 ? `+${s.val}u` : `${s.val}u`}
            </text>
          </g>
        );
      })}
      <text x="240" y="288" fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Focus on your winning sports. Reduce where you're bleeding.</text>
    </svg>
  );
}

// Multi-sport: live feed with sport filters
function IlluMultiSportFeed() {
  const filters = ["All","⚽ Soccer","🏀 NBA","🏈 NFL","🎾 Tennis","🏒 NHL","⚾ MLB"];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Filter tabs */}
      {filters.map((f, i) => {
        const x = 20 + i * 64;
        const active = i === 0;
        return (
          <g key={i}>
            <rect x={x} y="24" width="58" height="22" rx="4"
              fill={active ? "hsl(186,100%,50%)" : "rgba(255,255,255,0.04)"}
              stroke={active ? "none" : "rgba(255,255,255,0.08)"} strokeWidth="0.8"/>
            <text x={x+29} y="39" fontSize="8" fill={active ? "#000" : "rgba(255,255,255,0.45)"} textAnchor="middle" fontFamily="monospace" fontWeight={active ? "bold" : "normal"}>{f}</text>
          </g>
        );
      })}
      {/* Feed rows */}
      {[
        ["⚽","PSG vs Dortmund","1X2","−10%","1.88→1.69"],
        ["🏀","Warriors vs Bucks","ML","−7%","2.10→1.95"],
        ["🎾","Sinner vs Medvedev","ML","−18%","1.55→1.28"],
        ["🏒","Bruins vs Rangers","ML","−5%","1.95→1.86"],
        ["🏈","Cowboys vs Eagles","Spread","−9%","2.05→1.87"],
      ].map((r,i) => {
        const y = 62 + i * 45;
        return (
          <g key={i}>
            <rect x="14" y={y - 6} width="452" height="38" rx="4" fill={i===0||i===2 ? "rgba(0,255,255,0.03)" : "transparent"} stroke={i===0||i===2 ? "rgba(0,255,255,0.08)" : "none"} strokeWidth="0.5"/>
            <text x="26" y={y+12} fontSize="14">{r[0]}</text>
            <text x="50" y={y+10} fontSize="10" fill="rgba(255,255,255,0.8)" fontFamily="sans-serif">{r[1]}</text>
            <text x="50" y={y+24} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{r[4]}</text>
            <rect x="280" y={y-2} width="36" height="14" rx="3" fill="rgba(255,255,255,0.05)"/>
            <text x="298" y={y+8} fontSize="8" fill="rgba(255,255,255,0.4)" textAnchor="middle" fontFamily="monospace">{r[2]}</text>
            <rect x="326" y={y-2} width="40" height="14" rx="3" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.25)" strokeWidth="0.8"/>
            <text x="346" y={y+8} fontSize="8" fill="#f87171" textAnchor="middle" fontFamily="monospace">{r[3]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Multi-sport: soccer league depth
function IlluSoccerLeagues() {
  const leagues = [
    "Premier League · England","La Liga · Spain","Bundesliga · Germany","Serie A · Italy",
    "Ligue 1 · France","Eredivisie · Netherlands","Allsvenskan · Sweden","Champions League",
    "Europa League","Brasileirão · Brazil","MLS · USA","J.League · Japan","+ 90 more…",
  ];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="40" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">100+ SOCCER LEAGUES MONITORED</text>
      {leagues.map((l, i) => {
        const col = i < 7 ? 0 : 1;
        const row = i < 7 ? i : i - 7;
        const x = 28 + col * 230;
        const y = 60 + row * 33;
        const last = l.startsWith("+");
        return (
          <g key={i}>
            <rect x={x} y={y} width="210" height="24" rx="4"
              fill={last ? "rgba(0,255,255,0.05)" : "rgba(255,255,255,0.02)"}
              stroke={last ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.06)"} strokeWidth="0.8"/>
            {!last && <circle cx={x+12} cy={y+12} r="3" fill="#22c55e" opacity="0.6"/>}
            <text x={x+(last?105:22)} y={y+15} fontSize="9"
              fill={last ? "hsl(186,100%,60%)" : "rgba(255,255,255,0.6)"}
              fontFamily="monospace" textAnchor={last ? "middle" : "start"}>{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Multi-sport: sharp price vs recreational book comparison
function IlluSharpVsRec() {
  const events = [
    { match: "Real Madrid vs Chelsea", sharp: "1.74", rec: "1.80", sharp2: "5.10", rec2: "4.80" },
    { match: "Bayern vs Inter",        sharp: "1.92", rec: "2.00", sharp2: "3.75", rec2: "3.50" },
    { match: "Arsenal vs PSG",         sharp: "2.15", rec: "2.25", sharp2: "3.30", rec2: "3.10" },
  ];
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="36" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">SHARP PRICE vs RECREATIONAL BOOK</text>
      {/* Column headers */}
      {[["Match",24],["Sharp (Home)",220],["Rec (Home)",310],["Sharp (Away)",370],["Rec (Away)",440]].map(([l,x])=>(
        <text key={String(x)} x={Number(x)} y="58" fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace" textAnchor={Number(x)>100?"middle":"start"}>{l}</text>
      ))}
      <line x1="16" y1="63" x2="464" y2="63" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {events.map((e, i) => {
        const y = 84 + i * 70;
        const sharpN = parseFloat(e.sharp), recN = parseFloat(e.rec);
        const diff = ((sharpN / recN) - 1) * 100;
        return (
          <g key={i}>
            <text x="24" y={y} fontSize="10" fill="rgba(255,255,255,0.75)" fontFamily="sans-serif">{e.match}</text>
            {/* Sharp price */}
            <rect x="196" y={y+8} width="48" height="24" rx="4" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.2)" strokeWidth="0.8"/>
            <text x="220" y={y+24} fontSize="12" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{e.sharp}</text>
            {/* Rec price */}
            <rect x="286" y={y+8} width="48" height="24" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
            <text x="310" y={y+24} fontSize="12" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">{e.rec}</text>
            {/* Spread indicator */}
            <text x="345" y={y+22} fontSize="8" fill="#f87171" fontFamily="monospace" textAnchor="middle">{diff > 0 ? `rec+${diff.toFixed(1)}%` : ""}</text>
            {/* Away */}
            <rect x="348" y={y+8} width="44" height="24" rx="4" fill="rgba(0,255,255,0.08)" stroke="rgba(0,255,255,0.2)" strokeWidth="0.8"/>
            <text x="370" y={y+24} fontSize="12" fill="hsl(186,100%,60%)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">{e.sharp2}</text>
            <rect x="416" y={y+8} width="44" height="24" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
            <text x="438" y={y+24} fontSize="12" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">{e.rec2}</text>
          </g>
        );
      })}
      <text x="240" y="286" fontSize="8" fill="rgba(255,255,255,0.2)" textAnchor="middle" fontFamily="monospace">Sharp prices = true market odds. Recreational prices include margin.</text>
    </svg>
  );
}

// Bankroll: compound growth curve
function IlluCompoundGrowth() {
  const bets = 30;
  const start = 10000;
  const edge = 1.018;
  const data = Array.from({length: bets + 1}, (_, i) => start * Math.pow(edge, i));
  const flat = Array.from({length: bets + 1}, () => start);
  const maxV = data[data.length - 1];
  const toY = (v: number) => 240 - ((v - start * 0.95) / (maxV - start * 0.95)) * 190;
  const toX = (i: number) => 40 + (i / bets) * 400;
  const pts = data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const fpts = flat.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="38" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">BANKROLL COMPOUNDING WITH A SMALL EDGE</text>
      {[0.25,0.5,0.75].map(f => {
        const y = toY(start + (maxV - start) * f);
        return <line key={f} x1="40" y1={y} x2="440" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>;
      })}
      <line x1="40" y1="40" x2="40" y2="240" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="40" y1="240" x2="440" y2="240" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {/* Flat line */}
      <polyline points={fpts} stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none" strokeDasharray="5,3"/>
      {/* Growth area fill */}
      <polygon points={`${pts} ${toX(bets)},240 40,240`} fill="rgba(34,197,94,0.06)"/>
      {/* Growth line */}
      <polyline points={pts} stroke="#4ade80" strokeWidth="2.5" fill="none"/>
      {/* Annotations */}
      <text x="48" y={toY(start) - 6} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">€10,000</text>
      <text x={toX(bets) + 4} y={toY(maxV) + 4} fontSize="9" fill="#4ade80" fontFamily="monospace" fontWeight="bold">€{Math.round(maxV).toLocaleString()}</text>
      <text x="200" y="265" fontSize="9" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="monospace">500 bets at 1.8% edge → consistent bankroll growth</text>
      <line x1="56" y1="58" x2="86" y2="58" stroke="#4ade80" strokeWidth="2"/>
      <text x="92" y="62" fontSize="9" fill="#4ade80" fontFamily="monospace">+EV betting (compounding)</text>
      <line x1="56" y1="74" x2="86" y2="74" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,3"/>
      <text x="92" y="78" fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="monospace">Break-even baseline</text>
    </svg>
  );
}

// Bankroll: SharpTracker users vs average bettor over 12 months
function IlluSharpVsAverage() {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sharp = [100,112,108,125,138,145,132,155,168,162,178,199];
  const avg = [100,97,93,90,88,85,82,80,76,73,70,68];
  const toY = (v: number) => 240 - ((v - 60) / 150) * 180;
  const toX = (i: number) => 44 + i * 36;
  const sPts = sharp.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const aPts = avg.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="38" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">SHARPTRACKER USERS vs AVERAGE BETTOR</text>
      <line x1="44" y1="240" x2="440" y2="240" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <line x1="44" y1="40" x2="44" y2="240" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      {months.map((m, i) => (
        <text key={m} x={toX(i)} y="256" fontSize="7" fill="rgba(255,255,255,0.25)" textAnchor="middle" fontFamily="monospace">{m}</text>
      ))}
      {/* Average area */}
      <polygon points={`${aPts} 440,240 44,240`} fill="rgba(239,68,68,0.05)"/>
      <polyline points={aPts} stroke="#f87171" strokeWidth="2" fill="none" strokeDasharray="5,3"/>
      {/* Sharp area */}
      <polygon points={`${sPts} 440,240 44,240`} fill="rgba(34,197,94,0.06)"/>
      <polyline points={sPts} stroke="#4ade80" strokeWidth="2.5" fill="none"/>
      {/* End labels */}
      <text x="443" y={toY(199)} fontSize="9" fill="#4ade80" fontFamily="monospace" fontWeight="bold">+99%</text>
      <text x="443" y={toY(68)} fontSize="9" fill="#f87171" fontFamily="monospace" fontWeight="bold">−32%</text>
      <line x1="56" y1="58" x2="86" y2="58" stroke="#4ade80" strokeWidth="2"/>
      <text x="92" y="62" fontSize="9" fill="#4ade80" fontFamily="monospace">SharpTracker users</text>
      <line x1="56" y1="74" x2="86" y2="74" stroke="#f87171" strokeWidth="2" strokeDasharray="5,3"/>
      <text x="92" y="78" fontSize="9" fill="#f87171" fontFamily="monospace">Average bettor</text>
    </svg>
  );
}

// Bankroll: Risk of ruin gauge + Kelly sizing
function IlluRiskOfRuin() {
  return (
    <svg viewBox="0 0 480 300" className="w-full h-full" style={{ background: "#0c0c14" }}>
      <rect x="12" y="12" width="456" height="276" rx="10" fill="#111118" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
      <text x="240" y="38" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle" fontFamily="monospace">BANKROLL PROTECTION</text>
      {/* Gauge arc */}
      <path d="M 100 200 A 120 120 0 0 1 380 200" stroke="rgba(255,255,255,0.08)" strokeWidth="20" fill="none" strokeLinecap="round"/>
      {/* Colour zones */}
      <path d="M 100 200 A 120 120 0 0 1 180 94" stroke="#4ade80" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M 180 94 A 120 120 0 0 1 280 88" stroke="#eab308" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M 280 88 A 120 120 0 0 1 380 200" stroke="#ef4444" strokeWidth="20" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Needle */}
      <line x1="240" y1="200" x2="164" y2="106" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="240" cy="200" r="8" fill="#17171f" stroke="white" strokeWidth="2"/>
      <text x="110" y="228" fontSize="8" fill="#4ade80" fontFamily="monospace">SAFE</text>
      <text x="226" y="78" fontSize="8" fill="#eab308" fontFamily="monospace">WARN</text>
      <text x="350" y="228" fontSize="8" fill="#ef4444" fontFamily="monospace">DANGER</text>
      {/* Stats */}
      {[
        ["Bankroll","€12 400"],
        ["Kelly Stake","2.1% = €260"],
        ["Risk of Ruin","< 1%"],
        ["Edge Estimate","+1.8%"],
      ].map(([k,v],i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const x = 40 + col * 220; const y = 248 + row * 26;
        return (
          <g key={i}>
            <text x={x} y={y} fontSize="8" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{k}</text>
            <text x={x+100} y={y} fontSize="9" fill="rgba(255,255,255,0.75)" fontFamily="monospace" fontWeight="bold">{v}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Shared page layout components
// ─────────────────────────────────────────────

function FeatureNav({ title }: { title: string }) {
  const { lang } = useLang();
  const tp = tPages(lang);
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">{tp.back}</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-sans font-bold text-lg tracking-tight">Sharp<span className="text-primary">Tracker</span></span>
        </Link>
        <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-md font-mono text-sm transition-all">
          {tp.getAccess}
        </button>
      </div>
    </nav>
  );
}

function FeatureHero({
  icon: Icon,
  label,
  title,
  subtitle,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="pt-32 pb-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[100px]" />
      <div className="container mx-auto px-6 relative text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Icon className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight mb-6 text-foreground">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-foreground/65 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContentBlock({
  tag,
  heading,
  body,
  visual,
  imageRight = false,
  dark = false,
}: {
  tag: string;
  heading: string;
  body: string;
  visual: React.ReactNode;
  imageRight?: boolean;
  dark?: boolean;
}) {
  return (
    <section className={`py-20 ${dark ? "bg-card/60 border-y border-border/20" : "bg-background"}`}>
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${imageRight ? "md:flex-row" : "md:flex-row-reverse"} gap-12 md:gap-20 items-center`}>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: imageRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest mb-3 block">{tag}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mb-5 text-foreground">{heading}</h2>
            <p className="text-foreground/70 leading-relaxed text-base">{body}</p>
          </motion.div>
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: imageRight ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl overflow-hidden border border-border/40 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.8)] aspect-[16/10]">
              {visual}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="py-14 border-y border-border/20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-bold font-sans text-primary mb-1">{s.value}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCTA({ next, nextLabel }: { next: string; nextLabel: string }) {
  const { lang } = useLang();
  const tp = tPages(lang);
  return (
    <section className="py-24 bg-card border-t border-border/20">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="text-3xl font-bold font-sans mb-4">{tp.featureCta.heading}</h2>
        <p className="text-foreground/60 mb-8">{tp.featureCta.subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pricing"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-sans font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]"
          >
            {tp.featureCta.primaryBtn}
          </Link>
          <Link
            href={`/features/${next}`}
            className="border border-border/50 text-foreground/80 px-8 py-3 rounded-md text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 justify-center"
          >
            {nextLabel} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Feature Pages
// ─────────────────────────────────────────────

export function OddsDropPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.oddsDrops;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconOddsDrop}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "< 1s", label: pg.stats[0] },
        { value: "50 000+", label: pg.stats[1] },
        { value: "6", label: pg.stats[2] },
        { value: "24/7", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluSyndicateDrop />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluLiveFeed />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluTimingWindow />}
        imageRight
      />
      <FeatureCTA next="bet-tracker" nextLabel={pg.next} />
    </div>
  );
}

export function BetTrackerPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.betTracker;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconBetTracker}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "1 click", label: pg.stats[0] },
        { value: "Auto", label: pg.stats[1] },
        { value: "ROI", label: pg.stats[2] },
        { value: "CLV", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluMemoryBias />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluOneClickLog />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluBetTable />}
        imageRight
      />
      <FeatureCTA next="bookmaker-comparison" nextLabel={pg.next} />
    </div>
  );
}

function IlluBookmakerTable() {
  const cyan = "hsl(186,100%,50%)";
  const dim = "rgba(255,255,255,0.28)";
  const green = "#4ade80";
  const red = "#f87171";
  const rows = [
    { name: "Pinnacle",      odds: "2.05", delta: "—",      check: true,  sharp: true },
    { name: "Bet365",        odds: "2.00", delta: "−2.4%",  check: true,  sharp: false },
    { name: "William Hill",  odds: "1.97", delta: "−3.9%",  check: true,  sharp: false },
    { name: "Unibet",        odds: "2.02", delta: "−1.5%",  check: true,  sharp: false },
    { name: "Betsson",       odds: "—",    delta: "—",      check: false, sharp: false },
    { name: "Bwin",          odds: "1.95", delta: "−4.9%",  check: true,  sharp: false },
  ];
  return (
    <svg viewBox="0 0 480 210" className="w-full" style={{ background: "#0a0a0f" }}>
      <text x="240" y="22" fontSize="10" fill={dim} fontFamily="monospace" textAnchor="middle">Aston Villa vs Man Utd · Match Result · Moneyline</text>
      {["Bookmaker","Odds","vs Sharp"].map((h,i) => (
        <text key={h} x={[56,220,370][i]} y="40" fontSize="9" fill="rgba(255,255,255,0.38)" fontFamily="monospace" textAnchor="middle">{h}</text>
      ))}
      <line x1="20" y1="46" x2="460" y2="46" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {rows.map((r, i) => {
        const y = 62 + i * 25;
        return (
          <g key={r.name}>
            <rect x="20" y={y - 11} width="440" height="22" rx="3"
              fill={r.sharp ? "rgba(74,222,128,0.06)" : i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"} />
            {r.sharp && <rect x="20" y={y - 11} width="3" height="22" rx="1.5" fill={green} />}
            <text x="56" y={y + 4} fontSize="10" fill={r.sharp ? green : "rgba(255,255,255,0.75)"} fontFamily="monospace" textAnchor="middle">{r.name}</text>
            <text x="220" y={y + 4} fontSize="11" fill={r.check ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)"} fontFamily="monospace" textAnchor="middle" fontWeight={r.sharp ? "bold" : "normal"}>{r.odds}</text>
            {r.check
              ? <text x="370" y={y + 4} fontSize="10" fill={r.sharp ? green : r.delta.startsWith("−") ? red : green} fontFamily="monospace" textAnchor="middle">{r.sharp ? "Sharp line" : r.delta}</text>
              : <text x="370" y={y + 4} fontSize="10" fill="rgba(255,255,255,0.2)" fontFamily="monospace" textAnchor="middle">Not available</text>
            }
            <text x="452" y={y + 5} fontSize="13" fill={r.check ? green : "rgba(255,255,255,0.2)"} textAnchor="middle">{r.check ? "✓" : "✗"}</text>
          </g>
        );
      })}
    </svg>
  );
}

function IlluOddsSpread() {
  const cyan = "hsl(186,100%,50%)";
  const green = "#4ade80";
  const red = "#f87171";
  const dim = "rgba(255,255,255,0.28)";
  const books = [
    { name: "Pinnacle", odds: 2.05, x: 60 },
    { name: "Unibet",   odds: 2.02, x: 150 },
    { name: "Bet365",   odds: 2.00, x: 240 },
    { name: "Bwin",     odds: 1.97, x: 330 },
    { name: "WH",       odds: 1.95, x: 420 },
  ];
  const minO = 1.90, maxO = 2.10, range = maxO - minO;
  const barH = (o: number) => Math.round(((o - minO) / range) * 80);
  return (
    <svg viewBox="0 0 480 190" className="w-full" style={{ background: "#0a0a0f" }}>
      <text x="240" y="18" fontSize="10" fill={dim} fontFamily="monospace" textAnchor="middle">Odds spread across bookmakers — same market, same time</text>
      <line x1="30" y1="150" x2="460" y2="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      {books.map((b, i) => {
        const h = barH(b.odds);
        const isSharp = i === 0;
        return (
          <g key={b.name}>
            <rect x={b.x - 25} y={150 - h} width="50" height={h} rx="3"
              fill={isSharp ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}
              stroke={isSharp ? green : "rgba(255,255,255,0.15)"} strokeWidth="1" />
            <text x={b.x} y={150 - h - 6} fontSize="10" fill={isSharp ? green : "rgba(255,255,255,0.65)"} fontFamily="monospace" textAnchor="middle">{b.odds.toFixed(2)}</text>
            <text x={b.x} y="164" fontSize="9" fill="rgba(255,255,255,0.35)" fontFamily="monospace" textAnchor="middle">{b.name}</text>
          </g>
        );
      })}
      <line x1="30" y1={150 - barH(2.05)} x2="460" y2={150 - barH(2.05)} stroke={green} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" />
      <text x="465" y={150 - barH(2.05) + 4} fontSize="8" fill={green} fontFamily="monospace">Sharp</text>
      <text x="240" y="185" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace" textAnchor="middle">The gap between sharp and soft lines is your edge window</text>
    </svg>
  );
}

function IlluBestPriceFinder() {
  const green = "#4ade80";
  const dim = "rgba(255,255,255,0.28)";
  const cyan = "hsl(186,100%,50%)";
  return (
    <svg viewBox="0 0 480 180" className="w-full" style={{ background: "#0a0a0f" }}>
      <text x="240" y="20" fontSize="10" fill={dim} fontFamily="monospace" textAnchor="middle">Step 1 — Alert fires: Sharp line drops 3.2%</text>
      <rect x="20" y="28" width="440" height="36" rx="6" fill="rgba(74,222,128,0.07)" stroke="rgba(74,222,128,0.25)" strokeWidth="1" />
      <text x="240" y="51" fontSize="11" fill={green} fontFamily="monospace" textAnchor="middle">▼ Pinnacle: 2.18 → 2.11  (−3.2%)</text>
      <text x="240" y="80" fontSize="10" fill={dim} fontFamily="monospace" textAnchor="middle">Step 2 — Check availability at your books</text>
      {[
        { book: "Bet365", odds: "2.14", avail: true, best: true },
        { book: "Unibet", odds: "2.11", avail: true, best: false },
        { book: "Bwin",   odds: "—",   avail: false, best: false },
      ].map((b, i) => (
        <g key={b.book}>
          <rect x={20 + i * 150} y="88" width="136" height="48" rx="5"
            fill={b.best ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.03)"}
            stroke={b.best ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"} strokeWidth="1" />
          <text x={88 + i * 150} y="108" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="monospace" textAnchor="middle">{b.book}</text>
          <text x={88 + i * 150} y="128" fontSize="14" fill={b.avail ? (b.best ? green : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.2)"} fontFamily="monospace" fontWeight="bold" textAnchor="middle">{b.odds}</text>
          {b.best && <text x={88 + i * 150} y="148" fontSize="8" fill={green} fontFamily="monospace" textAnchor="middle">BEST PRICE</text>}
        </g>
      ))}
      <text x="240" y="172" fontSize="9" fill="rgba(255,255,255,0.2)" fontFamily="monospace" textAnchor="middle">Bet365 still hasn't adjusted — the window is open</text>
    </svg>
  );
}

export function BookmakerComparisonPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.bookmakerComparison;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconBookmakerComparison}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "32+", label: pg.stats[0] },
        { value: "Live", label: pg.stats[1] },
        { value: "EU · UK · US · AU", label: pg.stats[2] },
        { value: "1-Click", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluBookmakerTable />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluOddsSpread />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluBestPriceFinder />}
        imageRight
      />
      <FeatureCTA next="stake-calculator" nextLabel={pg.next} />
    </div>
  );
}

export function StakeCalculatorPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.stakeCalculator;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconStake}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "Kelly", label: pg.stats[0] },
        { value: "Full", label: pg.stats[1] },
        { value: "0%", label: pg.stats[2] },
        { value: "EV-Based", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluKellyFormula />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluKellyVariants />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluDisciplineVsEmotion />}
        imageRight
      />
      <FeatureCTA next="daily-calendar" nextLabel={pg.next} />
    </div>
  );
}

export function DailyCalendarPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.dailyCalendar;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconCalendar}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "Daily", label: pg.stats[0] },
        { value: "Streak", label: pg.stats[1] },
        { value: "Sport", label: pg.stats[2] },
        { value: "Monthly", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluCalendarHeatmap />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluStreakCalendar />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluSportBreakdown />}
        imageRight
      />
      <FeatureCTA next="multi-sport" nextLabel={pg.next} />
    </div>
  );
}

export function MultiSportPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.multiSport;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconMultiSport}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "6+", label: pg.stats[0] },
        { value: "100+", label: pg.stats[1] },
        { value: "3", label: pg.stats[2] },
        { value: "50K+", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluMultiSportFeed />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluSoccerLeagues />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluSharpVsRec />}
        imageRight
      />
      <FeatureCTA next="bankroll" nextLabel={pg.next} />
    </div>
  );
}

export function BankrollPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const pg = tp.bankroll;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title={pg.label} />
      <FeatureHero
        icon={IconBankroll}
        label={pg.label}
        title={pg.title}
        subtitle={pg.subtitle}
      />
      <StatRow stats={[
        { value: "+299u", label: pg.stats[0] },
        { value: "-150u", label: pg.stats[1] },
        { value: "+EV", label: pg.stats[2] },
        { value: "∞", label: pg.stats[3] },
      ]} />
      <ContentBlock
        tag={pg.blocks[0].tag}
        heading={pg.blocks[0].heading}
        body={pg.blocks[0].body}
        visual={<IlluCompoundGrowth />}
        imageRight
      />
      <ContentBlock
        tag={pg.blocks[1].tag}
        heading={pg.blocks[1].heading}
        body={pg.blocks[1].body}
        visual={<IlluSharpVsAverage />}
        dark
      />
      <ContentBlock
        tag={pg.blocks[2].tag}
        heading={pg.blocks[2].heading}
        body={pg.blocks[2].body}
        visual={<IlluRiskOfRuin />}
        imageRight
      />
      <FeatureCTA next="odds-drops" nextLabel={pg.next} />
    </div>
  );
}
