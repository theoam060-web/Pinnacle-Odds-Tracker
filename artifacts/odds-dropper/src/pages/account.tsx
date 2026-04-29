import { useUser, useAuth, useClerk } from "@clerk/react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { usePlan } from "@/lib/plan-context";
import {
  User,
  CreditCard,
  LogOut,
  ExternalLink,
  Crown,
  Shield,
  Zap,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

type SubData = {
  subscription?: {
    status?: string;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    trial_end?: number;
  };
  planTier?: string;
};

const PLAN_META: Record<
  string,
  { label: string; color: string; icon: React.ElementType; border: string; bg: string }
> = {
  silver: {
    label: "Silver",
    color: "text-[#9ca3af]",
    icon: Shield,
    border: "border-[#9ca3af]/30",
    bg: "bg-[#9ca3af]/5",
  },
  gold: {
    label: "Gold",
    color: "text-amber-400",
    icon: Crown,
    border: "border-amber-400/30",
    bg: "bg-amber-400/5",
  },
  platinum: {
    label: "Platinum",
    color: "text-violet-400",
    icon: Zap,
    border: "border-violet-400/30",
    bg: "bg-violet-400/5",
  },
};

function formatDate(ts?: number) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AccountPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const tier = usePlan();

  const [sub, setSub] = useState<SubData | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch("/api/stripe/subscription", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json();
        setSub(data);
      } catch {
        setSub(null);
      } finally {
        setSubLoading(false);
      }
    })();
  }, [getToken]);

  const openPortal = async () => {
    setPortalError(null);
    setPortalLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError("Could not open billing portal. Please try again.");
      }
    } catch {
      setPortalError("Could not open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const planMeta = PLAN_META[tier] ?? PLAN_META["silver"];
  const PlanIcon = planMeta.icon;
  const subStatus = sub?.subscription?.status;
  const isTrialing = subStatus === "trialing";
  const isActive = subStatus === "active";
  const willCancel = sub?.subscription?.cancel_at_period_end;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Live Feed
            </button>
          </Link>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">Account</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and subscription</p>
        </div>

        {/* Profile card */}
        <div className="rounded-xl border border-border/40 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-3 border-b border-border/20">
            <User className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Profile</span>
          </div>
          <div className="px-4 py-4 flex items-center gap-4">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="w-12 h-12 rounded-full border border-border/40 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary/60" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {user?.fullName ?? user?.firstName ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {user?.primaryEmailAddress?.emailAddress ?? "—"}
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign out
            </button>
          </div>
        </div>

        {/* Subscription card */}
        <div className="rounded-xl border border-border/40 overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)" }}>
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-3 border-b border-border/20">
            <CreditCard className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Subscription</span>
          </div>

          <div className="px-4 py-4 space-y-4">
            {subLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />
                Loading subscription…
              </div>
            ) : (
              <>
                {/* Plan badge */}
                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${planMeta.border} ${planMeta.bg}`}>
                  <PlanIcon className={`w-4 h-4 ${planMeta.color}`} />
                  <span className={`font-bold text-sm ${planMeta.color}`}>{planMeta.label}</span>
                  <span className="text-xs text-muted-foreground font-mono">Plan</span>
                </div>

                {/* Status row */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  {isTrialing ? (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-semibold">Trial active</span>
                      <span className="text-muted-foreground">
                        — ends {formatDate(sub?.subscription?.trial_end)}
                      </span>
                    </>
                  ) : isActive && willCancel ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-semibold">Cancels</span>
                      <span className="text-muted-foreground">
                        — access until {formatDate(sub?.subscription?.current_period_end)}
                      </span>
                    </>
                  ) : isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-semibold">Active</span>
                      <span className="text-muted-foreground">
                        — renews {formatDate(sub?.subscription?.current_period_end)}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-400">No active subscription</span>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border/30" />

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-mono font-semibold transition-all hover:bg-primary/15 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {portalLoading ? "Opening…" : "Manage Billing"}
                  </button>

                  <button
                    onClick={openPortal}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 text-red-400/70 text-xs font-mono transition-all hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel Subscription
                  </button>

                  {portalError && (
                    <p className="text-xs text-red-400 font-mono text-center">{portalError}</p>
                  )}

                  <p className="text-[10px] text-muted-foreground/50 text-center font-mono leading-relaxed">
                    Billing is managed securely by Stripe. You can change your plan or cancel at any time.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
