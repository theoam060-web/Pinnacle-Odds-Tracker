import { QRCodeSVG } from "qrcode.react";
import { X, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface QRInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export function QRInstallModal({ open, onClose }: QRInstallModalProps) {
  const appUrl = typeof window !== "undefined"
    ? window.location.origin + "/app/"
    : "https://sharptracker.io/app/";
  const logoSrc = import.meta.env.BASE_URL + "icon-192.png";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center gap-5 bg-[#0f1014] border border-border/60 rounded-2xl px-8 py-8 max-w-[320px] w-full mx-4 shadow-[0_40px_100px_rgba(0,0,0,0.85)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 self-start">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-foreground font-sans text-sm">SharpTracker</span>
            </div>

            {/* QR code box */}
            <div className="p-3.5 bg-white rounded-2xl shadow-inner">
              <QRCodeSVG
                value={appUrl}
                size={210}
                level="H"
                imageSettings={{
                  src: logoSrc,
                  width: 46,
                  height: 46,
                  excavate: true,
                }}
              />
            </div>

            {/* Caption */}
            <div className="text-center space-y-1.5">
              <p className="font-bold text-foreground text-[15px] font-sans leading-tight">
                Never miss a drop even on the go!
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Scan the QR code to open the app on your iPhone or Android smartphone.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
