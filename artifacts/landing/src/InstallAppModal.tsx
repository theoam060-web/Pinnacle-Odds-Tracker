import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Smartphone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InstallAppModal({ open, onClose }: Props) {
  const [appUrl, setAppUrl] = useState("");

  useEffect(() => {
    setAppUrl(window.location.origin + (import.meta.env.BASE_URL || "/"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
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
                <img src="/icon-192.png" alt="SharpTracker" className="w-8 h-8 rounded-lg" />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">Install the app</p>
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

            {/* QR Code */}
            <div className="flex flex-col items-center py-6 gap-3 px-5">
              <p className="text-xs font-mono text-muted-foreground text-center mb-1">
                Scan with your phone to open SharpTracker
              </p>
              <div className="bg-white rounded-xl p-3 shadow-lg">
                {appUrl && (
                  <QRCodeSVG
                    value={appUrl}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#0a0b0f"
                    level="H"
                    imageSettings={{
                      src: "/icon-192.png",
                      x: undefined,
                      y: undefined,
                      height: 36,
                      width: 36,
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
                How to install
              </p>
              {[
                {
                  step: "1",
                  content: (
                    <>
                      Tap{" "}
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-white/10 border border-white/15 rounded-md mx-0.5 align-middle">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-foreground">
                          <path d="M12 2l-3 4h2v7h2V6h2l-3-4zm-6 14v3a1 1 0 001 1h10a1 1 0 001-1v-3h-2v2H8v-2H6z"/>
                        </svg>
                      </span>{" "}
                      in the browser menu
                    </>
                  ),
                },
                {
                  step: "2",
                  content: (
                    <>
                      Scroll down and tap{" "}
                      <span className="inline-flex items-center gap-1 bg-white/10 border border-white/15 rounded-md px-1.5 py-0.5 text-[11px] font-mono text-foreground align-middle mx-0.5">
                        Add to Home Screen
                      </span>
                    </>
                  ),
                },
                {
                  step: "3",
                  content: (
                    <>
                      Look for the{" "}
                      <img src="/icon-192.png" alt="" className="inline w-5 h-5 rounded-md align-middle mx-0.5" />{" "}
                      icon on your home screen
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
