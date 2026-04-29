import { ClerkProvider, useUser, SignIn, SignUp } from "@clerk/react";
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
import React, { useState } from "react";
import { Activity, LogIn, UserPlus } from "lucide-react";
import { PlanContext } from "@/lib/plan-context";

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
              <PlanContext.Provider value="platinum">
                <AuthGate>
                  <AppServices />
                  <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                    <Router />
                  </WouterRouter>
                  <Toaster />
                </AuthGate>
              </PlanContext.Provider>
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
