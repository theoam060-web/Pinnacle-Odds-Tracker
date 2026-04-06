import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity, CheckCircle2, Loader2, XCircle } from "lucide-react";

const API_BASE = "https://84e61830-7611-4d35-8623-77d057b02e4e-00-30ovvqhxka0d5.kirk.replit.dev";

type Status = "loading" | "success" | "already" | "error";

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<Status>("loading");
  const [plan, setPlan] = useState<string>("SharpTracker");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID found. If you completed payment, please contact support.");
      return;
    }

    fetch(`${API_BASE}/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          if (data.plan) setPlan(data.plan);
          setStatus(data.alreadyFulfilled ? "already" : "success");
        } else {
          setErrorMsg(data.error ?? "Something went wrong.");
          setStatus("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error — please contact support.");
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col">
      {/* Nav */}
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
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Confirming your subscription…</h1>
              <p className="text-foreground/50 text-sm font-mono">This takes just a second.</p>
            </>
          )}

          {(status === "success" || status === "already") && (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-150" />
                  <CheckCircle2 className="w-16 h-16 text-primary relative z-10" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold mb-3">
                {status === "already" ? "You're already subscribed!" : "You're in."}
              </h1>
              <p className="text-foreground/60 text-base mb-2">
                {status === "already"
                  ? `Your ${plan} subscription is active.`
                  : `Welcome to ${plan}. Your subscription is now active.`}
              </p>
              <p className="text-foreground/40 text-sm font-mono mb-10">
                You now have full access to SharpTracker.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,255,255,0.25)]"
                >
                  Go to Dashboard →
                </button>
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-6 py-3 rounded-lg border border-border/60 text-foreground/60 font-mono text-sm hover:border-primary/40 hover:text-primary transition-all"
                >
                  View Plan
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
              <p className="text-foreground/50 text-sm font-mono mb-8">{errorMsg}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  Back to Pricing
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
