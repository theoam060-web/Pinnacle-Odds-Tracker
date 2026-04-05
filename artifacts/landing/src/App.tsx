import { Switch, Route, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { 
  Activity, BarChart3, Bell, Crosshair, 
  LineChart, Radar, ShieldAlert, Target, 
  TrendingUp, Zap, ChevronRight, CheckCircle2,
  Volume2, Globe, Database, Smartphone, Laptop
} from "lucide-react";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// --- Mock Data ---

const LIVE_ODDS = [
  { id: 1, match: "LAL @ DEN", market: "Moneyline", old: "+145", new: "+120", drop: "17.2%", time: "0.8s ago", sharp: true },
  { id: 2, match: "MIA @ MIA", market: "Spread -4.5", old: "-110", new: "-125", drop: "13.6%", time: "1.2s ago", sharp: true },
  { id: 3, match: "ARS vs CHE", market: "Total O 2.5", old: "+105", new: "-115", drop: "19.0%", time: "2.4s ago", sharp: false },
  { id: 4, match: "NYY @ BOS", market: "Moneyline", old: "-130", new: "-150", drop: "15.3%", time: "3.1s ago", sharp: true },
  { id: 5, match: "DAL @ SF", market: "Total U 42.5", old: "-115", new: "-135", drop: "17.4%", time: "4.5s ago", sharp: false },
];

const STEPS = [
  {
    icon: <Radar className="w-6 h-6 text-primary" />,
    title: "Choose Your Markets",
    description: "Select exactly which sports, leagues, and bet types you care about. Filter out everything else — only what's relevant reaches you."
  },
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "Define Your Thresholds",
    description: "Set a minimum drop percentage per market. Only moves that clear your bar trigger a notification — no noise, no false positives."
  },
  {
    icon: <Zap className="w-6 h-6 text-primary" />,
    title: "We Watch 24/7",
    description: "SharpTracker continuously monitors Pinnacle around the clock. The instant a qualifying line shifts, we catch it — regardless of the hour."
  },
  {
    icon: <Bell className="w-6 h-6 text-primary" />,
    title: "You're First to Know",
    description: "A real-time alert lands before the broader market has had a chance to react. Your edge is the time between the move and everyone else noticing."
  }
];

// --- Components ---

const GlitchText = ({ text, className = "" }: { text: string, className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -translate-x-[2px] translate-y-[1px] text-primary opacity-50 z-0 blur-[1px]">{text}</span>
      <span className="absolute top-0 left-0 translate-x-[2px] -translate-y-[1px] text-destructive opacity-50 z-0 blur-[1px]">{text}</span>
    </span>
  );
};

const BlinkingDot = () => (
  <motion.span 
    animate={{ opacity: [1, 0.2, 1] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
  />
);

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${scrolled ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto pl-2 pr-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-sans font-bold text-xl tracking-tight text-foreground">Sharp<span className="text-primary">Tracker</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wide text-muted-foreground">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#terminal" className="hover:text-primary transition-colors">Terminal</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:block text-sm font-mono text-foreground hover:text-primary transition-colors" data-testid="btn-login">Log In</button>
          <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-md font-mono text-sm transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]" data-testid="btn-get-access">
            Get Access
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <BlinkingDot /> System Online
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-sans tracking-tighter leading-[1.1] mb-6 text-foreground"
          >
            Track Sharp Odds Drops <br />
            <GlitchText text="Before Anyone Else." className="text-white" />
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl"
          >
            Find mathematically profitable value bets by acting on real-time line movements from the world's foremost odds-making authority — before the rest of the market adjusts.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-mono font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.4)]" data-testid="btn-start-terminal">
              Launch Terminal <ChevronRight className="w-5 h-5" />
            </button>
            <button className="bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-md font-mono tracking-wide flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors" data-testid="btn-view-docs">
              View Documentation
            </button>
          </motion.div>

        </div>

        {/* Hero Terminal Mockup */}
        <motion.div 
          initial={{ opacity: 0, x: 20, rotateY: -10 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          style={{ perspective: 1000 }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl blur-3xl -z-10 scale-105"></div>
          <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_60px_rgba(0,255,255,0.08)] transform-gpu">
            <img
              src={`${import.meta.env.BASE_URL}feed-screenshot.jpg`}
              alt="SharpTracker Live Market Feed"
              className="w-full block"
              style={{ maxWidth: 640 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TerminalSection() {
  return (
    <section id="terminal" className="py-24 bg-background relative border-t border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-6">Observe the Matrix.</h2>
          <p className="text-muted-foreground text-lg">
            Stop refreshing sportsbooks. Our terminal ingests thousands of WebSocket events per second, surfacing meaningful price discovery instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono mb-2 border border-border">
                <Radar className="w-4 h-4 text-primary" /> Event Stream
              </div>
              <h3 className="text-2xl font-bold font-sans">See the steam.</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                When a syndicate hits the market, the line moves across books in milliseconds. SharpTracker visualizes these drops instantly, highlighting significant EV+ opportunities before they disappear.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-secondary text-secondary-foreground text-xs font-mono mb-2 border border-border">
                <LineChart className="w-4 h-4 text-primary" /> Price History
              </div>
              <h3 className="text-2xl font-bold font-sans">Chart the sentiment.</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Every line movement is charted tick-by-tick. Identify resistance levels in spreads and totals, and understand the narrative arc of the market leading up to gametime.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 bg-primary/5 blur-xl rounded-full z-0"></div>
            <div className="bg-card border border-border rounded-xl p-1 relative z-10 shadow-2xl">
              <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
                {/* Mockup Top Bar */}
                <div className="flex border-b border-border/50 text-xs font-mono">
                  <div className="px-4 py-2 bg-muted/50 border-r border-border/50 flex items-center gap-2 text-foreground">
                    <Activity className="w-3 h-3 text-primary" /> Live Feed
                  </div>
                  <div className="px-4 py-2 text-muted-foreground flex items-center gap-2 hover:bg-muted/30 cursor-pointer">
                    <TrendingUp className="w-3 h-3" /> CLV Tracker
                  </div>
                </div>
                
                {/* Mockup Content */}
                <div className="flex h-[400px]">
                  {/* Left Sidebar */}
                  <div className="w-48 border-r border-border/50 bg-muted/10 p-4 space-y-4 hidden md:block">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Sports</div>
                    <div className="space-y-1">
                      {['NBA', 'NFL', 'MLB', 'NHL', 'Soccer'].map((sport, i) => (
                        <div key={sport} className={`text-xs font-mono px-2 py-1.5 rounded cursor-pointer ${i === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground'}`}>
                          {sport}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main Feed */}
                  <div className="flex-1 bg-background p-4 overflow-hidden relative">
                    {/* Animated grid background inside terminal */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                    
                    <div className="relative z-10 space-y-3">
                       <div className="flex justify-between items-center pb-2 border-b border-border/30">
                         <div className="text-xs font-mono text-muted-foreground">Latest Drops (Pinnacle)</div>
                         <div className="text-[10px] font-mono text-primary flex items-center gap-1"><BlinkingDot /> Connected</div>
                       </div>
                       
                       <div className="space-y-2">
                         {[1,2,3,4].map((i) => (
                           <div key={i} className="flex justify-between items-center bg-card border border-border/50 p-3 rounded text-sm font-mono">
                             <div className="flex flex-col gap-1">
                               <span className="text-foreground font-medium">BOS Celtics @ MIA Heat</span>
                               <span className="text-xs text-muted-foreground">Spread - BOS -4.5</span>
                             </div>
                             <div className="flex flex-col items-end gap-1">
                               <div className="flex items-center gap-2">
                                 <span className="text-muted-foreground line-through text-xs">-110</span>
                                 <span className="text-primary font-bold">-125</span>
                               </div>
                               <span className="text-[10px] text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">EV: +4.2%</span>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-secondary/30 border-y border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-4">Your filters. Your rules.</h2>
          <p className="text-muted-foreground">Build precise alert configurations by market and line type. SharpTracker watches Pinnacle non-stop — the moment a qualifying line moves, you're the first to act on it.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {STEPS.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,255,255,0.08)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                {step.icon}
              </div>
              <div className="text-xs font-mono text-primary/60 mb-2 uppercase tracking-widest">Step {idx + 1}</div>
              <h3 className="text-xl font-bold font-sans mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CLVSection() {
  return (
    <section id="clv" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <div className="order-2 lg:order-1">
             {/* Chart Mockup */}
             <div className="bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
               <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-4">
                 <div>
                   <div className="text-sm font-mono text-muted-foreground mb-1">Closing Line Value (30 Days)</div>
                   <div className="text-3xl font-bold font-sans text-primary">+8.4%</div>
                 </div>
                 <div className="text-right">
                   <div className="text-sm font-mono text-muted-foreground mb-1">Beat CLV</div>
                   <div className="text-xl font-bold font-sans text-foreground">72.4%</div>
                 </div>
               </div>
               
               {/* CSS Bar Chart Mockup */}
               <div className="h-48 flex items-end justify-between gap-2">
                 {[40, 30, 50, 45, 60, 75, 65, 80, 70, 85, 90, 80].map((height, i) => (
                   <div key={i} className="w-full relative group">
                     <div 
                       className="bg-primary/20 hover:bg-primary/40 border-t border-primary transition-all rounded-t-sm w-full" 
                       style={{ height: `${height}%` }}
                     ></div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight">Measure your edge.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              If you aren't beating the closing line consistently, you are going to lose money long-term. Variance happens. CLV doesn't lie.
            </p>
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">Track every bet against the Pinnacle closing line automatically.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">Calculate true Expected Value (EV) for every wager placed.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">Export your history to CSV for deeper analysis in Excel/Sheets.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-card border-t border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 relative z-10 text-center max-w-3xl"
      >
        <h2 className="text-4xl md:text-6xl font-bold font-sans mb-6">Stop playing with a handicap.</h2>
        <p className="text-xl text-muted-foreground mb-10">
          Join the sharpest bettors leveraging real-time Pinnacle data to print CLV.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-mono font-bold tracking-wide text-lg hover:bg-primary/90 transition-colors shadow-[0_0_30px_hsl(var(--primary)/0.3)]" data-testid="btn-footer-signup">
            Start 7-Day Free Trial
          </button>
          <div className="font-mono text-sm text-muted-foreground flex items-center justify-center gap-2 mt-4 sm:mt-0">
            $49/mo after. Cancel anytime.
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background py-12 border-t border-border/50 text-center md:text-left">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
        <div className="grid md:grid-cols-4 gap-8 mb-8 border-b border-border/50 pb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Activity className="w-6 h-6 text-primary" />
              <span className="font-sans font-bold text-xl tracking-tight text-foreground">SharpTracker</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto md:mx-0">
              Professional odds tracking and CLV analysis terminal.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Terminal</a></li>
              <li><a href="#" className="hover:text-primary">Analytics</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
              <li><a href="#" className="hover:text-primary">API Docs</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-bold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 font-mono text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} SharpTracker. All rights reserved. Not a gambling site.
        </div>
        </motion.div>
      </div>
    </footer>
  );
}

function AlertConfigSection() {
  return (
    <section className="py-24 bg-card border-y border-border/20 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-2/3 bg-destructive/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-destructive/10 text-destructive text-xs font-mono mb-2 border border-destructive/20">
              <Bell className="w-4 h-4" /> Custom Alerts
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight">Never miss a drop.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Configure precise thresholds across different sports, leagues, and markets. When Pinnacle drops the line past your target EV%, your phone lights up.
            </p>
            <div className="space-y-4 pt-4">
              {[
                "Target specific leagues (e.g., NFL, Premier League)",
                "Set custom EV% triggers per sport",
                "Filter by market type (Moneyline, Spread, Total)",
                "Distinct audio chimes for immediate recognition"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 relative">
            <div className="bg-background border border-border rounded-xl p-6 shadow-2xl relative z-10">
              <div className="text-sm font-mono text-muted-foreground mb-6 uppercase tracking-wider">Alert Configuration</div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-foreground">NBA Spread Drops</span>
                    <span className="text-primary">+3.5% EV</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>1.0%</span>
                    <span>5.0%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-foreground">NFL Totals Steam</span>
                    <span className="text-primary">+5.0% EV</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>2.0%</span>
                    <span>10.0%</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Notification</div>
                    <div className="text-sm text-foreground font-mono flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" /> Push + SMS
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded border border-border/50">
                    <div className="text-xs text-muted-foreground font-mono mb-1">Sound</div>
                    <div className="text-sm text-foreground font-mono flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-primary" /> Radar Ping
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Alert Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              className="absolute -right-4 -bottom-8 bg-card border border-destructive shadow-2xl rounded-lg p-4 w-64 z-20"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <div className="text-xs font-bold text-destructive font-mono mb-1">ALERT: NBA SPREAD</div>
                  <div className="text-sm text-foreground mb-1">LAL @ DEN line moved from -4.5 to -6.0</div>
                  <div className="text-xs text-muted-foreground font-mono">+4.2% EV Opportunity</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MultiSportSection() {
  const sports = [
    { name: "NFL Football", icon: "🏈", count: "32 Games/Wk", markets: "Moneyline, Spread, Total" },
    { name: "NBA Basketball", icon: "🏀", count: "15 Games/Day", markets: "Moneyline, Spread, Total" },
    { name: "MLB Baseball", icon: "⚾️", count: "15 Games/Day", markets: "Moneyline, Run Line, Total" },
    { name: "NHL Hockey", icon: "🏒", count: "12 Games/Day", markets: "Moneyline, Puck Line, Total" },
    { name: "Soccer", icon: "⚽️", count: "100+ Leagues", markets: "1x2, Asian Handicap, Total" },
    { name: "Tennis", icon: "🎾", count: "ATP / WTA", markets: "Match Winner, Set Spread" }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-6">Total Market Coverage.</h2>
          <p className="text-muted-foreground font-mono text-lg">
            Track line movement across every major sport simultaneously. Our backend processes over 50,000 odds updates per minute across all markets.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sports.map((sport, i) => (
            <motion.div 
              key={sport.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border p-6 rounded-xl hover:border-primary/30 transition-colors text-center group"
            >
              <div className="text-4xl mb-4 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">{sport.icon}</div>
              <h3 className="font-bold font-sans text-lg mb-1">{sport.name}</h3>
              <div className="text-xs font-mono text-muted-foreground">{sport.count}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BetTrackerSection() {
  return (
    <section className="py-24 bg-secondary/20 border-y border-border/20">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-sans mb-6">Integrated Bet Tracker.</h2>
        <p className="text-muted-foreground font-mono text-lg max-w-2xl mx-auto mb-16">
          Log your bets with one click from the feed. We automatically grade them at game end and map your performance over time.
        </p>

        <div className="bg-card border border-border rounded-xl overflow-hidden max-w-5xl mx-auto shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm whitespace-nowrap">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-normal">Date</th>
                  <th className="px-6 py-4 font-normal">Matchup</th>
                  <th className="px-6 py-4 font-normal">Selection</th>
                  <th className="px-6 py-4 font-normal">Odds</th>
                  <th className="px-6 py-4 font-normal text-right">CLV</th>
                  <th className="px-6 py-4 font-normal text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { date: "Oct 24", match: "LAL @ DEN", pick: "DEN -4.5", odds: "-110", clv: "+3.2%", result: "WIN", resultColor: "text-green-500" },
                  { date: "Oct 24", match: "BOS @ NYK", pick: "Under 212.5", odds: "-105", clv: "+1.5%", result: "LOSS", resultColor: "text-destructive" },
                  { date: "Oct 23", match: "DAL @ SF", pick: "DAL ML", odds: "+145", clv: "+4.8%", result: "WIN", resultColor: "text-green-500" },
                  { date: "Oct 23", match: "PHI @ MIA", pick: "MIA -2.0", odds: "-115", clv: "-0.5%", result: "WIN", resultColor: "text-green-500" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-foreground">{row.match}</td>
                    <td className="px-6 py-4 font-bold">{row.pick}</td>
                    <td className="px-6 py-4">{row.odds}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={row.clv.startsWith('+') ? 'text-primary' : 'text-destructive'}>{row.clv}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${row.resultColor}`}>{row.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function PinnacleSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="shrink-0 bg-[#FF6B00]/10 w-32 h-32 rounded-full flex items-center justify-center">
            <Database className="w-16 h-16 text-[#FF6B00]" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold font-sans mb-4 text-foreground">Powered by the Sharpest Book.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              We exclusively track Pinnacle odds. While other services blend data from slow, recreational books, SharpTracker isolates the signal from the noise by focusing solely on the market maker. When Pinnacle moves, the market follows. We show you the move before the followers can react.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppContent() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <TerminalSection />
        <MultiSportSection />
        <AlertConfigSection />
        <CLVSection />
        <BetTrackerSection />
        <PinnacleSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppContent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
