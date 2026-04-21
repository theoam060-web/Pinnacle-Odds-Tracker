import { ClerkProvider, useUser, useAuth, useClerk, useSignIn, AuthenticateWithRedirectCallback } from "@clerk/react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertStoreProvider } from "@/lib/alert-context";
import { BetStoreProvider } from "@/lib/bet-store";
import { SettingsProvider } from "@/lib/settings-context";
import { useAutoSettle } from "@/hooks/use-auto-settle";
import NotFound from "@/pages/not-found";
import FeedPage from "@/pages/feed";
import EventDetailPage from "@/pages/event-detail";
import BetTrackerPage from "@/pages/bet-tracker";
import BetStatsPage from "@/pages/bet-stats";
import AlertConfigurationsPage from "@/pages/alert-configurations";
import TopMoversPage from "@/pages/top-movers";
import MyBetsPage from "@/pages/my-bets";
import React, { useEffect, useState, useCallback } from "react";
import { Activity, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { PlanContext, type PlanTier } from "@/lib/plan-context";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const API_BASE = "";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function LoadingScreen({ label = "Laddar…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0b0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-white/40 font-mono">{label}</span>
      </div>
    </div>
  );
}

function AuthScreen() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
  const { signIn, isLoaded } = useSignIn();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!signIn || !isLoaded || loading) return;
    setLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}${base}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}${base}/`,
      });
    } catch {
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
        <div className="w-full max-w-[360px] space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Välkommen tillbaka</h1>
            <p className="text-sm text-white/50">Logga in med ditt Google-konto för att fortsätta</p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={!isLoaded || loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3.5 rounded-xl hover:bg-white/90 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Omdirigerar…" : "Fortsätt med Google"}
          </button>

          <p className="text-center text-xs text-white/25 leading-relaxed">
            Genom att fortsätta godkänner du SharpTrackers användarvillkor och integritetspolicy.
          </p>
        </div>
      </div>
    </div>
  );
}

interface Plan {
  id: string;
  name: string;
  prices: { id: string; unit_amount: number; currency: string }[];
  metadata: Record<string, string>;
  description?: string;
}

function SubscriptionWall() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/stripe/products`)
      .then((r) => r.json())
      .then((d) => {
        const sorted = (d.data ?? []).sort(
          (a: Plan, b: Plan) =>
            (a.prices?.[0]?.unit_amount ?? 0) - (b.prices?.[0]?.unit_amount ?? 0),
        );
        setPlans(sorted);
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false));
  }, []);

  const handleCheckout = useCallback(
    async (priceId: string) => {
      setCheckingOut(priceId);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priceId, redirectAfter: "/app/" }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        setCheckingOut(null);
      }
    },
    [getToken],
  );

  const PLAN_FEATURES: Record<string, string[]> = {
    silver: [
      "Realtids-odds drop-alertar",
      "3 sporter & 3 marknader var",
      "Bet Size Calculator",
      "Bookmaker-jämförelse",
      "Telegram-grupp (enbart members)",
    ],
    gold: [
      "Allt i Silver",
      "Bet Tracker & Bet Stats",
      "Alla sporter & alla marknader",
      "Live EV & Closing EV",
      "9 alert-konfigurationer",
    ],
    platinum: [
      "Allt i Gold",
      "Push-notiser i appen",
      "20 alert-konfigurationer",
      "Current CLV & Current CV",
      "More coming…",
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-lg text-white tracking-tight">
            Sharp<span className="text-cyan-400">Tracker</span>
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
        >
          Logga ut
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Välj din plan</h1>
            <p className="text-white/40 text-sm font-mono">
              Välj ett abonnemang för att komma åt SharpTracker
            </p>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center text-white/30 text-sm font-mono py-12">
              Kunde inte ladda prenumerationer. Försök igen.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {plans.map((plan, i) => {
                const planKey = plan.metadata?.plan ?? "";
                const price = plan.prices?.[0];
                const priceId = price?.id;
                const amount = price ? `€${(price.unit_amount / 100).toFixed(2)}` : "—";
                const features = PLAN_FEATURES[planKey] ?? [];
                const isGold = planKey === "gold";
                const isPlatinum = planKey === "platinum";
                const isHighlighted = isGold || isPlatinum;
                const isLoading = checkingOut === priceId;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-5 transition-all ${
                      isPlatinum
                        ? "border-violet-400/40 bg-violet-400/5"
                        : isGold
                        ? "border-cyan-400/40 bg-cyan-400/5"
                        : "border-white/10 bg-white/3"
                    }`}
                  >
                    {isGold && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-cyan-400 text-black text-[10px] font-bold font-mono px-3 py-0.5 rounded-full uppercase tracking-wider">
                          Mest populär
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-base font-bold text-white">{plan.name}</h2>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className={`text-2xl font-bold font-mono ${isPlatinum ? "text-violet-400" : isGold ? "text-cyan-400" : "text-white"}`}>
                            {amount}
                          </span>
                          <span className="text-white/40 text-xs font-mono">/månad</span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-5">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isPlatinum ? "text-violet-400" : isGold ? "text-cyan-400" : "text-white/40"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => priceId && handleCheckout(priceId)}
                      disabled={!priceId || !!checkingOut}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-semibold transition-all disabled:opacity-50 ${
                        isPlatinum
                          ? "bg-violet-500 text-white hover:bg-violet-400"
                          : isGold
                          ? "bg-cyan-400 text-black hover:bg-cyan-300"
                          : "bg-white/8 text-white hover:bg-white/12 border border-white/10"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Välj {plan.name.replace("SharpTracker ", "")}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-white/20 text-xs font-mono mt-6">
            Avbryt när som helst · Säker betalning via Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

type SubStatus = "loading" | "active" | "none";

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<SubStatus>("loading");
  const [planTier, setPlanTier] = useState<PlanTier>("none");
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e: string) => e.trim())
    .filter(Boolean);
  const isAdmin =
    adminEmails.length > 0 &&
    adminEmails.includes(user?.primaryEmailAddress?.emailAddress ?? "");

  const check = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/stripe/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setStatus("none"); return; }
      const data = await res.json();
      const sub = data.subscription;
      const isActive = sub?.status === "active" || sub?.status === "trialing";
      if (isActive) {
        const t = data.planTier as PlanTier | null | undefined;
        if (t === "silver" || t === "gold" || t === "platinum") {
          setPlanTier(t);
          setStatus("active");
        } else {
          setStatus("none");
        }
      } else {
        setStatus("none");
      }
    } catch {
      setStatus("none");
    }
  }, [getToken]);

  useEffect(() => {
    if (bypassAuth || isAdmin) { setPlanTier("platinum"); setStatus("active"); return; }

    // If Stripe redirected back with a session_id, fulfill the checkout first
    // then check subscription. This avoids relying on webhook timing.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      // Remove session_id from URL immediately so it doesn't re-trigger on refresh
      params.delete("session_id");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, "", newUrl);

      getToken().then((token) => {
        fetch(`${API_BASE}/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        })
          .catch(() => {})
          .finally(() => check());
      });
      return;
    }

    check();
  }, [bypassAuth, isAdmin, check, getToken]);

  if (status === "loading") return <LoadingScreen label="Kontrollerar prenumeration…" />;
  if (status === "none") return <SubscriptionWall />;
  return <PlanContext.Provider value={planTier}>{children}</PlanContext.Provider>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isLoaded, isSignedIn } = useUser();
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  if (bypassAuth) return <>{children}</>;

  // Handle Google OAuth callback before auth state is resolved
  const path = window.location.pathname;
  if (path === `${base}/sso-callback` || path.startsWith(`${base}/sso-callback/`)) {
    return <AuthenticateWithRedirectCallback />;
  }

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <AuthScreen />;

  return <SubscriptionGate>{children}</SubscriptionGate>;
}

function AppContent() {
  const base = (import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "");
  const isSsoCallback = window.location.pathname === `${base}/sso-callback`;

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AlertStoreProvider>
          <BetStoreProvider>
            <TooltipProvider>
              {isSsoCallback ? (
                <WouterRouter base={base}>
                  <AuthenticateWithRedirectCallback />
                </WouterRouter>
              ) : (
                <AuthGate>
                  <AppServices />
                  <WouterRouter base={base}>
                    <Router />
                  </WouterRouter>
                  <Toaster />
                </AuthGate>
              )}
            </TooltipProvider>
          </BetStoreProvider>
        </AlertStoreProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

function App() {
  if (!clerkPubKey) {
    return <AppContent />;
  }
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
    >
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
