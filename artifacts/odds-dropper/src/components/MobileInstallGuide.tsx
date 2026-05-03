import { useState, useEffect } from "react";
import { X, Share2, PlusSquare, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "st_install_guide_dismissed";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isMobileUA = /iPhone|iPad|iPod|Android/i.test(ua);
  const isNarrow = window.innerWidth < 768;
  return isMobileUA || isNarrow;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function MobileInstallGuide() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isMobileDevice()) return;
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/50"
            onClick={dismiss}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[91] bg-[#111218] border-t border-border/50 rounded-t-3xl shadow-[0_-24px_80px_rgba(0,0,0,0.85)] px-5 pt-5 pb-10"
          >
            {/* Handle bar */}
            <div className="w-10 h-1 rounded-full bg-muted/50 mx-auto mb-5" />

            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-foreground font-sans text-base">Install the app</span>
              <button
                onClick={dismiss}
                className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App identity card */}
            <div className="flex items-center gap-3 bg-white/[0.04] border border-border/40 rounded-xl p-3 mb-7">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm font-sans">SharpTracker</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {typeof window !== "undefined" ? window.location.hostname : "sharptracker.io"}
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono shrink-0">1</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-foreground">Tap</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/8 border border-border/60 shrink-0">
                    <Share2 className="w-4 h-4 text-foreground" />
                  </span>
                  <span className="text-sm text-foreground">in the browser menu</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono shrink-0">2</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-foreground">Scroll down and tap</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/8 border border-border/60 text-xs font-mono text-foreground shrink-0">
                    <PlusSquare className="w-3.5 h-3.5" />
                    Add to Home Screen
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono shrink-0">3</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-foreground">Look for the</span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                    <Activity className="w-4 h-4 text-primary" />
                  </span>
                  <span className="text-sm text-foreground">icon on your home screen</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
