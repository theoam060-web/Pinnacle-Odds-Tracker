import { ClerkProvider, useUser, useAuth, SignIn, SignUp } from "@clerk/react";
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
import AccountPage from "@/pages/account";
import React, { useState, useEffect, useCallback } from "react";
import { Activity, LogIn, UserPlus, ExternalLink } from "lucide-react";
import { PlanContext, type PlanTier } from "@/lib/plan-context";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;

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

const clerkAppearance = {
  variables: {
    colorPrimary: "#00e5ff",
    colorBackground: "#111218",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.65)",
    colorInputBackground: "#1a1b22",
    colorInputText: "#ffffff",
    borderRadius: "0.75rem",
    fontFamily: "JetBrains Mono, monospace",
  },
  elements: {
    card: "shadow-none border border-white/10",
    rootBox: "w-full",
    headerTitle: { color: "#ffffff", opacity: 1 },
    headerSubtitle: { color: "rgba(255,255,255,0.65)", opacity: 1 },
    formFieldLabel: { color: "rgba(255,255,255,0.75)" },
    formButtonPrimary: "bg-cyan-400 text-black hover:bg-cyan-300 font-mono",
    dividerText: { color: "rgba(255,255,255,0.4)" },
    dividerLine: { background: "rgba(255,255,255,0.1)" },
    footerActionText: { color: "rgba(255,255,255,0.5)" },
    footerActionLink: { color: "#00e5ff" },
    identityPreviewText: { color: "#ffffff" },
    formResendCodeLink: { color: "#00e5ff" },
    socialButtonsBlockButton: "border border-white/25 bg-white/8 hover:bg-white/15 transition-colors",
    socialButtonsBlockButtonText: { color: "#ffffff", fontWeight: "500" },
    socialButtonsBlockButtonArrow: { color: "#ffffff" },
    socialButtonsProviderIcon: { opacity: 1 },
  },
} as const;

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
              Sign in
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
              Create account
            </button>
          </div>

          {mode === "sign-in" ? (
            <SignIn
              routing="hash"
              afterSignInUrl={`${base}/`}
              signUpUrl={undefined}
              appearance={clerkAppearance}
            />
          ) : (
            <SignUp
              routing="hash"
              afterSignUpUrl={`${base}/`}
              signInUrl={undefined}
              appearance={clerkAppearance}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SubscriptionWall() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const startCheckout = async (plan: string) => {
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
        body: JSON.stringify({ plan }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
      setLoadingPlan(null);
    }
  };

  const openPortal = async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Could not open billing portal");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col items-center justify-center px-6">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-lg text-white tracking-tight">
          Sharp<span className="text-cyan-400">Tracker</span>
        </span>
      </div>

      <div className="max-w-xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
          14-day free trial — card required
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Start your free trial</h1>
        <p className="text-white/50 font-mono text-sm">
          Try SharpTracker free for 14 days. Cancel anytime before the trial ends and you won't be charged.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {/* Silver */}
        <div className="rounded-xl border border-white/10 bg-white/3 p-5 flex flex-col">
          <div className="mb-4">
            <span className="text-base font-bold" style={{ color: "#9ca3af" }}>Silver</span>
            <div className="mt-1">
              <span className="text-2xl font-bold text-white">€34.99</span>
              <span className="text-xs text-white/40 font-mono ml-1">/mo</span>
            </div>
          </div>
          <ul className="text-xs text-white/60 font-mono space-y-1.5 flex-1 mb-4">
            <li>• 3 alert configs</li>
            <li>• Moneyline only</li>
            <li>• 3 sports</li>
          </ul>
          <button
            onClick={() => startCheckout("silver")}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-lg border border-white/20 text-white/80 font-mono text-xs transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPlan === "silver" ? "Redirecting…" : "Try 14 Days Free"}
          </button>
        </div>

        {/* Gold */}
        <div className="rounded-xl border border-cyan-400/50 bg-cyan-400/5 p-5 flex flex-col relative shadow-[0_0_40px_rgba(0,229,255,0.1)]">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-cyan-400 text-black text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
            Most Popular
          </div>
          <div className="mb-4">
            <span className="text-base font-bold" style={{ color: "#f59e0b" }}>Gold</span>
            <div className="mt-1">
              <span className="text-2xl font-bold text-white">€84.99</span>
              <span className="text-xs text-white/40 font-mono ml-1">/mo</span>
            </div>
          </div>
          <ul className="text-xs text-white/60 font-mono space-y-1.5 flex-1 mb-4">
            <li>• 9 alert configs</li>
            <li>• All sports & markets</li>
            <li>• Bet Tracker</li>
          </ul>
          <button
            onClick={() => startCheckout("gold")}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-lg bg-cyan-400 text-black font-mono text-xs font-semibold transition-colors hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPlan === "gold" ? "Redirecting…" : "Try 14 Days Free"}
          </button>
        </div>

        {/* Platinum */}
        <div className="rounded-xl border border-violet-500/40 bg-violet-500/5 p-5 flex flex-col">
          <div className="mb-4">
            <span className="text-base font-bold text-violet-400">Platinum</span>
            <div className="mt-1">
              <span className="text-2xl font-bold text-white">€114.99</span>
              <span className="text-xs text-white/40 font-mono ml-1">/mo</span>
            </div>
          </div>
          <ul className="text-xs text-white/60 font-mono space-y-1.5 flex-1 mb-4">
            <li>• 20 alert configs</li>
            <li>• Push notifications</li>
            <li>• CLV & CV tracking</li>
          </ul>
          <button
            onClick={() => startCheckout("platinum")}
            disabled={loadingPlan !== null}
            className="w-full py-2.5 rounded-lg border border-violet-500/40 text-violet-300 font-mono text-xs transition-colors hover:bg-violet-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPlan === "platinum" ? "Redirecting…" : "Try 14 Days Free"}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-white/30 text-xs font-mono">
          Already have a subscription?
        </p>
        <button
          onClick={openPortal}
          className="flex items-center gap-1.5 text-xs font-mono text-cyan-400/70 hover:text-cyan-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Manage billing
        </button>
      </div>
    </div>
  );
}

type SubState =
  | { status: "loading" }
  | { status: "active"; tier: PlanTier; isTrialing: boolean }
  | { status: "none" };

function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [subState, setSubState] = useState<SubState>({ status: "loading" });

  const fetchSubscription = useCallback(async (sessionId?: string) => {
    setSubState({ status: "loading" });
    try {
      // If coming back from Stripe checkout, fulfill the session first
      if (sessionId) {
        await fetch(`/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          credentials: "include",
        });
      }

      const token = await getToken();
      const res = await fetch("/api/stripe/subscription", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      const tier = data.planTier as PlanTier | null;
      const subStatus = data.subscription?.status as string | undefined;
      // Allow access for both 'active' and 'trialing' subscriptions
      const hasAccess = (subStatus === "active" || subStatus === "trialing") && tier && tier !== "none";
      if (hasAccess) {
        setSubState({ status: "active", tier: tier!, isTrialing: subStatus === "trialing" });
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

    // Check for Stripe session_id in URL (returning from checkout)
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") ?? undefined;
    if (sessionId) {
      // Clean up URL without triggering a re-render via back-stack
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

  // No active or trialing subscription — show subscription wall
  if (isSignedIn) {
    return <SubscriptionWall />;
  }

  // Not signed in — AuthGate handles this above us
  return <>{children}</>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  const { isLoaded, isSignedIn } = useUser();

  if (bypassAuth) return <>{children}</>;
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <AuthScreen />;

  return <>{children}</>;
}

function AppContent() {
  return (
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
      localization={{
        signIn: {
          start: {
            title: "Sign in to SharpTracker",
            subtitle: "Welcome back! Please sign in to continue",
          },
          emailCode: {
            title: "Check your email",
            subtitle: "to continue to SharpTracker",
            formTitle: "Verification code",
            formSubtitle: "Enter the verification code sent to your email address",
            resendButton: "Didn't receive a code? Resend",
          },
        },
        signUp: {
          start: {
            title: "Create your SharpTracker account",
            subtitle: "Sign up to get started with SharpTracker",
          },
          emailCode: {
            title: "Verify your email",
            subtitle: "to continue to SharpTracker",
            formTitle: "Verification code",
            formSubtitle: "Enter the verification code sent to your email address",
            resendButton: "Didn't receive a code? Resend",
          },
        },
      }}
    >
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
