import { ClerkProvider, useUser, useAuth, useClerk, SignIn, SignUp } from "@clerk/react";
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
import { Activity, LogIn, UserPlus, ArrowRight, Loader2, CheckCircle2, ExternalLink } from "lucide-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

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
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      <div className="flex items-center justify-center gap-2 py-6 border-b border-white/5">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-lg text-white tracking-tight">
          Sharp<span className="text-cyan-400">Tracker</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px]">
          <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
            <button
              onClick={() => setMode("sign-in")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-mono transition-colors border-r border-white/20 ${
                mode === "sign-in"
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Logga in
            </button>
            <button
              onClick={() => setMode("sign-up")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-mono transition-colors ${
                mode === "sign-up"
                  ? "bg-cyan-400/15 text-cyan-400"
                  : "bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Skapa konto
            </button>
          </div>

          {mode === "sign-in" ? (
            <SignIn
              routing="hash"
              afterSignInUrl={`${base}/`}
              signUpUrl={undefined}
              appearance={{
                variables: {
                  colorPrimary: "#00e5ff",
                  colorBackground: "#111218",
                  colorText: "#ffffff",
                  colorTextSecondary: "rgba(255,255,255,0.5)",
                  colorInputBackground: "#1a1b22",
                  colorInputText: "#ffffff",
                  borderRadius: "0.75rem",
                  fontFamily: "JetBrains Mono, monospace",
                },
                elements: {
                  card: "shadow-none bg-transparent",
                  rootBox: "w-full",
                  formButtonPrimary: "bg-cyan-400 text-black hover:bg-cyan-300 font-mono",
                  socialButtonsBlockButton: { display: "none" },
                  socialButtonsBlockButtonText: { display: "none" },
                  dividerRow: { display: "none" },
                },
              }}
            />
          ) : (
            <SignUp
              routing="hash"
              afterSignUpUrl={`${base}/`}
              signInUrl={undefined}
              appearance={{
                variables: {
                  colorPrimary: "#00e5ff",
                  colorBackground: "#111218",
                  colorText: "#ffffff",
                  colorTextSecondary: "rgba(255,255,255,0.5)",
                  colorInputBackground: "#1a1b22",
                  colorInputText: "#ffffff",
                  borderRadius: "0.75rem",
                  fontFamily: "JetBrains Mono, monospace",
                },
                elements: {
                  card: "shadow-none bg-transparent",
                  rootBox: "w-full",
                  formButtonPrimary: "bg-cyan-400 text-black hover:bg-cyan-300 font-mono",
                  socialButtonsBlockButton: { display: "none" },
                  socialButtonsBlockButtonText: { display: "none" },
                  dividerRow: { display: "none" },
                },
              }}
            />
          )}
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
      "Bet Tracker",
      "Bet Size Calculator",
      "Bookmaker-jämförelse",
    ],
    gold: [
      "Allt i Silver",
      "Alla sporter & alla marknader",
      "Player props",
      "Live EV & Closing EV",
      "Obegränsade alert-configs",
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
                const isGold = i === plans.length - 1;
                const isLoading = checkingOut === priceId;

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl border p-5 transition-all ${
                      isGold
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
                          <span className={`text-2xl font-bold font-mono ${isGold ? "text-cyan-400" : "text-white"}`}>
                            {amount}
                          </span>
                          <span className="text-white/40 text-xs font-mono">/månad</span>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-5">
                      {features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isGold ? "text-cyan-400" : "text-white/40"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => priceId && handleCheckout(priceId)}
                      disabled={!priceId || !!checkingOut}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-mono font-semibold transition-all disabled:opacity-50 ${
                        isGold
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
  const [status, setStatus] = useState<SubStatus>("loading");
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

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
      setStatus(isActive ? "active" : "none");
    } catch {
      setStatus("none");
    }
  }, [getToken]);

  useEffect(() => {
    if (bypassAuth) { setStatus("active"); return; }
    check();
  }, [bypassAuth, check]);

  if (status === "loading") return <LoadingScreen label="Kontrollerar prenumeration…" />;
  if (status === "none") return <SubscriptionWall />;
  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isLoaded, isSignedIn } = useUser();

  if (bypassAuth) return <>{children}</>;
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <AuthScreen />;

  return <SubscriptionGate>{children}</SubscriptionGate>;
}

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AlertStoreProvider>
          <BetStoreProvider>
            <TooltipProvider>
              <AuthGate>
                <AppServices />
                <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </AuthGate>
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
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
