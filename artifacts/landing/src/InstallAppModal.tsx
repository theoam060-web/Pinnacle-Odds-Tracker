import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download } from "lucide-react";
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
const APP_URL = "https://sharptracker.io/?install=1";

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
}

export default function InstallAppModal({ open, onClose, deferredPrompt, onNativeInstall }: Props) {
  const [installing, setInstalling] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

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

  if (mobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Bottom sheet */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-[#111318] rounded-t-3xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top handle bar */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <img src={`${BASE}icon-192.png`} alt="" className="w-4 h-4 rounded-sm opacity-70" />
                  <span className="text-sm text-white/60 font-medium">Installera appen</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/8 hover:bg-white/15 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white/50">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </button>
              </div>

              {/* App info card */}
              <div className="mx-4 mb-5 bg-[#1c1e26] border border-white/8 rounded-2xl flex items-center gap-3.5 px-4 py-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0a0b10] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={`${BASE}icon-192.png`} alt="SharpTracker" className="w-10 h-10 rounded-xl" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white leading-tight">SharpTracker</p>
                  <p className="text-[13px] text-white/45 mt-0.5">sharptracker.io</p>
                </div>
              </div>

              {/* Android native install */}
              {deferredPrompt && (
                <div className="px-4 mb-4">
                  <button
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="w-full flex items-center justify-center gap-2 bg-[#00e5ff] hover:bg-[#00ccee] disabled:opacity-60 text-black font-semibold text-sm rounded-2xl py-3.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {installing ? "Installerar..." : "Installera SharpTracker"}
                  </button>
                </div>
              )}

              {/* Steps */}
              <div className="px-4 pb-4 space-y-4">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <span className="text-[15px] font-medium text-white/90 shrink-0 w-4">1.</span>
                  <p className="text-[15px] text-white/80 leading-snug flex items-center gap-1.5 flex-wrap">
                    Tryck på{" "}
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-[#1c1e26] border border-white/15 rounded-lg align-middle">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
                        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                        <polyline points="16 6 12 2 8 6"/>
                        <line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                    </span>{" "}
                    i webbläsarmenyn
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <span className="text-[15px] font-medium text-white/90 shrink-0 w-4">2.</span>
                  <p className="text-[15px] text-white/80 leading-snug flex items-center gap-1.5 flex-wrap">
                    Scrolla ner och tryck på{" "}
                    <span className="inline-flex items-center bg-[#1c1e26] border border-white/15 rounded-lg px-2 py-0.5 text-[12px] text-white align-middle">
                      Lägg till på hemskärmen
                    </span>
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <span className="text-[15px] font-medium text-white/90 shrink-0 w-4">3.</span>
                  <p className="text-[15px] text-white/80 leading-snug flex items-center gap-1.5 flex-wrap">
                    Hitta{" "}
                    <img src={`${BASE}icon-192.png`} alt="" className="inline w-6 h-6 rounded-lg align-middle" />{" "}
                    ikonen på din hemskärm
                  </p>
                </div>
              </div>

              {/* Dismiss button */}
              <div className="flex justify-center pb-10 pt-2">
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1c1e26] border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /* ── Desktop: centered modal with QR code ── */
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
            className="relative z-10 w-full max-w-sm bg-[#111318] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <img src={`${BASE}icon-192.png`} alt="SharpTracker" className="w-8 h-8 rounded-xl" />
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">Installera appen</p>
                  <p className="text-[11px] text-white/40 font-mono">sharptracker.io</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/50" />
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center py-6 gap-3 px-5">
              <p className="text-xs text-white/50 text-center mb-1">
                Skanna med din telefon för att öppna SharpTracker
              </p>
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <QRCodeSVG
                  value={APP_URL}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0a0b0f"
                  level="H"
                  imageSettings={{
                    src: `${BASE}sharptracker-qr-icon.png`,
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    opacity: 1,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="px-5 pb-6 space-y-3">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">
                Installera via Safari
              </p>
              {[
                {
                  step: "1",
                  content: (
                    <>
                      Tryck på{" "}
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-white/10 border border-white/15 rounded-md mx-0.5 align-middle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white">
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
                      Scrolla ner, tryck på{" "}
                      <span className="inline-flex items-center gap-1 bg-white/10 border border-white/15 rounded-md px-1.5 py-0.5 text-[11px] text-white align-middle mx-0.5">
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
                      på hemskärmen
                    </>
                  ),
                },
              ].map(({ step, content }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#00e5ff]/15 border border-[#00e5ff]/30 text-[#00e5ff] text-[11px] font-bold font-mono flex items-center justify-center mt-0.5">
                    {step}
                  </span>
                  <p className="text-sm text-white/75 leading-snug">{content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
