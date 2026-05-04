import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertStoreProvider } from "@/lib/alert-context";
import { BetStoreProvider } from "@/lib/bet-store";
import { SettingsProvider } from "@/lib/settings-context";
import { LangProvider } from "@/lib/lang-context";
import { useAutoSettle } from "@/hooks/use-auto-settle";
import React, { useState, useEffect, useCallback, useRef, Suspense } from "react";
import NotFound from "@/pages/not-found";
import FeedPage from "@/pages/feed";

const EventDetailPage        = React.lazy(() => import("@/pages/event-detail"));
const BetTrackerPage         = React.lazy(() => import("@/pages/bet-tracker"));
const BetStatsPage           = React.lazy(() => import("@/pages/bet-stats"));
const AlertConfigurationsPage = React.lazy(() => import("@/pages/alert-configurations"));
const TopMoversPage          = React.lazy(() => import("@/pages/top-movers"));
const MyBetsPage             = React.lazy(() => import("@/pages/my-bets"));
const AccountPage            = React.lazy(() => import("@/pages/account"));
import { Activity } from "lucide-react";
import { PlanContext, type PlanTier } from "@/lib/plan-context";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function AppServices() {
  useAutoSettle();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
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
    </Suspense>
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

const clerkGlobalStyles = `
  .cl-socialButtonsBlockButton {
    background: rgba(255,255,255,0.10) !important;
    border-color: rgba(255,255,255,0.20) !important;
  }
  .cl-socialButtonsBlockButton:hover {
    background: rgba(255,255,255,0.16) !important;
  }
  .cl-socialButtonsBlockButtonText {
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 0.875rem !important;
  }
`;

function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      <style>{clerkGlobalStyles}</style>
      <a href="/" className="flex items-center justify-center gap-2 py-6 border-b border-white/5 hover:opacity-80 transition-opacity">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-lg text-white tracking-tight">
          Sharp<span className="text-cyan-400">Tracker</span>
        </span>
      </a>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/`}
          appearance={{
            variables: {
              colorPrimary: "#22d3ee",
              colorForeground: "#f8fafc",
              colorMutedForeground: "#94a3b8",
              colorDanger: "#f87171",
              colorBackground: "#0f1117",
              colorInput: "#1a1d27",
              colorInputForeground: "#f8fafc",
              colorNeutral: "#334155",
              fontFamily: "Inter, sans-serif",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full flex justify-center",
              cardBox: "rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]",
              card: "!shadow-none !border-0 !bg-[#0f1117] !rounded-none",
              footer: "!shadow-none !border-0 !bg-[#0f1117] !rounded-none",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-white/50",
              socialButtonsBlockButtonText: "text-white font-semibold",
              formFieldLabel: "text-white/70",
              footerActionLink: "text-cyan-400 hover:text-cyan-300",
              footerActionText: "text-white/40",
              dividerText: "text-white/30",
              identityPreviewEditButton: "text-cyan-400",
              formFieldSuccessText: "text-green-400",
              alertText: "text-white/80",
              socialButtonsBlockButton: "border-white/20 bg-white/10 hover:bg-white/15",
              formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold",
              formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-white/30",
              dividerLine: "bg-white/10",
            },
          }}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col">
      <a href="/" className="flex items-center justify-center gap-2 py-6 border-b border-white/5 hover:opacity-80 transition-opacity">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-lg text-white tracking-tight">
          Sharp<span className="text-cyan-400">Tracker</span>
        </span>
      </a>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          fallbackRedirectUrl={`${basePath}/`}
          appearance={{
            variables: {
              colorPrimary: "#22d3ee",
              colorForeground: "#f8fafc",
              colorMutedForeground: "#94a3b8",
              colorDanger: "#f87171",
              colorBackground: "#0f1117",
              colorInput: "#1a1d27",
              colorInputForeground: "#f8fafc",
              colorNeutral: "#334155",
              fontFamily: "Inter, sans-serif",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full flex justify-center",
              cardBox: "rounded-2xl w-[440px] max-w-full overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)]",
              card: "!shadow-none !border-0 !bg-[#0f1117] !rounded-none",
              footer: "!shadow-none !border-0 !bg-[#0f1117] !rounded-none",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-white/50",
              socialButtonsBlockButtonText: "text-white font-semibold",
              formFieldLabel: "text-white/70",
              footerActionLink: "text-cyan-400 hover:text-cyan-300",
              footerActionText: "text-white/40",
              dividerText: "text-white/30",
              formFieldSuccessText: "text-green-400",
              alertText: "text-white/80",
              socialButtonsBlockButton: "border-white/20 bg-white/10 hover:bg-white/15",
              formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-semibold",
              formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-white/30",
              dividerLine: "bg-white/10",
            },
          }}
        />
      </div>
    </div>
  );
}

type SubState =
  | { status: "loading" }
  | { status: "active"; tier: PlanTier; isTrialing: boolean }
  | { status: "expired" }
  | { status: "none" }
  | { status: "error" };

const MAX_SUB_RETRIES = 3;

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isSignedIn, isLoaded } = useAuth();
  const [subState, setSubState] = useState<SubState>({ status: "loading" });
  const retryCount = useRef(0);
  const sessionIdRef = useRef<string | undefined>(undefined);

  const attemptFetch = useCallback(async () => {
    try {
      const sessionId = sessionIdRef.current;
      if (sessionId && retryCount.current === 0) {
        await fetch(
          `/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`,
          { credentials: "include" }
        );
      }

      const res = await fetch("/api/stripe/subscription", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const tier = data.planTier as PlanTier | null;
      const subStatus = data.subscription?.status as string | undefined;
      const cancelAtPeriodEnd = data.subscription?.cancel_at_period_end as boolean | null | undefined;
      const currentPeriodEnd = data.subscription?.current_period_end as number | null | undefined;
      const trialEnd = data.subscription?.trial_end as number | null | undefined;

      const nowSec = Math.floor(Date.now() / 1000);
      const withinPaidPeriod =
        (cancelAtPeriodEnd && currentPeriodEnd && currentPeriodEnd > nowSec) ||
        ((subStatus === "canceled" || subStatus === "cancelled") && currentPeriodEnd && currentPeriodEnd > nowSec) ||
        ((subStatus === "canceled" || subStatus === "cancelled") && trialEnd && trialEnd > nowSec);

      const isActive =
        subStatus === "active" ||
        subStatus === "trialing" ||
        !!withinPaidPeriod;

      // Tier may be null if metadata missing — fall back to "silver" so
      // paying users are never locked out.
      const resolvedTier: PlanTier = (tier && tier !== "none") ? tier : "silver";

      if (isActive) {
        setSubState({ status: "active", tier: resolvedTier, isTrialing: subStatus === "trialing" });
      } else if (data.subscription != null) {
        setSubState({ status: "expired" });
      } else {
        setSubState({ status: "none" });
      }
    } catch {
      if (retryCount.current < MAX_SUB_RETRIES) {
        retryCount.current += 1;
        const delay = 1000 * retryCount.current; // 1s, 2s, 3s
        setTimeout(attemptFetch, delay);
      } else {
        // All retries exhausted — show an error state, not a pricing redirect
        setSubState({ status: "error" });
      }
    }
  }, []);

  const fetchSubscription = useCallback((sessionId?: string) => {
    retryCount.current = 0;
    sessionIdRef.current = sessionId;
    setSubState({ status: "loading" });
    attemptFetch();
  }, [attemptFetch]);

  useEffect(() => {
    if (bypassAuth) return;
    if (!isLoaded || !isSignedIn) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") ?? undefined;
    if (sessionId) {
      window.history.replaceState({}, "", window.location.pathname + window.location.hash);
    }

    fetchSubscription(sessionId);
  }, [isLoaded, isSignedIn, bypassAuth, fetchSubscription]);

  // Only redirect to pricing for confirmed no-subscription states (not errors)
  useEffect(() => {
    if (bypassAuth) return;
    if (subState.status === "expired" || subState.status === "none") {
      window.location.href = "/pricing";
    }
  }, [subState.status, bypassAuth]);

  if (bypassAuth) {
    return (
      <PlanContext.Provider value="platinum">
        {children}
      </PlanContext.Provider>
    );
  }

  if (subState.status === "active") {
    return (
      <PlanContext.Provider value={subState.tier}>
        {children}
      </PlanContext.Provider>
    );
  }

  if (subState.status === "expired" || subState.status === "none") {
    return <LoadingScreen label="Redirecting…" />;
  }

  if (subState.status === "error") {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Activity className="w-8 h-8 text-primary" />
        <p className="text-sm text-muted-foreground font-mono">Could not reach the server.<br />Check your connection and try again.</p>
        <button
          onClick={() => fetchSubscription()}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-mono font-semibold hover:bg-primary/90 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // "loading" state
  return <LoadingScreen label="Checking subscription…" />;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isLoaded, isSignedIn } = useAuth();

  if (bypassAuth) return <>{children}</>;
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;

  return <>{children}</>;
}

function MainApp() {
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
                    <AppRouter />
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

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      localization={{
        signIn: { start: { title: "Sign in to SharpTracker" } },
        signUp: { start: { title: "Create your SharpTracker account" } },
      }}
    >
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route>
          <MainApp />
        </Route>
      </Switch>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
