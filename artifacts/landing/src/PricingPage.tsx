import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Activity, Check, Loader2, Star } from "lucide-react";
import { useAppAuth } from "@/lib/auth-context";
import GoogleIcon from "./components/GoogleIcon";

function PricingNav() {
  const [, navigate] = useLocation();
  const { isSignedIn } = useAppAuth();
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
            onClick={() => { window.location.href = "/app/sign-in"; }}
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

function useTrialStatus() {
  const { isSignedIn, isLoaded, getToken } = useAppAuth();
  const [trialUsed, setTrialUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLoading(false); return; }
    let stale = false;
    const token = getToken();
    fetch("/api/stripe/subscription", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then(r => r.json())
      .then(data => {
        if (!stale) {
          setTrialUsed(data.trialUsed === true);
          setLoading(false);
        }
      })
      .catch(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [isSignedIn, isLoaded, getToken]);

  return { trialUsed, loading };
}

function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useAppAuth();

  const startCheckout = async (plan: string) => {
    if (!isSignedIn) {
      window.location.href = "/app/sign-in";
      return;
    }
    setError(null);
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  const { isSignedIn } = useAppAuth();
  const { trialUsed } = useTrialStatus();

  const btnLabel = (isSignedIn && trialUsed) ? "Subscribe" : "Try 14 Days Free";

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans">
      <PricingNav />

      <div className="pt-28 pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-mono px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" />
            Powered by real Pinnacle data
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground font-sans">
            Start your 14-day free trial — no credit card required.
          </p>

          {/* Social proof */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground font-mono">Bookmakers covered:</span>
            <BookmakerBadge name="Pinnacle" icon={<PinnacleIcon />} />
            <BookmakerBadge name="Bet365" icon={<span className="text-[11px] font-bold text-[#00843D]">B365</span>} />
            <BookmakerBadge name="Betfair" icon={<span className="text-[11px] font-bold text-[#FFD700]">BF</span>} />
            <BookmakerBadge name="DraftKings" icon={<span className="text-[11px] font-bold text-[#53D337]">DK</span>} />
          </div>
        </motion.div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-950/50 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 text-center font-mono">
            {error}
          </div>
        )}

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Silver */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-2xl border border-border/60 bg-card/60 p-8 flex flex-col"
          >
            <div className="mb-6">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Silver</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold font-sans">$29</span>
                <span className="text-muted-foreground font-mono text-sm mb-1">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">For casual bettors getting started</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {SILVER_FEATURES.map((f, i) => <FeatureLine key={i} {...f} />)}
            </ul>
            <button
              onClick={() => startCheckout("silver")}
              disabled={!!loadingPlan}
              className="w-full py-3 rounded-lg border border-primary/40 text-primary font-mono font-semibold text-sm transition-all hover:bg-primary/10 hover:border-primary/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingPlan === "silver" ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : btnLabel}
            </button>
          </motion.div>

          {/* Gold */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-2xl border-2 border-primary/60 bg-card/80 p-8 flex flex-col relative shadow-[0_0_40px_hsl(var(--primary)/0.15)]"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
              Most Popular
            </div>
            <div className="mb-6">
              <div className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Gold</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold font-sans">$59</span>
                <span className="text-muted-foreground font-mono text-sm mb-1">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">For serious bettors who want the edge</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {GOLD_FEATURES.map((f, i) => <FeatureLine key={i} {...f} />)}
            </ul>
            <button
              onClick={() => startCheckout("gold")}
              disabled={!!loadingPlan}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono font-semibold text-sm transition-all hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingPlan === "gold" ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : btnLabel}
            </button>
          </motion.div>

          {/* Platinum */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-2xl border border-violet-500/40 bg-[linear-gradient(135deg,rgba(139,92,246,0.07)_0%,rgba(0,0,0,0)_100%)] p-8 flex flex-col relative"
          >
            <div className="mb-6">
              <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-2">Platinum</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold font-sans">$99</span>
                <span className="text-muted-foreground font-mono text-sm mb-1">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground">For professionals and power users</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PLATINUM_FEATURES.map((f, i) => <PlatinumFeatureLine key={i} {...f} />)}
            </ul>
            <button
              onClick={() => startCheckout("platinum")}
              disabled={!!loadingPlan}
              className="w-full py-3 rounded-lg border border-violet-500/40 text-violet-400 font-mono font-semibold text-sm transition-all hover:bg-violet-500/10 hover:border-violet-500/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loadingPlan === "platinum" ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : btnLabel}
            </button>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground font-mono mt-10"
        >
          All plans include a 14-day free trial · Cancel any time · Billed monthly
        </motion.p>
      </div>
    </div>
  );
}
