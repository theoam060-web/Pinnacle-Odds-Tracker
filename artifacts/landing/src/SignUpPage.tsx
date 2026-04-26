import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity } from "lucide-react";
import GoogleIcon from "./components/GoogleIcon";

export default function SignUpPage() {
  const [, navigate] = useLocation();

  const handleGoogleSignIn = () => {
    // Redirect to Google OAuth. Replace GOOGLE_CLIENT_ID with your actual
    // Google Cloud OAuth 2.0 client ID once configured.
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + "/auth/callback");
    const scope = encodeURIComponent("openid email profile");

    if (!clientId) {
      // Placeholder until Google OAuth is configured
      alert("Google sign-in not yet configured. Add VITE_GOOGLE_CLIENT_ID to environment.");
      return;
    }

    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=select_account`;
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans flex flex-col items-center justify-center px-6">

      {/* Back to home */}
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
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-8 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

          {/* Logo */}
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

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-sans font-semibold text-sm px-5 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          <p className="text-foreground/30 text-[11px] text-center font-mono mt-6 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Already have account */}
        <p className="text-center text-sm font-mono text-muted-foreground mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/")} className="text-primary hover:underline">
            Log in
          </button>
        </p>

      </motion.div>
    </div>
  );
}
