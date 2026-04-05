import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Activity, Check, Lock, Star, Zap } from "lucide-react";

function PricingNav() {
  const [, navigate] = useLocation();
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-sans font-bold text-lg tracking-tight text-foreground">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-md font-mono text-sm transition-all"
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
}

function PinnacleLogo() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-md px-2.5 py-1">
      <span className="w-3.5 h-3.5 rounded-sm bg-[#f5c518] flex items-center justify-center">
        <span className="text-[8px] font-black text-black leading-none">P</span>
      </span>
      <span className="text-[11px] font-bold text-white tracking-tight">Pinnacle</span>
    </span>
  );
}

function FanDuelLogo() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-md px-2.5 py-1">
      <span className="w-3.5 h-3.5 rounded-sm bg-[#1493ff] flex items-center justify-center">
        <span className="text-[8px] font-black text-white leading-none">F</span>
      </span>
      <span className="text-[11px] font-bold text-white tracking-tight">FanDuel</span>
    </span>
  );
}

type FeatureDef = { text: string; highlight?: boolean };

function FeatureLine({ text, highlight = false }: FeatureDef) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-primary" : "text-primary/60"}`} />
      <span className={`text-sm leading-snug ${highlight ? "text-foreground font-semibold" : "text-foreground/65"}`}>
        {highlight && (
          <span className="mr-1.5 inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded uppercase tracking-widest align-middle">
            <Zap className="w-2.5 h-2.5" /> key
          </span>
        )}
        {text}
      </span>
    </li>
  );
}

const SILVER_FEATURES: FeatureDef[] = [
  { text: "Dropping odds alerts", highlight: true },
  { text: "Bet Tracker" },
  { text: "Bet size calculator" },
  { text: "3 sports" },
  { text: "3 markets per sport" },
];

const GOLD_FEATURES: FeatureDef[] = [
  { text: "Everything in Silver", highlight: true },
  { text: "ALL sports — every league covered", highlight: true },
  { text: "ALL markets", highlight: true },
  { text: "Pinnacle + 1 Sharp Bookmaker" },
  { text: "Odds movement history" },
  { text: "Player props" },
  { text: "Limit change tracking" },
  { text: "Live EV in Bet Tracker", highlight: true },
  { text: "Closing EV in Bet Tracker", highlight: true },
];

export default function PricingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <PricingNav />

      <div className="pt-28 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest mb-3 block">Pricing</span>
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-4 leading-tight">
              Simple, honest pricing.
            </h1>
            <p className="text-foreground/60 text-base max-w-xl mx-auto leading-relaxed">
              Start with Silver to get the core edge. Upgrade to Gold when you're ready to go all in.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Silver */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/60 p-7 flex flex-col"
            >
              <div className="mb-5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Silver</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground font-sans">€34</span>
                  <span className="text-xl font-bold text-foreground/60 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/40 text-xs mt-0.5 font-mono">per month</p>
              </div>

              {/* Bookmaker */}
              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Bookmaker</p>
                <div className="flex flex-wrap gap-2">
                  <PinnacleLogo />
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {SILVER_FEATURES.map(f => <FeatureLine key={f.text} {...f} />)}
              </ul>

              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-lg border border-border/60 text-foreground/80 font-mono text-sm hover:border-primary/40 hover:text-primary transition-all"
              >
                Get Started
              </button>
            </motion.div>

            {/* Gold — highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="rounded-2xl border border-primary/50 bg-primary/5 p-7 flex flex-col relative shadow-[0_0_60px_rgba(0,255,255,0.1)]"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="flex items-center gap-1.5 bg-primary text-background text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  <Star className="w-3 h-3" /> Most Popular
                </span>
              </div>

              <div className="mb-5">
                <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Gold</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground font-sans">€84</span>
                  <span className="text-xl font-bold text-foreground/60 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/40 text-xs mt-0.5 font-mono">per month</p>
              </div>

              {/* Bookmakers */}
              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Bookmakers</p>
                <div className="flex flex-wrap gap-2">
                  <PinnacleLogo />
                  <FanDuelLogo />
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {GOLD_FEATURES.map(f => <FeatureLine key={f.text} {...f} />)}
              </ul>

              <button
                onClick={() => navigate("/signup")}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)]"
              >
                Get Started
              </button>
            </motion.div>

            {/* Platinum — coming soon */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="rounded-2xl border border-border/30 bg-card/30 p-7 flex flex-col opacity-55"
            >
              <div className="mb-5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Platinum</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground/40 font-sans">€114</span>
                  <span className="text-xl font-bold text-foreground/25 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/25 text-xs mt-0.5 font-mono">not yet available</p>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Bookmakers</p>
                <div className="h-7 rounded-md bg-foreground/5 border border-border/20 w-24" />
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {["Everything in Gold", "Advanced filters", "API access", "Priority support", "More coming"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/25">
                    <Lock className="w-4 h-4 mt-0.5 shrink-0 text-foreground/20" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="w-full py-3 rounded-lg border border-border/20 text-foreground/20 font-mono text-sm cursor-not-allowed"
              >
                Coming Soon
              </button>
            </motion.div>

          </div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-14"
          >
            <Link href="/" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
