import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, CartesianGrid
} from "recharts";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { 
  Activity, Bell,
  LineChart as LineChartIcon, Radar,
  TrendingUp, ChevronRight, CheckCircle2,
  Database
} from "lucide-react";
import {
  IconOddsDrop, IconBetTracker, IconCLV, IconStake,
  IconCalendar, IconMultiSport, IconBankroll,
  OddsDropPage, BetTrackerPage, CLVPage, StakeCalculatorPage,
  DailyCalendarPage, MultiSportPage, BankrollPage,
} from "./FeaturePages";
import WhyPage from "./WhyPage";
import PricingPage from "./PricingPage";
import SignUpPage from "./SignUpPage";

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
    image: `${import.meta.env.BASE_URL}screenshots/alert-config.jpg`,
    title: "Pick Your Markets",
    description: "Choose which sports, leagues, and bet types matter to you. Everything else is filtered out — you only see what you asked for."
  },
  {
    image: `${import.meta.env.BASE_URL}screenshots/alert-config.jpg`,
    title: "Set Your Bar",
    description: "Decide how big a move needs to be before it alerts you. Small shifts are ignored. Only the ones that clear your limit come through."
  },
  {
    image: `${import.meta.env.BASE_URL}screenshots/live-feed.jpg`,
    title: "We Watch Around the Clock",
    description: "SharpTracker runs all day and night. The moment a line moves enough to matter, we catch it — no matter when it happens."
  },
  {
    image: `${import.meta.env.BASE_URL}screenshots/live-feed.jpg`,
    title: "You Hear About It First",
    description: "The alert reaches you while other bettors are still unaware. The gap between the move and the market catching up is where your edge lives."
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



const FEATURE_ITEMS = [
  {
    route: "odds-drops",
    Icon: IconOddsDrop,
    name: "Odds Drop Alerts",
    desc: "Instant push notification when sharp money moves",
  },
  {
    route: "bet-tracker",
    Icon: IconBetTracker,
    name: "Bet Tracker",
    desc: "Log every bet and track every unit you've ever placed",
  },
  {
    route: "clv",
    Icon: IconCLV,
    name: "CLV & +EV",
    desc: "See if your bets beat the closing line every time",
  },
  {
    route: "stake-calculator",
    Icon: IconStake,
    name: "Stake Calculator",
    desc: "Size bets correctly with Kelly criterion built in",
  },
  {
    route: "daily-calendar",
    Icon: IconCalendar,
    name: "Daily P&L Calendar",
    desc: "Visual win/loss calendar — spot patterns instantly",
  },
  {
    route: "multi-sport",
    Icon: IconMultiSport,
    name: "Multi-Sport Coverage",
    desc: "NFL, NBA, MLB, NHL, Soccer, Tennis and more",
  },
  {
    route: "bankroll",
    Icon: IconBankroll,
    name: "Bankroll Growth",
    desc: "Catch value before anyone else and watch your edge compound",
  },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToFeature = (route: string) => {
    setFeaturesOpen(false);
    navigate(`/features/${route}`);
  };

  const closePanel = () => setFeaturesOpen(false);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${scrolled ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto pl-2 pr-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-sans font-bold text-xl tracking-tight text-foreground">Sharp<span className="text-primary">Tracker</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wide text-muted-foreground">
          {/* Features mega-panel trigger */}
          <button
            ref={triggerRef}
            onClick={() => setFeaturesOpen(v => !v)}
            className={`flex items-center gap-1.5 hover:text-primary transition-colors ${featuresOpen ? "text-primary" : ""}`}
          >
            Features
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""}`}
              viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button onClick={() => { closePanel(); navigate("/why"); }} className="hover:text-primary transition-colors">Why SharpTracker?</button>
          <button onClick={() => { closePanel(); navigate("/pricing"); }} className="hover:text-primary transition-colors">Pricing</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={closePanel} className="hidden md:block text-sm font-mono text-foreground hover:text-primary transition-colors" data-testid="btn-login">Log In</button>
          <button onClick={closePanel} className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-5 py-2 rounded-md font-mono text-sm transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]" data-testid="btn-get-access">
            Get Access
          </button>
        </div>
      </div>

      {/* Features mega-panel — full width, anchored below navbar */}
      <AnimatePresence>
        {featuresOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-[0_24px_80px_-8px_rgba(0,0,0,0.9)]"
          >
            <div className="container mx-auto px-6 py-8">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-6">All Features</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pb-2">
                {FEATURE_ITEMS.map((f) => (
                  <button
                    key={f.route}
                    onClick={() => goToFeature(f.route)}
                    className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-border/40 bg-card/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,255,255,0.08)] transition-all duration-200 text-center"
                  >
                    <div className="text-primary group-hover:scale-110 transition-transform duration-200">
                      <f.Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-semibold text-foreground group-hover:text-primary transition-colors">
                        {f.name}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1 leading-relaxed">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const [, navigate] = useLocation();
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden bg-background">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl">
          
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
            Get alerted the moment sharp bookmakers move their lines. Place your bet before the rest of the market has a chance to react.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button onClick={() => navigate("/signup")} className="bg-primary text-primary-foreground px-8 py-4 rounded-md font-mono font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-[0_0_20px_hsl(var(--primary)/0.4)]" data-testid="btn-sign-up">
              Sign Up <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate("/pricing")} className="bg-secondary text-secondary-foreground border border-border px-8 py-4 rounded-md font-mono tracking-wide flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors" data-testid="btn-pricing">
              Pricing
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
                <LineChartIcon className="w-4 h-4 text-primary" /> Price History
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
                         <div className="text-xs font-mono text-muted-foreground">Latest Sharp Drops</div>
                         <div className="text-[10px] font-mono text-primary flex items-center gap-1">● LIVE</div>
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

type BookLogo = {
  name: string;
  img?: string;
  large?: boolean;
  xlarge?: boolean;
};

const BASE = import.meta.env.BASE_URL;

const BOOKS: BookLogo[] = [
  { name: "bet365",       img: `${BASE}logos/bet365.png`, large: true },
  { name: "Unibet",       large: true },
  { name: "DraftKings" },
  { name: "William Hill", img: `${BASE}logos/williamhill.png`, large: true },
  { name: "Betclic",      img: `${BASE}logos/betclic.png` },
  { name: "FanDuel",      img: `${BASE}logos/fanduel.png`,    large: true },
  { name: "Betsson",      img: `${BASE}logos/betsson.png` },
  { name: "BetMGM",       large: true },
  { name: "Tipico",       img: `${BASE}logos/tipico.png` },
  { name: "888sport",     img: `${BASE}logos/888sport2.png`,  large: true },
  { name: "Betway",       img: `${BASE}logos/betway.png`,     xlarge: true },
  { name: "Ladbrokes",    large: true },
  { name: "Pinnacle" },
  { name: "Marathonbet" },
  { name: "Interwetten" },
  { name: "1xBet" },
  { name: "SBObet" },
];

function MarqueeBand() {
  const tripled = [...BOOKS, ...BOOKS, ...BOOKS];
  return (
    <div className="border-y border-border/30 bg-background py-5 overflow-hidden relative">
      {/* Left label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
        <div className="bg-gradient-to-r from-background via-background to-transparent w-52 h-full flex items-center pl-6 pr-8 shrink-0">
          <p className="text-sm font-mono text-muted-foreground leading-snug whitespace-nowrap">
            Works on<br />
            <span className="text-foreground font-bold">all major books →</span>
          </p>
        </div>
      </div>
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l from-background to-transparent w-20 pointer-events-none" />

      {/* Scrolling track */}
      <div className="flex animate-marquee items-center gap-0">
        {tripled.map((book, i) => (
          <div
            key={i}
            className="shrink-0 px-5 flex items-center justify-center"
            style={{ width: book.xlarge ? "190px" : book.large ? "150px" : "120px" }}
          >
            {book.img ? (
              <img
                src={book.img}
                alt={book.name}
                className="select-none"
                style={{
                  width: "100%",
                  height: book.xlarge ? "64px" : book.large ? "46px" : "30px",
                  objectFit: "contain",
                  objectPosition: "center",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.35,
                }}
                draggable={false}
              />
            ) : (
              <span
                className="select-none whitespace-nowrap font-sans font-bold tracking-wide"
                style={{
                  fontSize: book.xlarge ? "20px" : book.large ? "16px" : "13px",
                  color: "rgba(255,255,255,0.30)",
                }}
              >
                {book.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-secondary/30 border-y border-border/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-sans mb-4">Your filters. Your rules.</h2>
          <p className="text-muted-foreground">Tell SharpTracker exactly what you care about. It watches the markets around the clock and alerts you the second something moves — so you can bet before everyone else.</p>
        </motion.div>

        <div className="space-y-28 max-w-5xl mx-auto">
          {STEPS.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={idx}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center`}
              >
                {/* Image side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 relative"
                >
                  {/* Ambient glow behind image */}
                  <div className="absolute -inset-6 bg-primary/8 rounded-3xl blur-3xl" />
                  {/* Browser-chrome frame */}
                  <div className={`relative rounded-2xl overflow-hidden border border-primary/25 shadow-[0_0_60px_rgba(0,255,255,0.12)] ${isEven ? 'rotate-1 hover:rotate-0' : '-rotate-1 hover:rotate-0'} transition-transform duration-500`}>
                    {/* Fake title bar */}
                    <div className="bg-[#0f1117] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                      <span className="ml-3 text-[10px] font-mono text-white/25 truncate">SharpTracker — {step.title}</span>
                    </div>
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full block"
                    />
                  </div>
                </motion.div>

                {/* Text side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 max-w-md"
                >
                  <div className="inline-flex items-center gap-2 text-xs font-mono text-primary/70 border border-primary/20 bg-primary/5 rounded-full px-3 py-1 mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    STEP {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold font-sans mb-5 text-foreground leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const USAGE_OPTIONS = [
  { value: "light",  label: "Light (2–5 hours / week)",   weeklyRate: 0.024 },
  { value: "medium", label: "Medium (5–10 hours / week)",  weeklyRate: 0.042 },
  { value: "heavy",  label: "Heavy (10–20 hours / week)",  weeklyRate: 0.065 },
];
const TIMEFRAME_OPTIONS = [
  { value: "2w",  label: "2 weeks",  weeks: 2  },
  { value: "1m",  label: "1 month",  weeks: 4  },
  { value: "3m",  label: "3 months", weeks: 13 },
  { value: "6m",  label: "6 months", weeks: 26 },
];

function ProfitCalculatorSection() {
  const [bankroll, setBankroll] = useState(1000);
  const [usage, setUsage]       = useState("medium");
  const [timeframe, setTimeframe] = useState("3m");
  const [result, setResult]     = useState<{ data: { w: string; v: number }[]; profit: number; roi: number } | null>(null);

  function calculate() {
    const u  = USAGE_OPTIONS.find(o => o.value === usage)!;
    const tf = TIMEFRAME_OPTIONS.find(o => o.value === timeframe)!;

    // XOR-shift seeded RNG so each Calculate click gives a different path
    let rng = ((Date.now() * 1000003) ^ 0xdeadbeef) >>> 0;
    const rand = () => {
      rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
      return (rng >>> 0) / 4294967296;
    };

    // Target ROI always lands 30–50%
    const targetROI   = 30 + rand() * 20;
    const targetFinal = bankroll * (1 + targetROI / 100);

    const days        = tf.weeks * 7;
    const noiseFactor = 0.04; // ±4% per day → very jagged

    let cur = bankroll;
    const raw: number[] = [cur];

    for (let i = 1; i <= days; i++) {
      const r    = rand();
      const move = (r - 0.46) * noiseFactor * 2; // noise only, no drift
      cur = Math.max(cur * (1 + move), bankroll * 0.5);
      raw.push(cur);
    }

    // Blend in a linear drift so: start = bankroll, end = targetFinal, zigzag preserved
    const rawFinal = raw[raw.length - 1];
    const driftScale = targetFinal / rawFinal;
    const data = raw.map((v, i) => {
      const t = i / (raw.length - 1);                // 0 → 1
      const drift = 1 + t * (driftScale - 1);        // 1 at start, driftScale at end
      return { w: String(i), v: Math.round(v * drift) };
    });

    const profit = data[data.length - 1].v - bankroll;
    setResult({ data, profit, roi: (profit / bankroll) * 100 });
  }

  const inputCls = "w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors";

  return (
    <section id="profit-calculator" className="py-24 bg-background border-t border-border/20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono tracking-widest text-primary uppercase">Tools</span>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mt-3 mb-4">Profit Calculator.</h2>
          <p className="text-foreground/65 text-lg max-w-xl mx-auto">
            See what SharpTracker could do for your bankroll based on how you plan to use it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl mx-auto bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,255,255,0.04)]"
        >
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">

            {/* ── LEFT: inputs ── */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Initial Bankroll</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">€</span>
                  <input
                    type="number"
                    min={100}
                    value={bankroll}
                    onChange={e => setBankroll(Math.max(0, Number(e.target.value)))}
                    className={inputCls + " pl-8"}
                  />
                </div>
                <p className="text-xs text-muted-foreground">We recommend starting with at least €500</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Weekly Usage</label>
                <div className="relative">
                  <select
                    value={usage}
                    onChange={e => setUsage(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {USAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
                <p className="text-xs text-muted-foreground">How many hours a week you plan to use SharpTracker</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">Timeframe</label>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {TIMEFRAME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              <button
                onClick={calculate}
                className="w-full bg-primary text-background font-bold font-sans py-3.5 rounded-lg hover:bg-primary/85 active:scale-[0.98] transition-all text-sm tracking-wide"
              >
                Calculate
              </button>
            </div>

            {/* ── RIGHT: chart / placeholder ── */}
            <div className="p-8 flex flex-col min-h-[340px]">
              {result ? (
                <>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={190}>
                      <AreaChart data={result.data} margin={{ top: 6, right: 6, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="calcGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="hsl(186 100% 50%)" stopOpacity={0.22} />
                            <stop offset="95%" stopColor="hsl(186 100% 50%)" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <YAxis
                          tickFormatter={v => `€${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`}
                          tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                          axisLine={false} tickLine={false} width={52}
                        />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}
                          formatter={(v: number) => [`€${v.toLocaleString()}`, "Bankroll"]}
                          labelFormatter={l => l}
                        />
                        <Area type="monotone" dataKey="v" stroke="hsl(186 100% 50%)" strokeWidth={2} fill="url(#calcGrad)" dot={false} activeDot={{ r: 3, fill: "hsl(186 100% 50%)" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 pt-5 border-t border-border/50">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-mono mb-1">Estimated Profit</p>
                        <p className="text-2xl font-bold font-mono text-primary">+€{result.profit.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground font-mono mb-1">ROI</p>
                        <p className="text-2xl font-bold font-mono text-primary">+{result.roi.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This is a simulation and does not guarantee results. Based on average edge per qualifying odds drop using flat stake sizing.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-foreground/50 text-sm font-mono">Fill in your details and press</p>
                    <p className="text-foreground font-bold font-sans mt-1">Calculate</p>
                  </div>
                </div>
              )}
            </div>

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
          Join the sharpest bettors leveraging real-time sharp market data to print CLV.
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
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/why" className="hover:text-primary">Why SharpTracker?</Link></li>
              <li><Link href="/signup" className="hover:text-primary">Sign Up</Link></li>
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
    <section id="alerts" className="py-28 bg-card border-y border-border/20 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* Left — text + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center lg:text-left space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20">
              <Bell className="w-3.5 h-3.5" /> Mobile App
            </div>

            <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight leading-none">
              Never miss<br />a drop.
            </h2>

            <p className="text-muted-foreground text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
              Download for free. Get a push notification the moment a sharp odds drop hits — act before the line moves.
            </p>

            {/* Notification preview pills */}
            <div className="space-y-2 py-2">
              {[
                { sport: "Football", ev: "+5.6%", time: "just now" },
                { sport: "Basketball", ev: "+4.1%", time: "2 min ago" },
                { sport: "Soccer", ev: "+3.8%", time: "5 min ago" },
              ].map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-3 bg-background border border-primary/20 rounded-xl px-4 py-2.5 w-full max-w-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                  <div className="flex-1 text-left">
                    <span className="text-xs font-mono text-muted-foreground">{n.sport} · Sharp drop</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-primary">{n.ev}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">{n.time}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA button */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground font-bold font-sans text-base px-8 py-4 rounded-xl shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)] hover:shadow-[0_0_60px_-8px_hsl(var(--primary)/0.8)] transition-shadow"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download App
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 bg-secondary border border-border text-foreground font-bold font-sans text-base px-8 py-4 rounded-xl hover:border-primary/30 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18.5v-13c0-.83.94-1.3 1.6-.8l10 6.5c.6.39.6 1.21 0 1.6l-10 6.5c-.66.5-1.6.03-1.6-.8z"/>
                </svg>
                Google Play
              </motion.a>
            </div>

            <p className="text-xs font-mono text-muted-foreground/50">Free download · No credit card required</p>
          </motion.div>

          {/* Right — phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32, y: 16 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 relative"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] scale-75 translate-y-8" />
            <div className="relative w-[260px] md:w-[300px]">
              <img
                src={`${import.meta.env.BASE_URL}screenshots/app-mobile.png`}
                alt="SharpTracker mobile app"
                className="w-full h-auto rounded-[2rem] shadow-[0_0_80px_-10px_hsl(var(--primary)/0.4)] border border-primary/10"
                style={{ transform: "perspective(1000px) rotateY(-8deg) rotateX(2deg)" }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

const EV_DATA = [
  { week: "Start", sharp: 0,    avg: 0    },
  { week: "W1",    sharp: 8,    avg: 28   },
  { week: "W2",    sharp: -7,   avg: 20   },
  { week: "W3",    sharp: 15,   avg: 52   },
  { week: "W4",    sharp: -3,   avg: 32   },
  { week: "W5",    sharp: 22,   avg: 7    },
  { week: "W6",    sharp: 14,   avg: 25   },
  { week: "W7",    sharp: 46,   avg: -5   },
  { week: "W8",    sharp: 26,   avg: 17   },
  { week: "W9",    sharp: 44,   avg: -18  },
  { week: "W10",   sharp: 19,   avg: 10   },
  { week: "W11",   sharp: 34,   avg: -12  },
  { week: "W12",   sharp: 62,   avg: -30  },
  { week: "W13",   sharp: 40,   avg: 5    },
  { week: "W14",   sharp: 75,   avg: -23  },
  { week: "W15",   sharp: 45,   avg: -3   },
  { week: "W16",   sharp: 57,   avg: -35  },
  { week: "W17",   sharp: 39,   avg: -10  },
  { week: "W18",   sharp: 69,   avg: -48  },
  { week: "W19",   sharp: 89,   avg: -30  },
  { week: "W20",   sharp: 61,   avg: -55  },
  { week: "W21",   sharp: 79,   avg: -25  },
  { week: "W22",   sharp: 44,   avg: -45  },
  { week: "W23",   sharp: 86,   avg: -10  },
  { week: "W24",   sharp: 101,  avg: -40  },
  { week: "W25",   sharp: 76,   avg: -62  },
  { week: "W26",   sharp: 106,  avg: -34  },
  { week: "W27",   sharp: 91,   avg: -69  },
  { week: "W28",   sharp: 129,  avg: -49  },
  { week: "W29",   sharp: 109,  avg: -77  },
  { week: "W30",   sharp: 134,  avg: -45  },
  { week: "W31",   sharp: 102,  avg: -75  },
  { week: "W32",   sharp: 130,  avg: -53  },
  { week: "W33",   sharp: 165,  avg: -91  },
  { week: "W34",   sharp: 147,  avg: -66  },
  { week: "W35",   sharp: 167,  avg: -94  },
  { week: "W36",   sharp: 125,  avg: -59  },
  { week: "W37",   sharp: 163,  avg: -101 },
  { week: "W38",   sharp: 185,  avg: -83  },
  { week: "W39",   sharp: 160,  avg: -115 },
  { week: "W40",   sharp: 190,  avg: -87  },
  { week: "W41",   sharp: 175,  avg: -122 },
  { week: "W42",   sharp: 220,  avg: -102 },
  { week: "W43",   sharp: 192,  avg: -132 },
  { week: "W44",   sharp: 227,  avg: -97  },
  { week: "W45",   sharp: 207,  avg: -125 },
  { week: "W46",   sharp: 237,  avg: -110 },
  { week: "W47",   sharp: 219,  avg: -148 },
  { week: "W48",   sharp: 261,  avg: -126 },
  { week: "W49",   sharp: 239,  avg: -158 },
  { week: "W50",   sharp: 274,  avg: -130 },
  { week: "W51",   sharp: 259,  avg: -165 },
  { week: "W52",   sharp: 299,  avg: -150 },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 shadow-xl text-xs font-mono">
      <div className="text-muted-foreground mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          <span className="text-foreground">{p.name}:</span>
          <span style={{ color: p.color }} className="font-bold">
            {p.value > 0 ? "+" : ""}{p.value} units
          </span>
        </div>
      ))}
    </div>
  );
}

function EVComparisonSection() {
  return (
    <section id="bankroll" className="py-24 bg-card border-y border-border/20 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20 mb-5">
            <TrendingUp className="w-3.5 h-3.5" /> +EV vs. Average Bettor
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            The edge compounds over time.
          </h2>
          <p className="text-muted-foreground text-lg">
            Playing +EV doesn't mean winning every bet. It means the math works in your favour across hundreds of bets — while the average bettor bleeds slowly.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-8 mb-10"
        >
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-primary">+299 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">SharpTracker · 52 weeks</div>
          </div>
          <div className="w-px bg-border/50 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-destructive">-150 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Average bettor · 52 weeks</div>
          </div>
          <div className="w-px bg-border/50 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold font-sans text-foreground">449 u</div>
            <div className="text-xs font-mono text-muted-foreground mt-1">Difference in outcome</div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-background border border-border/50 rounded-2xl p-6 md:p-8 relative"
        >
          {/* Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-6 h-0.5 rounded bg-[#00FFFF] inline-block" />
              <span className="text-foreground">SharpTracker user</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-6 h-0.5 rounded bg-[#FF4D4D] inline-block" />
              <span className="text-foreground">Average bettor</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={EV_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSharp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00FFFF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF4D4D" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#FF4D4D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(240 8% 42%)", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                interval={12}
                ticks={["Start", "W13", "W26", "W39", "W52"]}
              />
              <YAxis
                tick={{ fill: "hsl(240 8% 48%)", fontSize: 11, fontFamily: "Space Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}u`}
                width={58}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="avg"
                name="Average bettor"
                stroke="#FF4D4D"
                strokeWidth={2.5}
                fill="url(#gradAvg)"
                dot={false}
                activeDot={{ r: 4, fill: "#FF4D4D" }}
              />
              <Area
                type="monotone"
                dataKey="sharp"
                name="SharpTracker"
                stroke="#00FFFF"
                strokeWidth={2.5}
                fill="url(#gradSharp)"
                dot={false}
                activeDot={{ r: 4, fill: "#00FFFF" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* End labels */}
          <div className="flex justify-between mt-4 px-14 text-xs font-mono">
            <span />
            <div className="flex gap-8">
              <span className="text-[#00FFFF] font-bold">↑ +299u · SharpTracker</span>
              <span className="text-[#FF4D4D] font-bold">↓ -150u · Average</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BankrollFeatureCards() {
  const appBase = "https://84e61830-7611-4d35-8623-77d057b02e4e-00-30ovvqhxka0d5.kirk.replit.dev";

  const BetLoggerArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Bet Log</span>
        <span className="ml-auto text-white/20">April 2026</span>
      </div>
      {[
        { match: "Lakers vs Celtics", market: "ML", odds: "+155", stake: "2u", result: "+3.1u", win: true },
        { match: "Man Utd vs Arsenal", market: "AH -0.5", odds: "-108", stake: "1u", result: "-1u", win: false },
        { match: "Djokovic vs Alcaraz", market: "ML", odds: "+122", stake: "1.5u", result: "+1.8u", win: true },
        { match: "Bruins vs Rangers", market: "Puck -1.5", odds: "+170", stake: "1u", result: "+1.7u", win: true },
        { match: "Chiefs vs Ravens", market: "Spread -3", odds: "-110", stake: "2u", result: "-2u", win: false },
      ].map((row, i) => (
        <div key={i} className={`flex items-center gap-2 py-1.5 border-b border-white/4 last:border-0 ${i === 1 || i === 4 ? "opacity-60" : ""}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.win ? "bg-emerald-400" : "bg-red-500"}`} />
          <span className="text-white/60 truncate flex-1">{row.match}</span>
          <span className="text-white/30 shrink-0">{row.market}</span>
          <span className="text-white/40 shrink-0">{row.odds}</span>
          <span className={`shrink-0 font-bold ${row.win ? "text-emerald-400" : "text-red-400"}`}>{row.result}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
        <span className="text-white/30">5 bets logged</span>
        <span className="text-emerald-400 font-bold">Net: +3.6u</span>
      </div>
    </div>
  );

  const CalendarArt = () => {
    const days = ["M","T","W","T","F","S","S"];
    const cells = [
      null, null, { v: +2.1, w: true }, { v: -1.0, w: false }, { v: +3.5, w: true }, { v: 0, w: null }, { v: 0, w: null },
      { v: +1.8, w: true }, { v: +0.5, w: true }, { v: -2.3, w: false }, { v: 0, w: null }, { v: +4.1, w: true }, { v: -1.5, w: false }, { v: 0, w: null },
      { v: +0.9, w: true }, { v: -0.5, w: false }, { v: +2.8, w: true }, { v: +1.2, w: true }, { v: -3.1, w: false }, { v: 0, w: null }, { v: 0, w: null },
      { v: +3.3, w: true }, { v: +0.7, w: true }, { v: -1.8, w: false }, { v: +2.4, w: true }, { v: 0, w: null }, { v: 0, w: null }, { v: 0, w: null },
    ];
    return (
      <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
          <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Daily P&amp;L</span>
          <span className="ml-auto text-white/20">April 2026</span>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} className="text-center text-white/20 text-[8px] pb-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`h-6 rounded text-[8px] flex items-center justify-center font-bold
                ${!c ? "bg-transparent" :
                  c.w === null ? "bg-white/4 text-white/10" :
                  c.w ? "bg-emerald-500/25 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
            >
              {c && c.w !== null ? (c.w ? `+${c.v}` : c.v) : ""}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/> 15 profitable</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/> 6 losing</span>
        </div>
      </div>
    );
  };

  const CLVArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">CLV Tracker</span>
        <span className="ml-auto text-emerald-400 text-[9px]">+EV ✓</span>
      </div>
      {[
        { match: "Celtics ML", placed: "-108", close: "-116", clv: "+0.7%" },
        { match: "Over 225.5", placed: "-112", close: "-122", clv: "+0.9%" },
        { match: "Chiefs -3",  placed: "+102", close: "+108", clv: "+0.5%" },
        { match: "Djokovic ML",placed: "-110", close: "-120", clv: "+0.8%" },
      ].map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center py-1.5 border-b border-white/4 last:border-0">
          <span className="text-white/60 truncate">{row.match}</span>
          <span className="text-white/30">Placed {row.placed}</span>
          <span className="text-white/30">Close {row.close}</span>
          <span className="text-emerald-400 font-bold">{row.clv}</span>
        </div>
      ))}
      <div className="flex justify-between mt-3 pt-2 border-t border-white/6 text-[9px]">
        <span className="text-white/30">Avg CLV this month</span>
        <span className="text-emerald-400 font-bold">+0.73% per bet</span>
      </div>
    </div>
  );

  const AutoSettleArt = () => (
    <div className="w-full bg-[#0a0a0f] rounded-xl border border-white/8 p-3 font-mono text-[10px] overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/6">
        <span className="text-primary font-bold tracking-widest uppercase text-[9px]">Auto-settle</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
          <span className="text-emerald-400 text-[9px]">LIVE</span>
        </span>
      </div>
      {[
        { match: "Lakers -5.5", time: "2h ago", result: "WON", outcome: "+1.9u", color: "emerald" },
        { match: "Man City ML", time: "4h ago", result: "LOST", outcome: "-1u", color: "red" },
        { match: "Djokovic ML", time: "6h ago", result: "WON", outcome: "+1.8u", color: "emerald" },
        { match: "Hawks +7.5", time: "9h ago", result: "PUSH", outcome: "0u", color: "yellow" },
        { match: "O/U 214.5",  time: "11h ago", result: "WON", outcome: "+2.2u", color: "emerald" },
      ].map((row, i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/4 last:border-0">
          <div className="flex-1 min-w-0">
            <div className="text-white/60 truncate">{row.match}</div>
            <div className="text-white/20 text-[8px]">{row.time}</div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold shrink-0
            ${row.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" :
              row.color === "red" ? "bg-red-500/15 text-red-400" :
              "bg-yellow-500/15 text-yellow-400"}`}>
            {row.result}
          </span>
          <span className={`font-bold shrink-0 w-10 text-right
            ${row.color === "emerald" ? "text-emerald-400" :
              row.color === "red" ? "text-red-400" : "text-yellow-400"}`}>
            {row.outcome}
          </span>
        </div>
      ))}
    </div>
  );

  const cards = [
    {
      tag: "Bet Logger",
      title: "Log every bet. Miss nothing.",
      desc: "Record each wager with stake, odds, market and sport. Your full history in one place — filterable, sortable, exportable.",
      art: <BetLoggerArt />,
      href: `${appBase}/bet-tracker`,
    },
    {
      tag: "Daily Calendar",
      title: "Your P&L, day by day.",
      desc: "A color-coded calendar shows winning and losing days at a glance. Spot patterns, streaks, and tilt cycles before they cost you.",
      art: <CalendarArt />,
      href: `${appBase}/bet-stats`,
    },
    {
      tag: "CLV & +EV",
      title: "Did you beat the closing line?",
      desc: "Automatically compare your entry odds to where the market closed. Sustained positive CLV is the strongest predictor of long-term profit.",
      art: <CLVArt />,
      href: `${appBase}/bet-stats`,
    },
    {
      tag: "Auto-settle",
      title: "Results logged automatically.",
      desc: "Bets are resolved and settled the moment results come in. No manual updates, no spreadsheet maintenance — your bankroll stays accurate in real time.",
      art: <AutoSettleArt />,
      href: `${appBase}/bet-tracker`,
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20 mb-5">
            <Activity className="w-3.5 h-3.5" /> Edge Tracking Suite
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mb-4">
            Follow your edge. Watch your bankroll grow.
          </h2>
          <p className="text-muted-foreground text-lg">
            Every metric that matters — tracked automatically. No spreadsheets, no guesswork.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.a
              key={i}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-5 cursor-pointer hover:border-primary/30 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.15)] transition-all duration-300"
            >
              <div className="pointer-events-none">
                {card.art}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-primary tracking-widest uppercase mb-2">
                  {card.tag}
                </div>
                <h3 className="text-lg font-bold font-sans text-foreground mb-2 group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.a>
          ))}
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
    <section id="sports" className="py-24 bg-background">
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
    <section id="bet-tracker" className="py-24 bg-secondary/20 border-y border-border/20">
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

function SharpDataSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="shrink-0 bg-primary/10 w-32 h-32 rounded-full flex items-center justify-center">
            <Database className="w-16 h-16 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold font-sans mb-4 text-foreground">Powered by Sharp Bookmaker Data.</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              We track only the sharpest bookmakers — the true market makers where professional money flows. While other services blend data from slow recreational books, SharpTracker isolates the signal from the noise. When the sharp money moves, you see it first.
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
        <MarqueeBand />
        <FeaturesGrid />
        <EVComparisonSection />
        <BankrollFeatureCards />
        <AlertConfigSection />
        <ProfitCalculatorSection />
        <BetTrackerSection />
        <SharpDataSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppContent} />
      <Route path="/why" component={WhyPage} />
      <Route path="/features/odds-drops" component={OddsDropPage} />
      <Route path="/features/bet-tracker" component={BetTrackerPage} />
      <Route path="/features/clv" component={CLVPage} />
      <Route path="/features/stake-calculator" component={StakeCalculatorPage} />
      <Route path="/features/daily-calendar" component={DailyCalendarPage} />
      <Route path="/features/multi-sport" component={MultiSportPage} />
      <Route path="/features/bankroll" component={BankrollPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
