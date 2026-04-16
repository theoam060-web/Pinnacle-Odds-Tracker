import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Smartphone, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  deferredPrompt?: BeforeInstallPromptEvent | null;
  onNativeInstall?: () => Promise<void>;
}

const BASE = import.meta.env.BASE_URL || "/";

export default function InstallAppModal({ open, onClose, deferredPrompt, onNativeInstall }: Props) {
  const appUrl = "https://sharptracker.io/app/";
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleNativeInstall = async () => {
    if (!onNativeInstall) return;
    setInstalling(true);
    try {
      await onNativeInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            className="relative z-10 w-full max-w-sm bg-[#0d0e14] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <img src={`${BASE}icon-192.png`} alt="SharpTracker" className="w-8 h-8 rounded-lg" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">Installera appen</p>
                  <p className="text-[11px] text-muted-foreground font-mono">sharptracker.io</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Native install button — shown when browser supports it */}
            {deferredPrompt && (
              <div className="px-5 pt-5">
                <button
                  onClick={handleNativeInstall}
                  disabled={installing}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-background font-semibold text-sm rounded-xl py-3 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {installing ? "Installerar..." : "Installera SharpTracker"}
                </button>
                <div className="flex items-center gap-3 mt-4 mb-2">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">eller skanna QR</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center py-5 gap-3 px-5">
              {!deferredPrompt && (
                <p className="text-xs font-mono text-muted-foreground text-center mb-1">
                  Skanna med din telefon för att öppna SharpTracker
                </p>
              )}
              <div className="bg-white rounded-xl p-3 shadow-lg">
                {appUrl && (
                  <QRCodeSVG
                    value={appUrl}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0a0b0f"
                    level="H"
                    imageSettings={{
                      src: `${BASE}icon-192.png`,
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      opacity: 1,
                      excavate: true,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Install steps */}
            <div className="px-5 pb-6 space-y-3">
              <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-2">
                Hur man installerar (iOS / Safari)
              </p>
              {[
                {
                  step: "1",
                  content: (
                    <>
                      Tryck på{" "}
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-white/10 border border-white/15 rounded-md mx-0.5 align-middle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-foreground">
                          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                          <polyline points="16 6 12 2 8 6"/>
                          <line x1="12" y1="2" x2="12" y2="15"/>
                        </svg>
                      </span>{" "}
                      i webbläsarmenyn
                    </>
                  ),
                },
                {
                  step: "2",
                  content: (
                    <>
                      Scrolla ner och tryck på{" "}
                      <span className="inline-flex items-center gap-1 bg-white/10 border border-white/15 rounded-md px-1.5 py-0.5 text-[11px] font-mono text-foreground align-middle mx-0.5">
                        Lägg till på hemskärmen
                      </span>
                    </>
                  ),
                },
                {
                  step: "3",
                  content: (
                    <>
                      Hitta{" "}
                      <img src={`${BASE}icon-192.png`} alt="" className="inline w-5 h-5 rounded-md align-middle mx-0.5" />{" "}
                      ikonen på din hemskärm
                    </>
                  ),
                },
              ].map(({ step, content }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[11px] font-bold font-mono flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-foreground/80 leading-snug">{content}</p>
                </div>
              ))}
            </div>

            {/* Bottom note */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/6 px-3 py-2.5">
                <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-[11px] font-mono text-muted-foreground">
                  Fungerar på iOS och Android · Gratis · Inga notis-behörigheter krävs
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
