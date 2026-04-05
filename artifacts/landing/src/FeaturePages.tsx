import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────
// Shared SVG Icon Components
// ─────────────────────────────────────────────

export function IconOddsDrop({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,10 14,24 22,16 34,32 44,20" />
      <polyline points="34,32 44,32 44,20" fill="currentColor" stroke="none" opacity="0.15" />
      <line x1="34" y1="32" x2="44" y2="32" />
      <circle cx="36" cy="40" r="4" strokeWidth="2" />
      <line x1="36" y1="36" x2="36" y2="33" />
      <path d="M32 40 C32 37.8 33.8 36 36 36" />
    </svg>
  );
}

export function IconBetTracker({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="32" height="36" rx="3" />
      <line x1="8" y1="16" x2="40" y2="16" />
      <line x1="8" y1="24" x2="40" y2="24" />
      <line x1="8" y1="32" x2="40" y2="32" />
      <line x1="20" y1="16" x2="20" y2="42" />
      <polyline points="13,20 16,23 24,19" />
      <polyline points="13,28 16,31 24,27" />
      <line x1="25" y1="36" x2="36" y2="36" strokeWidth="1.5" opacity="0.5" />
      <line x1="25" y1="20" x2="36" y2="20" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function IconCLV({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="28" width="8" height="14" rx="1.5" />
      <rect x="20" y="18" width="8" height="24" rx="1.5" />
      <rect x="34" y="8" width="8" height="34" rx="1.5" />
      <polyline points="8,22 24,14 38,6" />
      <circle cx="38" cy="6" r="3" fill="currentColor" stroke="none" opacity="0.4" />
      <text x="42" y="10" fontSize="10" fill="currentColor" fontFamily="monospace" stroke="none" opacity="0.9">+</text>
    </svg>
  );
}

export function IconStake({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <path d="M24 6 A18 18 0 0 1 42 24" strokeWidth="3" opacity="0.3" />
      <path d="M24 6 A18 18 0 0 1 36 36" strokeWidth="3" />
      <line x1="24" y1="24" x2="24" y2="10" strokeWidth="2.5" />
      <line x1="24" y1="24" x2="34" y2="30" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none" />
      <text x="19" y="38" fontSize="7" fill="currentColor" fontFamily="monospace" stroke="none" opacity="0.7">KELLY</text>
    </svg>
  );
}

export function IconCalendar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="36" height="32" rx="3" />
      <line x1="6" y1="20" x2="42" y2="20" />
      <line x1="16" y1="6" x2="16" y2="14" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <rect x="11" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.5" />
      <rect x="21" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
      <rect x="31" y="25" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.7" />
      <rect x="11" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="21" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.6" />
      <rect x="31" y="33" width="6" height="5" rx="1" fill="currentColor" stroke="none" opacity="0.2" />
    </svg>
  );
}

export function IconMultiSport({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <path d="M6 24 Q16 18 24 24 Q32 30 42 24" />
      <path d="M6 24 Q16 30 24 24 Q32 18 42 24" opacity="0.4" />
      <line x1="24" y1="6" x2="24" y2="42" />
      <path d="M12 10 Q18 16 12 22" opacity="0.5" />
      <path d="M36 10 Q30 16 36 22" opacity="0.5" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

export function IconBankroll({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,38 14,26 22,30 32,16 44,8" />
      <circle cx="44" cy="8" r="3" fill="currentColor" stroke="none" opacity="0.4" />
      <line x1="4" y1="42" x2="44" y2="42" />
      <line x1="4" y1="38" x2="4" y2="42" />
      <path d="M28 22 L32 16 L36 22" />
    </svg>
  );
}

// Map of feature slug to icon component
export const FEATURE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  "odds-drops": IconOddsDrop,
  "bet-tracker": IconBetTracker,
  "clv": IconCLV,
  "stake-calculator": IconStake,
  "daily-calendar": IconCalendar,
  "multi-sport": IconMultiSport,
  "bankroll": IconBankroll,
};

// ─────────────────────────────────────────────
// Shared page layout components
// ─────────────────────────────────────────────

function FeatureNav({ title }: { title: string }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-sans font-bold text-lg tracking-tight">Sharp<span className="text-primary">Tracker</span></span>
        </Link>
        <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-md font-mono text-sm transition-all">
          Get Access
        </button>
      </div>
    </nav>
  );
}

function FeatureHero({
  icon: Icon,
  label,
  title,
  subtitle,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="pt-32 pb-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[100px]" />
      <div className="container mx-auto px-6 relative text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{label}</span>
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Icon className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight mb-6 text-foreground">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground font-mono leading-relaxed">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ContentBlock({
  tag,
  heading,
  body,
  imageUrl,
  imageAlt,
  imageRight = false,
  dark = false,
}: {
  tag: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imageRight?: boolean;
  dark?: boolean;
}) {
  return (
    <section className={`py-20 ${dark ? "bg-card/60 border-y border-border/20" : "bg-background"}`}>
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${imageRight ? "md:flex-row" : "md:flex-row-reverse"} gap-12 md:gap-20 items-center`}>
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: imageRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest mb-3 block">{tag}</span>
            <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight mb-5 text-foreground">{heading}</h2>
            <p className="text-muted-foreground font-mono leading-relaxed">{body}</p>
          </motion.div>
          <motion.div
            className="flex-1 w-full"
            initial={{ opacity: 0, x: imageRight ? 24 : -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl overflow-hidden border border-border/40 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.8)]">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-64 md:h-80 object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="py-14 border-y border-border/20 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-bold font-sans text-primary mb-1">{s.value}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCTA({ next, nextLabel }: { next: string; nextLabel: string }) {
  return (
    <section className="py-24 bg-card border-t border-border/20">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <h2 className="text-3xl font-bold font-sans mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground font-mono mb-8">Join sharp bettors who track every edge with SharpTracker.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-sans font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            Get Free Access
          </button>
          <Link
            href={`/features/${next}`}
            className="border border-border/50 text-foreground px-8 py-3 rounded-md font-mono text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 justify-center"
          >
            {nextLabel} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Feature Pages
// ─────────────────────────────────────────────

export function OddsDropPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Odds Drop Alerts" />
      <FeatureHero
        icon={IconOddsDrop}
        label="Feature — Odds Drop Alerts"
        title="Sharp Money Moves First."
        subtitle="The moment a sportsbook moves a line, it's because someone with information placed a bet. SharpTracker catches it before anyone else does."
      />
      <StatRow stats={[
        { value: "< 1s", label: "Detection Speed" },
        { value: "50 000+", label: "Line Updates / Min" },
        { value: "6", label: "Sports Covered" },
        { value: "24/7", label: "Live Monitoring" },
      ]} />
      <ContentBlock
        tag="The Strategy"
        heading="What is a Sharp Bettor?"
        body="Sharp bettors — professionals who bet for a living — have studied markets for years. When they place money on a line, sportsbooks react immediately by moving the odds to limit their exposure. These line movements, called 'odds drops', reveal where the smart money has landed. Following sharp action is one of the most proven edges in sports betting."
        imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
        imageAlt="Trading screens showing odds movement"
        imageRight
      />
      <ContentBlock
        tag="How It Works"
        heading="Line Movement is a Signal."
        body="When Pinnacle — the world's sharpest sportsbook — moves a line more than your configured threshold within a short time window, it almost always indicates sharp action. SharpTracker monitors Pinnacle's live feed every second, compares each new line to its previous state, and fires an alert the instant a qualifying drop is detected. You get the information in under a second."
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
        imageAlt="Live odds data dashboard"
        dark
      />
      <ContentBlock
        tag="Your Edge"
        heading="Speed is Everything."
        body="When a line moves on Pinnacle, recreational books take between 30 seconds and several minutes to catch up. That window — between the sharp move and the wider market adjusting — is where your edge lives. SharpTracker delivers the alert in time for you to bet the old number at a square book before it closes. That difference is often the entire edge."
        imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80"
        imageAlt="Chart showing timing advantage"
        imageRight
      />
      <FeatureCTA next="bet-tracker" nextLabel="Bet Tracker" />
    </div>
  );
}

export function BetTrackerPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Bet Tracker" />
      <FeatureHero
        icon={IconBetTracker}
        label="Feature — Bet Tracker"
        title="Every Bet Logged. Every Unit Tracked."
        subtitle="Log your bets with one click straight from the live feed. SharpTracker automatically grades every result when the game ends and maps your performance over time."
      />
      <StatRow stats={[
        { value: "1 click", label: "To Log a Bet" },
        { value: "Auto", label: "Bet Grading" },
        { value: "ROI", label: "Tracked Per Sport" },
        { value: "CLV", label: "Tracked Per Bet" },
      ]} />
      <ContentBlock
        tag="The Problem"
        heading="Most Bettors Don't Track."
        body="Without records, you're guessing. You might think you're up 30 units, but in reality you're down 12. Memory is biased toward wins. The only way to know if you have a real edge is to track every single bet — its odds, your stake, the outcome, and how the line closed. SharpTracker does all of this for you automatically."
        imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
        imageAlt="Financial records and analytics"
        imageRight
      />
      <ContentBlock
        tag="One-Click Logging"
        heading="Log Directly From the Feed."
        body="When you see an odds drop alert in the live feed that you want to act on, hit the log button. SharpTracker pre-fills the match, the market, and the current odds. You enter your stake and that's it. No copy-pasting, no spreadsheets. The bet is saved instantly, and we begin tracking the closing line immediately."
        imageUrl="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80"
        imageAlt="Mobile app interface"
        dark
      />
      <ContentBlock
        tag="Auto-Grading"
        heading="We Handle the Results."
        body="After each game ends, SharpTracker automatically grades every pending bet — win, loss, or push. No manual entry, no spreadsheet formulas. Your running P&L updates in real time. You also get a CLV score per bet (see CLV & +EV feature), showing whether your entry price was sharp or recreational."
        imageUrl="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&q=80"
        imageAlt="Performance analytics dashboard"
        imageRight
      />
      <FeatureCTA next="clv" nextLabel="CLV & +EV" />
    </div>
  );
}

export function CLVPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="CLV & +EV" />
      <FeatureHero
        icon={IconCLV}
        label="Feature — CLV & +EV"
        title="Beat the Line. Prove Your Edge."
        subtitle="Closing Line Value is the gold standard metric for separating lucky bettors from skilled ones. If you consistently beat the closing line, you will profit long-term — guaranteed."
      />
      <StatRow stats={[
        { value: "CLV", label: "Per Bet Tracked" },
        { value: "+EV", label: "Expected Value Score" },
        { value: "Long Run", label: "Profitability Signal" },
        { value: "Real-Time", label: "Closing Line Data" },
      ]} />
      <ContentBlock
        tag="The Concept"
        heading="What is Closing Line Value?"
        body="The closing line is the final odds a sportsbook offers before a game starts. Markets are most efficient at closing time — all public information is priced in. If you consistently get better odds than the closing line, it means you were right more often than the market expected. This is called positive CLV, and it's the best predictor of long-term profit in sports betting."
        imageUrl="https://images.unsplash.com/photo-1642790551116-18e4f60b0861?w=1200&q=80"
        imageAlt="Data analytics and charts"
        imageRight
      />
      <ContentBlock
        tag="Why It Matters"
        heading="Records Don't Lie."
        body="A bettor who got lucky with a +20% ROI over 200 bets might actually have negative CLV — meaning they got fortunate outcomes but were betting into bad lines. A bettor with +2% CLV over the same sample is demonstrably skilled and will profit over the long run regardless of short-term variance. CLV separates process from outcome."
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
        imageAlt="Charts showing CLV analysis"
        dark
      />
      <ContentBlock
        tag="+EV Betting"
        heading="Expected Value Simplified."
        body="A bet has positive expected value (+EV) when the price you get is better than the true probability of the outcome. For example, if a team's true win probability is 55% but the odds imply only 50%, that bet is +EV. SharpTracker calculates the no-vig fair odds for every alert, so you can instantly see if a move creates a +EV opportunity at your current book."
        imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
        imageAlt="Expected value calculation"
        imageRight
      />
      <FeatureCTA next="stake-calculator" nextLabel="Stake Calculator" />
    </div>
  );
}

export function StakeCalculatorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Stake Calculator" />
      <FeatureHero
        icon={IconStake}
        label="Feature — Stake Calculator"
        title="Bet the Right Size Every Time."
        subtitle="Staking is where most bettors leak money. Bet too much on a bad line and one bad run wipes you out. The Kelly Criterion tells you exactly how much of your bankroll to risk on each bet."
      />
      <StatRow stats={[
        { value: "Kelly", label: "Criterion Built In" },
        { value: "Full", label: "& Fractional Kelly" },
        { value: "0%", label: "Risk of Ruin (optimal)" },
        { value: "EV-Based", label: "Stake Sizing" },
      ]} />
      <ContentBlock
        tag="The Maths"
        heading="What is the Kelly Criterion?"
        body="The Kelly Criterion is a mathematical formula that calculates the optimal fraction of your bankroll to bet, given your edge and the odds. It maximises long-run bankroll growth while avoiding ruin. The formula is: f* = (bp − q) / b, where b = decimal odds minus one, p = your estimated win probability, and q = 1 − p. SharpTracker computes this automatically for every alert."
        imageUrl="https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&q=80"
        imageAlt="Mathematical formulas and calculator"
        imageRight
      />
      <ContentBlock
        tag="Risk Management"
        heading="Full Kelly vs Fractional Kelly."
        body="Full Kelly bets the mathematically optimal amount, but it comes with high variance — you can lose 30–40% of your bankroll in bad runs even while betting with an edge. Most professional bettors use half-Kelly or quarter-Kelly to smooth volatility. SharpTracker lets you choose your Kelly fraction and shows your recommended stake size alongside each alert in real time."
        imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80"
        imageAlt="Risk management and portfolio"
        dark
      />
      <ContentBlock
        tag="Discipline"
        heading="Consistency Beats Intuition."
        body="The most dangerous thing a bettor can do is bet by feel — chasing losses with bigger stakes or betting more after a hot streak. The Kelly Criterion removes emotion from the equation. By sizing every bet according to the formula, you guarantee that your bankroll follows the optimal mathematical path. SharpTracker makes this frictionless by doing all calculations automatically."
        imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80"
        imageAlt="Professional bettor working"
        imageRight
      />
      <FeatureCTA next="daily-calendar" nextLabel="Daily P&L Calendar" />
    </div>
  );
}

export function DailyCalendarPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Daily P&L Calendar" />
      <FeatureHero
        icon={IconCalendar}
        label="Feature — Daily P&L Calendar"
        title="See Your Performance at a Glance."
        subtitle="A visual profit-and-loss calendar that turns your betting history into a pattern you can read in seconds. Green days, red days, streaks, cycles — it's all there."
      />
      <StatRow stats={[
        { value: "Daily", label: "P&L Breakdown" },
        { value: "Streak", label: "Detection" },
        { value: "Sport", label: "Breakdown View" },
        { value: "Monthly", label: "& Weekly Totals" },
      ]} />
      <ContentBlock
        tag="The Visual Edge"
        heading="Patterns Are Invisible in Spreadsheets."
        body="When you look at a row of numbers in a spreadsheet, patterns hide in plain sight. The Daily P&L Calendar turns your results into a colour-coded grid. You see immediately which days of the week you perform best, which months are profitable, and how you handle weekends vs weekdays. These patterns help you adjust your betting behaviour and identify when to be more aggressive or conservative."
        imageUrl="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&q=80"
        imageAlt="Calendar planning and analytics"
        imageRight
      />
      <ContentBlock
        tag="Streak Analysis"
        heading="Knowing When You're Running Hot or Cold."
        body="Variance is brutal in sports betting. A 10-game losing streak can happen even when you're betting with a genuine edge. The P&L calendar makes streaks visible — you can see exactly when they started and ended, and compare them to your overall baseline. This context is essential for separating normal variance from a real problem with your process or line selection."
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
        imageAlt="Data streaks and performance analytics"
        dark
      />
      <ContentBlock
        tag="Sport Breakdown"
        heading="Not All Sports Are Equal."
        body="You might be crushing NBA but bleeding units on soccer. The calendar breaks down your P&L by sport so you can see exactly where your edge is — and where it isn't. This lets you double down on markets where you perform well and reduce your exposure in sports where the results suggest you don't have an edge. Data-driven discipline beats intuition every time."
        imageUrl="https://images.unsplash.com/photo-1540747913346-19212a27e8ff?w=1200&q=80"
        imageAlt="Sports performance breakdown"
        imageRight
      />
      <FeatureCTA next="multi-sport" nextLabel="Multi-Sport Coverage" />
    </div>
  );
}

export function MultiSportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Multi-Sport Coverage" />
      <FeatureHero
        icon={IconMultiSport}
        label="Feature — Multi-Sport Coverage"
        title="Every Sport. Every Market. One Terminal."
        subtitle="From NFL totals to UEFA Champions League 1X2 — SharpTracker monitors sharp line movements across all major sports simultaneously. No sport left behind."
      />
      <StatRow stats={[
        { value: "6+", label: "Sports Covered" },
        { value: "100+", label: "Soccer Leagues" },
        { value: "3", label: "Market Types" },
        { value: "50K+", label: "Updates / Minute" },
      ]} />
      <ContentBlock
        tag="Coverage"
        heading="All Major Sports in One Feed."
        body="SharpTracker tracks NFL, NBA, MLB, NHL, Soccer, and Tennis in real time. Each sport has its own market structure — moneyline, spread, and total for American sports; 1X2, Asian handicap, and over/under for soccer — and our system handles all of them natively. You can filter the live feed to show only the sports and market types you care about."
        imageUrl="https://images.unsplash.com/photo-1546519638405-a9f9e31f72f1?w=1200&q=80"
        imageAlt="Basketball game"
        imageRight
      />
      <ContentBlock
        tag="Soccer Depth"
        heading="100+ Soccer Leagues Monitored."
        body="Soccer has the deepest liquidity and the most efficient sharp markets in the world. We monitor over 100 leagues — from the Premier League to the Swedish Allsvenskan — and detect line movement across 1X2, Asian handicap, and goal total markets. Pinnacle, the benchmark book for sharp action, offers prices on virtually every professional soccer match globally, and we track all of it."
        imageUrl="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80"
        imageAlt="Soccer stadium"
        dark
      />
      <ContentBlock
        tag="Data Source"
        heading="Powered by Pinnacle."
        body="SharpTracker uses Pinnacle Sports as its primary data source. Pinnacle is universally regarded as the sharpest sportsbook in the world — they accept the highest limits, almost never limit winning bettors, and their lines reflect the true market consensus better than any other book. When Pinnacle moves a line, it's a meaningful signal. Every alert in SharpTracker is sourced from their live feed."
        imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
        imageAlt="Live trading data"
        imageRight
      />
      <FeatureCTA next="bankroll" nextLabel="Bankroll Growth" />
    </div>
  );
}

export function BankrollPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <FeatureNav title="Bankroll Growth" />
      <FeatureHero
        icon={IconBankroll}
        label="Feature — Bankroll Growth"
        title="Compound Your Edge Over Time."
        subtitle="A small consistent edge compounds into life-changing returns over years of disciplined betting. SharpTracker gives you the tools to find, track, and protect that edge."
      />
      <StatRow stats={[
        { value: "+299u", label: "SharpTracker Users (12 mo)" },
        { value: "-150u", label: "Average Bettor (12 mo)" },
        { value: "+EV", label: "Compounding Effect" },
        { value: "∞", label: "Long-Run Edge" },
      ]} />
      <ContentBlock
        tag="The Maths"
        heading="Small Edges Compound."
        body="A 2% edge on every bet sounds trivial. But compound that over 500 bets a year with disciplined Kelly sizing, and a $10,000 bankroll grows significantly. The key is not finding massive edges — it's finding consistent, repeatable small edges and betting them correctly. Sharp bettors don't try to win 70% of their bets. They win 53% at the right odds, manage stakes precisely, and let time do the rest."
        imageUrl="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80"
        imageAlt="Financial growth chart"
        imageRight
      />
      <ContentBlock
        tag="SharpTracker vs Average"
        heading="The Data Speaks for Itself."
        body="SharpTracker users who follow sharp line movements, track their CLV, and bet correctly sized stakes have outperformed the average bettor by over 400 units in our first year of data. The average bettor loses 5–10% of their handle annually. SharpTracker users who are disciplined with their process are consistently in positive territory — not because they got lucky, but because they have a process."
        imageUrl="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80"
        imageAlt="Performance comparison chart"
        dark
      />
      <ContentBlock
        tag="Bankroll Protection"
        heading="Never Bet What You Can't Afford to Lose."
        body="Even the best bettors in the world have 20-bet losing streaks. Bankroll management is not optional — it's survival. SharpTracker's stake calculator keeps your bets properly sized so that a bad run is uncomfortable but never fatal. We also surface your risk of ruin in real time so you always know where you stand relative to your bankroll and edge estimate."
        imageUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
        imageAlt="Financial planning and safety"
        imageRight
      />
      <FeatureCTA next="odds-drops" nextLabel="Odds Drop Alerts" />
    </div>
  );
}
