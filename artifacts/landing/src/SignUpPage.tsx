import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Activity } from "lucide-react";

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
            {/* Google G logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
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
