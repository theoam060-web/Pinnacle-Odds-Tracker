import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowLeft, ArrowRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, AreaChart, Area, CartesianGrid, BarChart, Bar,
} from "recharts";

// ── Shared nav ────────────────────────────────────────────────────────────────
function WhyNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-sans font-bold text-lg tracking-tight">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </Link>
        <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-md font-mono text-sm transition-all">
          Get Access
        </button>
      </div>
    </nav>
  );
}

// ── Mock data for charts ──────────────────────────────────────────────────────

// Odds movement: shows odds being stable, then a sharp bettor places money,
// and the line drops (gets shorter / less favourable).
const ODDS_MOVEMENT = [
  { time: "08:00", odds: 2.10 },
  { time: "09:00", odds: 2.08 },
  { time: "10:00", odds: 2.09 },
  { time: "10:45", odds: 2.10 },
  { time: "11:00", odds: 1.90 },   // ← sharp money hits here
  { time: "11:15", odds: 1.85 },
  { time: "12:00", odds: 1.84 },
  { time: "13:00", odds: 1.82 },
  { time: "Kick-off", odds: 1.80 }, // closing line
];

// CLV example: you bet at 2.10, the line closed at 1.80 — you beat it.
const CLV_DATA = [
  { label: "Your entry", odds: 2.10 },
  { label: "Closing line", odds: 1.80 },
];

// Long-run EV simulation: a +3% edge bet 200 times
const EV_SIMULATION = Array.from({ length: 21 }, (_, i) => ({
  bets: i * 10,
  units: parseFloat((i * 10 * 0.03).toFixed(1)),
}));

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-lg px-3 py-2 font-mono text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="text-primary font-bold">{payload[0].value}</p>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  children,
  dark = false,
  id,
}: {
  children: React.ReactNode;
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`py-20 ${dark ? "bg-card/50 border-y border-border/20" : "bg-background"}`}
    >
      <div className="container mx-auto px-6 max-w-5xl">{children}</div>
    </section>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="text-[10px] font-mono text-primary uppercase tracking-widest block mb-3">
      {text}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-foreground mb-4">
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground font-mono leading-relaxed text-sm md:text-base">
      {children}
    </p>
  );
}

// ── Formula card ──────────────────────────────────────────────────────────────
function FormulaCard({
  name,
  formula,
  plain,
  example,
}: {
  name: string;
  formula: string;
  plain: string;
  example: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-border/40 bg-card/60 p-6 flex flex-col gap-3"
    >
      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{name}</span>
      <div className="bg-background/60 rounded-lg px-4 py-3 font-mono text-primary text-sm md:text-base font-bold">
        {formula}
      </div>
      <p className="text-muted-foreground font-mono text-xs leading-relaxed">{plain}</p>
      <p className="text-foreground/70 font-mono text-xs border-t border-border/30 pt-3">
        <span className="text-primary">Example: </span>{example}
      </p>
    </motion.div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function StepCard({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: num * 0.08 }}
      className="flex gap-4"
    >
      <div className="shrink-0 w-10 h-10 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center">
        {num}
      </div>
      <div>
        <h3 className="font-sans font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-muted-foreground font-mono text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WhyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <WhyNav />

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">The Strategy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Why SharpTracker?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-mono leading-relaxed">
              Most bettors lose because they bet at bad prices. SharpTracker shows you when the price is good — before the rest of the market figures it out.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── What is an odds drop ── */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Tag text="The Basics" />
            <Heading>What is an odds drop?</Heading>
            <Body>
              A sportsbook sets its odds based on its best guess of the true probability. But when a professional bettor — someone who bets for a living — places a large bet on one side, the sportsbook gets nervous and shortens the odds to reduce its risk.
            </Body>
            <br />
            <Body>
              That drop in odds is a signal. It means someone with real information has put real money down. SharpTracker catches that signal the moment it happens — usually within one second.
            </Body>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-xl border border-border/40 bg-card/60 p-6">
              <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
                Example — odds moving after sharp action
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ODDS_MOVEMENT} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradOdds" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ffff" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff08" strokeDasharray="4 4" />
                  <XAxis dataKey="time" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} />
                  <YAxis
                    domain={[1.75, 2.15]}
                    tickCount={5}
                    tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }}
                  />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine x="11:00" stroke="#ff5555" strokeDasharray="4 2" label={{ value: "Sharp bet ↓", fill: "#ff5555", fontSize: 9, fontFamily: "monospace" }} />
                  <Area
                    type="monotone"
                    dataKey="odds"
                    stroke="#00ffff"
                    strokeWidth={2}
                    fill="url(#gradOdds)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] font-mono text-muted-foreground mt-3 text-center">
                Odds drop from 2.10 → 1.80 after sharp money. That opening window is your edge.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Why Pinnacle ── */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 md:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Highest limits", desc: "Pinnacle accepts bigger bets than any other book — so sharp bettors use it." },
                { label: "Never limits winners", desc: "Unlike most books, Pinnacle does not ban bettors who win consistently." },
                { label: "Tightest margins", desc: "Their vig (house edge) is the lowest — which means their prices are closest to the truth." },
                { label: "Market leader", desc: "When Pinnacle moves a line, every other book in the world follows within minutes." },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-primary font-mono text-xs font-bold mb-1">{c.label}</p>
                  <p className="text-muted-foreground text-xs font-mono leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 md:order-2"
          >
            <Tag text="Why Pinnacle?" />
            <Heading>The world's sharpest sportsbook.</Heading>
            <Body>
              Not all sportsbooks are equal. Most books ban or limit anyone who wins consistently. They want recreational bettors only.
            </Body>
            <br />
            <Body>
              Pinnacle is different. They welcome professional bettors, accept the largest bets, and charge the smallest margin. This makes their odds the most accurate reflection of true probability in the world. When Pinnacle moves a line, it means something. SharpTracker is wired directly into their live feed.
            </Body>
          </motion.div>
        </div>
      </Section>

      {/* ── The Math ── */}
      <Section>
        <div className="text-center mb-12">
          <Tag text="The Math" />
          <Heading>How do you know a bet has value?</Heading>
          <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
            You don't need to be a mathematician. But understanding four simple ideas separates profitable bettors from everyone else.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FormulaCard
            name="1 — Implied Probability"
            formula="Prob = 1 ÷ Decimal Odds"
            plain="Every set of odds has a hidden probability baked in. If odds are 2.00, the book thinks the chance is 50%. If odds are 1.67, the book thinks it's 60%."
            example='Odds 2.10 → 1 ÷ 2.10 = 47.6% implied chance of winning.'
          />
          <FormulaCard
            name="2 — No-Vig Fair Odds"
            formula="Fair Odds = 1 ÷ True Probability"
            plain="Sportsbooks add a margin (vig) to guarantee profit. Strip the vig out and you get the true fair odds — what the bet is actually worth."
            example="If the book implies 52% with vig, fair probability might be 50%. Fair odds: 1 ÷ 0.50 = 2.00."
          />
          <FormulaCard
            name="3 — Expected Value (EV)"
            formula="EV = (Win chance × Profit) − (Lose chance × Stake)"
            plain="EV tells you how much you expect to win or lose per bet on average. A positive EV bet will make money over time. A negative EV bet will lose money over time."
            example="Bet €10 at 2.10. True chance is 55%. EV = (0.55 × €11) − (0.45 × €10) = €6.05 − €4.50 = +€1.55 per bet."
          />
          <FormulaCard
            name="4 — Closing Line Value (CLV)"
            formula="CLV = Your Odds − Closing Odds"
            plain="The closing line is the final odds before the game starts — usually the most accurate. If your odds were better than the closing line, you got value. Consistently beating the closing line is proof that your process works."
            example="You bet at 2.10. Game closed at 1.80. You beat the line by 0.30 — strong positive CLV."
          />
        </div>

        {/* CLV chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 rounded-xl border border-border/40 bg-card/60 p-6"
        >
          <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
            CLV example — you beat the closing line
          </p>
          <p className="text-xs font-mono text-muted-foreground mb-5">
            Your bet was placed at 2.10. The market closed at 1.80. That gap is your edge — you got paid more than the market said was fair.
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CLV_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="#ffffff08" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} />
              <YAxis domain={[1.6, 2.2]} tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="odds" fill="#00ffff" opacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </Section>

      {/* ── Long-run EV chart ── */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Tag text="The Long Game" />
            <Heading>Small edge. Big results.</Heading>
            <Body>
              You don't need to win every bet. You just need to be right slightly more often than the odds imply — and bet consistently. A 3% edge compounding over 200 bets adds up to 6 units. Over 1,000 bets, that's 30 units of pure profit.
            </Body>
            <br />
            <Body>
              Most bettors never reach this because they bet random amounts, skip tracking, and have no idea whether they have a real edge. SharpTracker fixes all three.
            </Body>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl border border-border/40 bg-background/60 p-6"
          >
            <p className="text-xs font-mono text-muted-foreground mb-4 uppercase tracking-widest">
              Simulated profit — 3% edge, 200 bets
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={EV_SIMULATION} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradEV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffff" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff08" strokeDasharray="4 4" />
                <XAxis dataKey="bets" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} label={{ value: "Bets placed", fill: "#6b7280", fontSize: 9, position: "insideBottom", offset: -2 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} label={{ value: "Units", fill: "#6b7280", fontSize: 9, angle: -90, position: "insideLeft" }} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="units" stroke="#00ffff" strokeWidth={2} fill="url(#gradEV)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </Section>

      {/* ── Strategy steps ── */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Tag text="The Workflow" />
            <Heading>How SharpTracker works, step by step.</Heading>
          </div>
          <div className="flex flex-col gap-8">
            <StepCard
              num={1}
              title="An odds drop is detected"
              desc="SharpTracker watches Pinnacle's live feed every second. The moment a line moves more than your set threshold, it's flagged instantly."
            />
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-primary/40 rotate-90" />
            </div>
            <StepCard
              num={2}
              title="Fair value is calculated"
              desc="The system strips out the vig and calculates the true no-vig probability — so you can see if the current price at your book is actually good."
            />
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-primary/40 rotate-90" />
            </div>
            <StepCard
              num={3}
              title="You get the alert"
              desc="A push notification lands on your phone with the match, market, drop size, and the calculated fair value. All in under a second."
            />
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-primary/40 rotate-90" />
            </div>
            <StepCard
              num={4}
              title="You bet before the market moves"
              desc="Slow books take 30 seconds to several minutes to follow Pinnacle. That window is where your edge lives. You bet the old number before it disappears."
            />
          </div>
        </div>
      </Section>

      {/* ── Why it works ── */}
      <Section dark>
        <div className="text-center mb-12">
          <Tag text="The Reason" />
          <Heading>Why does this actually work?</Heading>
          <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
            Markets are not perfectly efficient. There is always a delay between when the right price is known and when everyone else catches up.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Speed gap",
              body: "Pinnacle moves its line in milliseconds. Recreational books take up to several minutes. That delay is a genuine pricing gap — and you can bet into it.",
            },
            {
              title: "Information gap",
              body: "Sharp bettors have better information, better models, and faster execution than the average bettor. When they act, it's a signal. SharpTracker gives you that signal.",
            },
            {
              title: "Discipline gap",
              body: "Most bettors bet emotionally and never track results. Bettors who follow a data-driven process — even a simple one — outperform the average over the long run.",
            },
          ].map((c) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-border/40 bg-background/60 p-6"
            >
              <h3 className="font-sans font-semibold text-foreground mb-3">{c.title}</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="py-24 bg-background border-t border-border/20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold font-sans mb-4">Ready to bet smarter?</h2>
          <p className="text-muted-foreground font-mono text-sm mb-8">
            SharpTracker handles the data. You handle the bets. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-sans font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              Get Free Access
            </button>
            <Link
              href="/features/odds-drops"
              className="border border-border/50 text-foreground px-8 py-3 rounded-md font-mono text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 justify-center"
            >
              See the features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
