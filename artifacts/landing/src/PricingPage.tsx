import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Activity, Check, Loader2, Star } from "lucide-react";
import { useUser, useAuth } from "@clerk/react";
import GoogleIcon from "./components/GoogleIcon";

function PricingNav() {
  const [, navigate] = useLocation();
  const { isSignedIn } = useUser();
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-sans font-bold text-lg tracking-tight text-foreground">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </button>
        {!isSignedIn ? (
          <button
            onClick={() => navigate("/sign-in")}
            className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-md font-mono text-sm transition-all"
          >
            <GoogleIcon size={16} />
            Sign In
          </button>
        ) : null}
      </div>
    </nav>
  );
}

function PinnacleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#002147"/>
      <path d="M9 8h8.5c3.6 0 5.5 1.8 5.5 4.8 0 3-1.9 4.9-5.5 4.9H12.8V24H9V8zm3.8 6.7h4.3c1.4 0 2.1-.7 2.1-1.9s-.7-1.8-2.1-1.8h-4.3v3.7z" fill="white"/>
    </svg>
  );
}

function BookmakerBadge({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-md px-2.5 py-1">
      {icon}
      <span className="text-[11px] font-bold text-white tracking-tight">{name}</span>
    </span>
  );
}

function LogoBadge({ dark = false }: { dark?: boolean }) {
  return dark ? (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-black/20 bg-black/20 px-2 py-1">
      <Activity className="w-3.5 h-3.5 text-black/80" />
      <span className="text-[11px] font-bold text-black/80 tracking-tight">SharpTracker</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2 py-1">
      <Activity className="w-3.5 h-3.5 text-primary" />
      <span className="text-[11px] font-bold text-primary tracking-tight">SharpTracker</span>
    </span>
  );
}

type FeatureDef = { text: string; highlight?: boolean };

function FeatureLine({ text, highlight = false }: FeatureDef) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-primary" : "text-primary/60"}`} />
      <span className={`text-sm leading-snug ${highlight ? "text-foreground font-semibold" : "text-foreground/65"}`}>
        {text}
      </span>
    </li>
  );
}

function PlatinumFeatureLine({ text, highlight = false }: FeatureDef) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? "text-violet-400" : "text-violet-400/50"}`} />
      <span className={`text-sm leading-snug ${highlight ? "text-foreground font-semibold" : "text-foreground/65"}`}>
        {text}
      </span>
    </li>
  );
}

const SILVER_FEATURES: FeatureDef[] = [
  { text: "Dropping odds alerts", highlight: true },
  { text: "3 alert configurations" },
  { text: "Bet size calculator" },
  { text: "3 sports" },
  { text: "3 markets per sport" },
  { text: "Only members Telegram group" },
];

const GOLD_FEATURES: FeatureDef[] = [
  { text: "Everything in Silver", highlight: true },
  { text: "9 alert configurations", highlight: true },
  { text: "ALL sports — every league covered", highlight: true },
  { text: "ALL markets", highlight: true },
  { text: "Bet Tracker & Bet Stats", highlight: true },
  { text: "Odds movement history" },
  { text: "Live EV in Bet Tracker" },
  { text: "Closing EV in Bet Tracker" },
];

const PLATINUM_FEATURES: FeatureDef[] = [
  { text: "Everything in Gold", highlight: true },
  { text: "20 alert configurations", highlight: true },
  { text: "Bookmaker comparison" },
  { text: "Push notifications on app", highlight: true },
  { text: "Current CLV & Current CV" },
];

function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [, navigate] = useLocation();

  const startCheckout = async (plan: string) => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, redirectAfter: "/pricing" }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  return { startCheckout, loadingPlan, error };
}

export default function PricingPage() {
  const { startCheckout, loadingPlan, error } = useCheckout();
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <PricingNav />

      <div className="pt-28 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              14-day free trial included
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-0 leading-tight">
              Pricing
            </h1>
            <p className="text-foreground/50 text-sm font-mono mt-3">
              Card required · No charge during trial · Cancel anytime
            </p>
          </motion.div>

          {error && (
            <div className="mb-8 text-center text-sm font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 items-start">

            {/* Silver */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/60 p-7 flex flex-col"
            >
              <div className="mb-5">
                <span className="text-xl font-bold tracking-wide" style={{ color: "#9ca3af" }}>Silver</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground font-sans">€34</span>
                  <span className="text-xl font-bold text-foreground/60 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/40 text-xs mt-0.5 font-mono">per month</p>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Bookmaker</p>
                <div className="flex flex-wrap gap-2">
                  <BookmakerBadge name="Pinnacle" icon={<PinnacleIcon />} />
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {SILVER_FEATURES.map(f => <FeatureLine key={f.text} {...f} />)}
              </ul>

              <button
                onClick={() => startCheckout("silver")}
                disabled={loadingPlan !== null}
                className="w-full py-3 rounded-lg border border-border/60 text-foreground/80 font-mono text-sm text-center transition-colors hover:bg-white/5 hover:border-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogoBadge />
                {loadingPlan === "silver" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSignedIn ? "Try 14 Days Free" : "Get Started"}
              </button>
            </motion.div>

            {/* Gold */}
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
                <span className="text-xl font-bold tracking-wide" style={{ color: "#f59e0b" }}>Gold</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground font-sans">€84</span>
                  <span className="text-xl font-bold text-foreground/60 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/40 text-xs mt-0.5 font-mono">per month</p>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Bookmaker</p>
                <div className="flex flex-wrap gap-2">
                  <BookmakerBadge name="Pinnacle" icon={<PinnacleIcon />} />
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {GOLD_FEATURES.map(f => <FeatureLine key={f.text} {...f} />)}
              </ul>

              <button
                onClick={() => startCheckout("gold")}
                disabled={loadingPlan !== null}
                className="w-full py-3 rounded-lg bg-primary text-background font-mono text-sm font-semibold text-center transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogoBadge dark />
                {loadingPlan === "gold" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSignedIn ? "Try 14 Days Free" : "Get Started"}
              </button>
            </motion.div>

            {/* Platinum */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="rounded-2xl border border-violet-500/40 bg-violet-500/5 p-7 flex flex-col shadow-[0_0_50px_rgba(139,92,246,0.08)]"
            >
              <div className="mb-5">
                <span className="text-xl font-bold tracking-wide text-violet-400">Platinum</span>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground font-sans">€114</span>
                  <span className="text-xl font-bold text-foreground/60 font-sans mb-0.5">.99</span>
                </div>
                <p className="text-foreground/40 text-xs mt-0.5 font-mono">per month</p>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Bookmaker</p>
                <div className="flex flex-wrap gap-2">
                  <BookmakerBadge name="Pinnacle" icon={<PinnacleIcon />} />
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {PLATINUM_FEATURES.map(f => <PlatinumFeatureLine key={f.text} {...f} />)}
              </ul>

              <button
                onClick={() => startCheckout("platinum")}
                disabled={loadingPlan !== null}
                className="w-full py-3 rounded-lg border border-violet-500/40 text-violet-300 font-mono text-sm text-center transition-colors hover:bg-violet-500/10 hover:border-violet-500/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogoBadge />
                {loadingPlan === "platinum" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSignedIn ? "Try 14 Days Free" : "Get Started"}
              </button>
            </motion.div>

          </div>

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
