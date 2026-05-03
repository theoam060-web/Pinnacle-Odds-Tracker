import { AuthProvider, useAppAuth } from "@/lib/auth-context";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertStoreProvider } from "@/lib/alert-context";
import { BetStoreProvider } from "@/lib/bet-store";
import { SettingsProvider } from "@/lib/settings-context";
import { LangProvider } from "@/lib/lang-context";
import { useAutoSettle } from "@/hooks/use-auto-settle";
import NotFound from "@/pages/not-found";
import FeedPage from "@/pages/feed";
import EventDetailPage from "@/pages/event-detail";
import BetTrackerPage from "@/pages/bet-tracker";
import BetStatsPage from "@/pages/bet-stats";
import AlertConfigurationsPage from "@/pages/alert-configurations";
import TopMoversPage from "@/pages/top-movers";
import MyBetsPage from "@/pages/my-bets";
import AccountPage from "@/pages/account";
import React, { useState, useEffect, useCallback } from "react";
import { Activity } from "lucide-react";
import { PlanContext, type PlanTier } from "@/lib/plan-context";

function AppServices() {
  useAutoSettle();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 5000 },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={FeedPage} />
      <Route path="/event/:id" component={EventDetailPage} />
      <Route path="/bet-tracker" component={BetTrackerPage} />
      <Route path="/bet-stats" component={BetStatsPage} />
      <Route path="/alert-configurations" component={AlertConfigurationsPage} />
      <Route path="/top-movers" component={TopMoversPage} />
      <Route path="/my-bets" component={MyBetsPage} />
      <Route path="/account" component={AccountPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0b0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-white/40 font-mono">{label}</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AuthScreen() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (data.token) {
        try { localStorage.setItem("st_jwt", data.token); } catch {}
        window.location.reload();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      <div className="flex items-center justify-center gap-2 py-6 border-b border-white/5">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-lg text-white tracking-tight">
          Sharp<span className="text-cyan-400">Tracker</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[380px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col gap-5 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold text-white font-sans mb-1">Sign in to SharpTracker</h1>
              <p className="text-sm text-white/50 font-mono">Track sharp odds drops in real time</p>
            </div>

            {/* Google */}
            <button
              onClick={() => { window.location.href = "/api/auth/google"; }}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-sans font-semibold text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-mono">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Sign in / Create account tabs */}
            <div className="flex rounded-lg border border-white/10 bg-white/[0.02] p-1 gap-1">
              <button
                onClick={() => { setAuthMode("login"); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-mono rounded-md transition-all ${
                  authMode === "login"
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => { setAuthMode("register"); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-mono rounded-md transition-all ${
                  authMode === "register"
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Create account
              </button>
            </div>

            {/* Email / password form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-cyan-400/40 transition-all"
              />
              <input
                type="password"
                placeholder={authMode === "register" ? "Password (min 8 chars)" : "Password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-cyan-400/40 transition-all"
              />
              {error && (
                <p className="text-xs text-red-400 font-mono text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 font-mono font-semibold text-sm px-5 py-3 rounded-xl hover:bg-cyan-400/15 hover:border-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait…" : authMode === "login" ? "Sign in with Email" : "Create Account"}
              </button>
            </form>

            <p className="text-[11px] text-white/25 text-center font-mono leading-relaxed">
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SubState =
  | { status: "loading" }
  | { status: "active"; tier: PlanTier; isTrialing: boolean }
  | { status: "expired" }
  | { status: "none" };

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isSignedIn, isLoaded, getToken } = useAppAuth();
  const [subState, setSubState] = useState<SubState>({ status: "loading" });

  const fetchSubscription = useCallback(async (sessionId?: string) => {
    setSubState({ status: "loading" });
    try {
      if (sessionId) {
        await fetch(`/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include",
        });
      }

      const token = getToken();
      const res = await fetch("/api/stripe/subscription", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      const tier = data.planTier as PlanTier | null;
      const subStatus = data.subscription?.status as string | undefined;
      const hasAccess = (subStatus === "active" || subStatus === "trialing") && tier && tier !== "none";
      if (hasAccess) {
        setSubState({ status: "active", tier: tier!, isTrialing: subStatus === "trialing" });
      } else if (subStatus === "canceled" || data.subscription != null) {
        setSubState({ status: "expired" });
      } else {
        setSubState({ status: "none" });
      }
    } catch {
      setSubState({ status: "none" });
    }
  }, [getToken]);

  useEffect(() => {
    if (bypassAuth) return;
    if (!isLoaded || !isSignedIn) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") ?? undefined;
    if (sessionId) {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }

    fetchSubscription(sessionId);
  }, [isLoaded, isSignedIn, bypassAuth, fetchSubscription]);

  if (bypassAuth) {
    return (
      <PlanContext.Provider value="platinum">
        {children}
      </PlanContext.Provider>
    );
  }

  if (subState.status === "loading" && isSignedIn) {
    return <LoadingScreen label="Checking subscription…" />;
  }

  if (subState.status === "active") {
    return (
      <PlanContext.Provider value={subState.tier}>
        {children}
      </PlanContext.Provider>
    );
  }

  if (subState.status === "expired" || subState.status === "none") {
    window.location.href = "/pricing";
    return null;
  }

  return <LoadingScreen label="Checking subscription…" />;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isLoaded, isSignedIn } = useAppAuth();

  if (bypassAuth) return <>{children}</>;
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <AuthScreen />;

  return <>{children}</>;
}

function AppContent() {
  return (
    <LangProvider>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AlertStoreProvider>
          <BetStoreProvider>
            <TooltipProvider>
              <AuthGate>
                <SubscriptionGate>
                  <AppServices />
                  <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                    <Router />
                  </WouterRouter>
                  <Toaster />
                </SubscriptionGate>
              </AuthGate>
            </TooltipProvider>
          </BetStoreProvider>
        </AlertStoreProvider>
      </SettingsProvider>
    </QueryClientProvider>
    </LangProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
