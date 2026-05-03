import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function SignUpPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col items-center justify-center px-6">

      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
      >
        <Activity className="w-4 h-4 text-primary" />
        <span className="font-sans font-bold text-foreground">Sharp<span className="text-primary">Tracker</span></span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

          <div className="flex items-center justify-center gap-2 mb-8">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-sans font-bold text-xl text-foreground">
              Sharp<span className="text-primary">Tracker</span>
            </span>
          </div>

          <h1 className="text-xl font-sans font-bold text-foreground text-center mb-1">
            Create your account
          </h1>
          <p className="text-foreground/50 text-sm text-center font-mono mb-8">
            Get your edge. No credit card required.
          </p>

          <button
            onClick={() => { window.location.href = "/api/auth/google"; }}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-sans font-semibold text-sm px-5 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="text-foreground/30 text-[11px] text-center font-mono mt-6 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="text-center text-sm font-mono text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={() => { window.location.href = "/api/auth/google"; }}
            className="text-primary hover:underline"
          >
            Sign in with Google
          </button>
        </p>

      </motion.div>
    </div>
  );
}
