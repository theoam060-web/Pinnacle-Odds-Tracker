import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity, ArrowLeft, XCircle } from "lucide-react";

export default function CancelPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-sans font-bold text-lg tracking-tight">
              Sharp<span className="text-primary">Tracker</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl scale-150" />
              <XCircle className="w-16 h-16 text-foreground/30 relative z-10" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold mb-3">Checkout cancelled</h1>
          <p className="text-foreground/60 text-base mb-10">
            No worries — you haven't been charged. Come back whenever you're ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/pricing")}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:bg-primary/90 transition-all"
            >
              View plans
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border/50 text-foreground/60 font-mono text-sm hover:text-foreground hover:border-border transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
