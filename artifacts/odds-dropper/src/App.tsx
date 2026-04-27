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
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Activity, LogIn, UserPlus, ArrowRight, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { PlanContext, type PlanTier } from "@/lib/plan-context";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const API_BASE = "";

// Stripe-hosted Payment Links — when a plan has one configured here, Subscribe
// redirects directly to it (with client_reference_id) instead of calling our
// /api/stripe/checkout endpoint.
const PAYMENT_LINKS: Record<string, string> = {
  silver: "https://buy.stripe.com/8x200caQU5tN9PV4rWeZ200",
};

// Shared key the SubscriptionGate reads on return to detect "user just left
// for Stripe" so it can briefly poll the subscription endpoint while waiting
// for the webhook to land. Must match the landing PricingPage.
const PENDING_CHECKOUT_KEY = "sharptracker.pendingCheckout";
// Window during which a pending checkout flag is considered relevant. Beyond
// this we ignore stale flags so genuinely unsubscribed users don't get stuck
// in loading on every visit.
const PENDING_CHECKOUT_TTL_MS = 30 * 60 * 1000; // 30 minutes

function markPendingCheckout() {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, String(Date.now()));
    localStorage.setItem(PENDING_CHECKOUT_KEY, String(Date.now()));
  } catch {
    /* storage may be unavailable in some browsers/modes — non-fatal */
  }
}

function consumePendingCheckout(): boolean {
  try {
    const raw =
      sessionStorage.getItem(PENDING_CHECKOUT_KEY) ??
      localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
    return Number.isFinite(ts) && Date.now() - ts < PENDING_CHECKOUT_TTL_MS;
  } catch {
    return false;
  }
}

function openCheckoutUrl(url: string) {
  // Signal to the SubscriptionGate that the user is on their way to Stripe,
  // so when they come back we know to poll briefly while the webhook lands.
  markPendingCheckout();
  try {
    (window.top ?? window).location.href = url;
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

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

  const { user } = useUser();

  const handleCheckout = useCallback(
    async (plan: string) => {
      setCheckingOut(plan);

      // Plans wired to a Stripe Payment Link skip the API and redirect directly.
      const paymentLink = PAYMENT_LINKS[plan];
      if (paymentLink) {
        const url = new URL(paymentLink);
        if (user?.id) url.searchParams.set("client_reference_id", user.id);
        const email = user?.primaryEmailAddress?.emailAddress;
        if (email) url.searchParams.set("prefilled_email", email);
        openCheckoutUrl(url.toString());
        return;
      }

      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan, redirectAfter: "/app/" }),
        });
        const data = await res.json();
        if (data.url) {
          openCheckoutUrl(data.url);
        }
      } catch {
        setCheckingOut(null);
      }
    },
    [getToken, user],
  );

  const PLAN_FEATURES: Record<string, { text: string; bold?: boolean }[]> = {
    silver: [
      { text: "Dropping odds alerts", bold: true },
      { text: "3 alert configurations" },
      { text: "Bet size calculator" },
      { text: "3 sports" },
      { text: "3 markets per sport" },
      { text: "Only members Telegram group" },
    ],
    gold: [
      { text: "Everything in Silver" },
      { text: "9 alert configurations", bold: true },
      { text: "ALL sports — every league covered", bold: true },
      { text: "ALL markets", bold: true },
      { text: "Bet Tracker & Bet Stats", bold: true },
      { text: "Odds movement history" },
      { text: "Live EV in Bet Tracker" },
      { text: "Closing EV in Bet Tracker" },
    ],
    platinum: [
      { text: "Everything in Gold" },
      { text: "20 alert configurations", bold: true },
      { text: "Bookmaker comparison" },
      { text: "Push notifications on app", bold: true },
      { text: "Current CLV & Current CV" },
    ],
  };

  const PLAN_COLORS: Record<string, { name: string; border: string; bg: string; text: string; btn: string }> = {
    silver:   { name: "text-white",        border: "border-white/15",      bg: "bg-[#0e0f14]", text: "text-white",        btn: "bg-transparent border border-white/20 text-white hover:bg-white/8" },
    gold:     { name: "text-cyan-400",     border: "border-cyan-400/60",   bg: "bg-[#080f14]", text: "text-cyan-400",     btn: "bg-cyan-400 text-black hover:bg-cyan-300" },
    platinum: { name: "text-violet-400",   border: "border-violet-500/50", bg: "bg-[#0c0814]", text: "text-violet-400",   btn: "bg-violet-600 text-white hover:bg-violet-500" },
  };

  function formatPrice(unitAmount: number) {
    const total = (unitAmount / 100).toFixed(2);
    const [intPart, decPart] = total.split(".");
    return { int: `€${intPart}`, dec: `.${decPart}` };
  }

  return (
    <div className="min-h-screen bg-[#080809] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-lg text-white tracking-tight">
            Sharp<span className="text-cyan-400">Tracker</span>
          </span>
        </a>
        <button
          onClick={() => signOut()}
          className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
        >
          Logga ut
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="w-full max-w-5xl">
          <h1 className="text-5xl font-extrabold text-white text-center mb-12 tracking-tight">Pricing</h1>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center text-white/30 text-sm font-mono py-12">
              Kunde inte ladda prenumerationer. Försök igen.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {plans.map((plan) => {
                const planKey = plan.metadata?.plan ?? "";
                const price = plan.prices?.[0];
                const features = PLAN_FEATURES[planKey] ?? [];
                const colors = PLAN_COLORS[planKey] ?? PLAN_COLORS.silver;
                const isGold = planKey === "gold";
                const isLoading = checkingOut === planKey;
                const shortName = plan.name.replace("SharpTracker ", "");
                const { int: priceInt, dec: priceDec } = price
                  ? formatPrice(price.unit_amount)
                  : { int: "—", dec: "" };

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl border p-6 transition-all ${colors.border} ${colors.bg}`}
                  >
                    {isGold && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 bg-cyan-400 text-black text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                          <span>⭐</span> Most Popular
                        </span>
                      </div>
                    )}

                    <div className={`text-2xl font-bold mb-1 mt-2 ${colors.name}`}>{shortName}</div>

                    <div className="flex items-end gap-0.5 mt-2 mb-1">
                      <span className="text-5xl font-extrabold text-white leading-none">{priceInt}</span>
                      <span className="text-2xl font-bold text-white/70 mb-1">{priceDec}</span>
                    </div>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-4">per month</p>

                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Bookmaker</p>
                      <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-lg px-3 py-1 text-xs text-white font-semibold">
                        <span className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[9px] font-black text-white">P</span>
                        Pinnacle
                      </span>
                    </div>

                    <ul className="space-y-2.5 mb-6 flex-1">
                      {features.map((f) => (
                        <li key={f.text} className="flex items-start gap-2.5 text-sm">
                          <span className="text-cyan-400 font-bold mt-0.5 shrink-0">✓</span>
                          <span className={f.bold ? "font-bold text-white" : "text-white/65"}>{f.text}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => planKey && handleCheckout(planKey)}
                      disabled={!planKey || !!checkingOut}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${colors.btn}`}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Started"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-white/20 text-xs mt-8">
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

  // Tracks whether the gate is still mounted; polling/check loops use this to
  // avoid setting state after unmount.
  const aliveRef = useRef(true);

  // Returns true when an active subscription was found.
  const check = useCallback(async (): Promise<boolean> => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/stripe/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!aliveRef.current) return false;
      if (!res.ok) { setStatus("none"); return false; }
      const data = await res.json();
      if (!aliveRef.current) return false;
      const sub = data.subscription;
      const isActive = sub?.status === "active" || sub?.status === "trialing";
      if (isActive) {
        const t = data.planTier as PlanTier | null | undefined;
        if (t === "silver" || t === "gold" || t === "platinum") {
          setPlanTier(t);
          setStatus("active");
          return true;
        }
      }
      setStatus("none");
      return false;
    } catch {
      if (aliveRef.current) setStatus("none");
      return false;
    }
  }, [getToken]);

  // Briefly poll the subscription endpoint after a Stripe redirect, since the
  // webhook → DB update may lag a few seconds. Stops as soon as we see "active"
  // or the component unmounts.
  const pollUntilActive = useCallback(async (timeoutMs = 12000, intervalMs = 1500) => {
    if (!aliveRef.current) return;
    setStatus("loading");
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline && aliveRef.current) {
      const active = await check();
      if (active || !aliveRef.current) return;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    if (aliveRef.current) await check();
  }, [check]);

  useEffect(() => {
    aliveRef.current = true;
    if (bypassAuth || isAdmin) {
      setPlanTier("platinum");
      setStatus("active");
      return () => { aliveRef.current = false; };
    }

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    // Optional explicit return marker. Stripe Payment Links can be configured
    // to redirect to /app/?stripe_success=1, but we no longer require it —
    // we also detect post-checkout returns via the pending-checkout flag set
    // when the user clicked Subscribe.
    const stripeSuccess = params.get("stripe_success");

    // Case 1: Hosted Checkout returned with session_id — fulfill explicitly,
    // then check subscription. Avoids relying on webhook timing entirely.
    if (sessionId) {
      // Consume any pending-checkout flag so it doesn't trigger polling later
      consumePendingCheckout();
      params.delete("session_id");
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
      window.history.replaceState({}, "", newUrl);

      getToken().then((token) => {
        if (!aliveRef.current) return;
        fetch(`${API_BASE}/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        })
          .catch(() => {})
          .finally(() => { if (aliveRef.current) void check(); });
      });
      return () => { aliveRef.current = false; };
    }

    // Case 2: User just came back from Stripe (Payment Link or otherwise)
    // without a session_id. We detect this either via:
    //   (a) ?stripe_success=1 query param (if Stripe redirect was configured), or
    //   (b) the pending-checkout flag set in storage when Subscribe was clicked.
    // In either case, poll briefly to bridge the webhook → DB latency window.
    const recentlyCheckedOut = consumePendingCheckout();
    if (stripeSuccess || recentlyCheckedOut) {
      if (stripeSuccess) {
        params.delete("stripe_success");
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newUrl);
      }
      void pollUntilActive();
      return () => { aliveRef.current = false; };
    }

    void check();
    return () => { aliveRef.current = false; };
  }, [bypassAuth, isAdmin, check, pollUntilActive, getToken]);

  if (status === "loading") return <LoadingScreen label="Kontrollerar prenumeration…" />;
  if (status === "none") return <SubscriptionWall />;
  return <PlanContext.Provider value={planTier}>{children}</PlanContext.Provider>;
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
