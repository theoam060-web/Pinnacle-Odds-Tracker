import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Activity, Check, Loader2, Star } from "lucide-react";
import { useUser, useAuth } from "@clerk/react";
import GoogleIcon from "./components/GoogleIcon";

const API_BASE = "";

// Stripe-hosted Payment Links (configured in Stripe Dashboard).
// Map plan -> direct payment link URL. When set, Subscribe will redirect
// straight to this URL instead of calling /api/stripe/checkout.
const PAYMENT_LINKS: Record<string, string> = {
  silver: "https://buy.stripe.com/8x200caQU5tN9PV4rWeZ200",
};

// Shared key the in-app dashboard reads on return to detect "user just left
// for Stripe" so it can briefly poll the subscription endpoint while waiting
// for the webhook to land. Must match SubscriptionGate in odds-dropper/App.tsx.
const PENDING_CHECKOUT_KEY = "sharptracker.pendingCheckout";

function markPendingCheckout() {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, String(Date.now()));
    localStorage.setItem(PENDING_CHECKOUT_KEY, String(Date.now()));
  } catch {
    /* storage may be unavailable in some browsers/modes — non-fatal */
  }
}

function openCheckoutUrl(url: string) {
  // Signal to the dashboard that the user is on their way to Stripe, so when
  // they come back we know to poll briefly while the webhook propagates.
  markPendingCheckout();
  // Try top-level navigation first (breaks out of Replit's preview iframe);
  // fall back to a new tab if cross-origin blocked.
  try {
    (window.top ?? window).location.href = url;
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

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

export default function PricingPage() {
  const [, navigate] = useLocation();
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (plan: string) => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

    // Plans wired to a Stripe Payment Link skip the API and redirect directly.
    // We attach client_reference_id (Clerk userId) so the webhook can map the
    // payment back to this user, and prefilled_email for a smoother checkout.
    const paymentLink = PAYMENT_LINKS[plan];
    if (paymentLink) {
      const email = user?.primaryEmailAddress?.emailAddress;

      // Ensure the user row exists in our DB BEFORE leaving for Stripe. If
      // this is a freshly signed-up user, the row may not exist yet — without
      // it, the webhook fulfillment can't map the payment back to this user.
      // POST /api/user is idempotent (returns the existing row if present).
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/api/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Non-fatal: fulfillment has a server-side safety net that creates
        // the user from client_reference_id + session email if missing.
      }

      const url = new URL(paymentLink);
      if (user?.id) url.searchParams.set("client_reference_id", user.id);
      if (email) url.searchParams.set("prefilled_email", email);
      openCheckoutUrl(url.toString());
      return;
    }

    setLoading(l => ({ ...l, [plan]: true }));
    setError(null);
    let url: string | null = null;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan, redirectAfter: "/app/" }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Failed to start checkout");
        return;
      }
      url = data.url;
    } catch {
      setError("Network error — please try again");
      return;
    } finally {
      setLoading(l => ({ ...l, [plan]: false }));
    }
    if (url) openCheckoutUrl(url);
  };

  const silverLoading = loading["silver"];
  const goldLoading = loading["gold"];
  const platinumLoading = loading["platinum"];

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
            <h1 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-0 leading-tight">
              Pricing
            </h1>
          </motion.div>

          {error && (
            <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 font-mono text-center">
              {error}
            </div>
          )}

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
                onClick={() => handleCheckout("silver")}
                disabled={silverLoading}
                className="w-full py-3 rounded-lg border border-border/60 text-foreground/80 font-mono text-sm hover:border-primary/40 hover:text-primary transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {silverLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : isSignedIn ? "Subscribe" : "Get Started"}
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
                onClick={() => handleCheckout("gold")}
                disabled={goldLoading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {goldLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : isSignedIn ? "Subscribe" : "Get Started"}
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
                onClick={() => handleCheckout("platinum")}
                disabled={platinumLoading}
                className="w-full py-3 rounded-lg bg-violet-600 text-white font-mono text-sm font-bold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {platinumLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : isSignedIn ? "Subscribe" : "Get Started"}
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
