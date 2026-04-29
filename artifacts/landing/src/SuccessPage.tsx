import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity, CheckCircle2, Clock } from "lucide-react";

type FulfillResult = {
  ok: boolean;
  plan?: string | null;
  status?: string;
  trialActive?: boolean;
  error?: string;
};

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<FulfillResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setResult({ ok: true });
      setLoading(false);
      return;
    }

    // Clean session_id from URL
    window.history.replaceState({}, "", window.location.pathname);

    fetch(`/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setResult({ ok: true });
        setLoading(false);
      });
  }, []);

  const isTrialing = result?.trialActive === true;
  const planName = result?.plan
    ? result.plan.charAt(0).toUpperCase() + result.plan.slice(1)
    : null;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-sans font-bold text-lg tracking-tight">
              Sharp<span className="text-primary">Tracker</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-foreground/40 font-mono">Activating your account…</span>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full text-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-2xl scale-150 ${isTrialing ? "bg-amber-400/20" : "bg-primary/20"}`} />
                {isTrialing ? (
                  <Clock className="w-16 h-16 text-amber-400 relative z-10" />
                ) : (
                  <CheckCircle2 className="w-16 h-16 text-primary relative z-10" />
                )}
              </div>
            </motion.div>

            {isTrialing ? (
              <>
                <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  <Clock className="w-3 h-3" />
                  14-day free trial
                </div>
                <h1 className="text-3xl font-bold mb-3">
                  Your trial has started
                  {planName ? ` — ${planName}` : ""}
                </h1>
                <p className="text-foreground/60 text-base mb-3">
                  You have full access to SharpTracker for the next 14 days — no charge until your trial ends.
                </p>
                <p className="text-foreground/40 text-sm font-mono mb-10">
                  Your card will be charged automatically after the trial. You can cancel anytime in billing settings.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-3">
                  Welcome to SharpTracker
                  {planName ? ` ${planName}` : ""}!
                </h1>
                <p className="text-foreground/60 text-base mb-10">
                  Your subscription is active. Start tracking sharp odds movements now.
                </p>
              </>
            )}

            <button
              onClick={() => { window.location.href = "/app/"; }}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)]"
            >
              Open SharpTracker →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
