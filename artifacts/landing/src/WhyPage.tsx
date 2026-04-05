import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowLeft, ArrowRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, BarChart, Bar, CartesianGrid,
  AreaChart, Area,
} from "recharts";

// ── Nav ───────────────────────────────────────────────────────────────────────
function WhyNav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">
            Sharp<span className="text-primary">Tracker</span>
          </span>
        </Link>
        <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-md text-sm transition-all">
          Get Access
        </button>
      </div>
    </nav>
  );
}

// ── Chart data ────────────────────────────────────────────────────────────────
// Simple 8-point line: stable, then a clean drop, then stable again.
const ODDS_DATA = [
  { t: "08:00", odds: 2.10 },
  { t: "09:00", odds: 2.10 },
  { t: "10:00", odds: 2.09 },
  { t: "11:00", odds: 2.10 },
  { t: "11:30", odds: 1.84 },  // ← drop happens here
  { t: "12:00", odds: 1.83 },
  { t: "13:00", odds: 1.82 },
  { t: "14:00", odds: 1.82 },
];

const CLV_DATA = [
  { label: "Your price", odds: 2.10 },
  { label: "Final price", odds: 1.82 },
];

const EV_GROWTH = Array.from({ length: 11 }, (_, i) => ({
  bets: i * 20,
  profit: parseFloat((i * 20 * 0.03).toFixed(1)),
}));

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-primary font-bold">{payload[0].value}</p>
    </div>
  );
}

// ── Layout helpers ─────────────────────────────────────────────────────────────
function Section({ children, dark = false, id }: { children: React.ReactNode; dark?: boolean; id?: string }) {
  return (
    <section id={id} className={`py-20 ${dark ? "bg-card/50 border-y border-border/20" : "bg-background"}`}>
      <div className="container mx-auto px-6 max-w-5xl">{children}</div>
    </section>
  );
}

function Tag({ text }: { text: string }) {
  return <span className="text-[10px] font-mono text-primary uppercase tracking-widest block mb-3">{text}</span>;
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-5">{children}</h2>;
}

// Body text in readable sans-serif with good contrast
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/70 leading-relaxed text-base">{children}</p>;
}

// ── Formula card ──────────────────────────────────────────────────────────────
function FormulaCard({ name, formula, plain, example }: {
  name: string; formula: string; plain: string; example: string;
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
      <div className="bg-background/60 rounded-lg px-4 py-3 font-mono text-primary text-sm font-bold">
        {formula}
      </div>
      <p className="text-foreground/65 text-sm leading-relaxed">{plain}</p>
      <p className="text-foreground/55 text-xs border-t border-border/30 pt-3 leading-relaxed">
        <span className="text-primary font-medium">Example: </span>{example}
      </p>
    </motion.div>
  );
}

function StepCard({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: num * 0.07 }}
      className="flex gap-5"
    >
      <div className="shrink-0 w-10 h-10 rounded-full border border-primary/40 bg-primary/10 text-primary font-mono font-bold text-sm flex items-center justify-center">
        {num}
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-foreground/65 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function WhyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WhyNav />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">The Strategy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Why SharpTracker?</h1>
            <p className="text-lg md:text-xl text-foreground/65 leading-relaxed">
              Most bettors don't lose because they pick the wrong teams. They lose because they bet at bad prices. SharpTracker shows you when a price is good — before everyone else sees it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Odds drop explained */}
      <Section>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Tag text="The Basics" />
            <H2>What is an odds drop?</H2>
            <P>
              A bookmaker sets a price for each team. Think of it like any other price — it reflects how likely they think each outcome is.
            </P>
            <div className="my-4" />
            <P>
              When a large group of professional bettors — called a syndicate — puts a lot of money on one team, the bookmaker gets nervous and quickly lowers the price. That sudden price drop is called an odds drop.
            </P>
            <div className="my-4" />
            <P>
              It usually means something has changed: a player is injured, the lineup has shifted, the weather is different, or their models spotted a price that was simply wrong. Whatever the reason — the drop is a signal. SharpTracker catches it within one second.
            </P>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-border/40 bg-card/60 p-6">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">How an odds drop looks</p>
              <p className="text-foreground/55 text-xs mb-5">
                The price is stable — then syndicates bet — and it drops fast. The shaded area is your window to act.
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ODDS_DATA} margin={{ top: 8, right: 12, bottom: 0, left: -24 }}>
                  <CartesianGrid stroke="#ffffff07" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="t"
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[1.70, 2.20]}
                    tickCount={4}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} />
                  {/* shade the "window" between drop and close */}
                  <ReferenceArea
                    x1="11:30"
                    x2="12:00"
                    fill="#00ffff"
                    fillOpacity={0.07}
                    stroke="#00ffff"
                    strokeOpacity={0.2}
                    label={{ value: "Your window", fill: "#00ffff", fontSize: 9, position: "insideTop" }}
                  />
                  <ReferenceLine
                    x="11:30"
                    stroke="#ff6b6b"
                    strokeDasharray="4 2"
                    strokeWidth={1.5}
                    label={{ value: "Drop", fill: "#ff6b6b", fontSize: 9, position: "insideTopRight" }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="odds"
                    stroke="#00ffff"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: "#00ffff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 pt-3 border-t border-border/20">
                <div className="text-center flex-1">
                  <p className="text-primary font-bold text-lg font-mono">2.10</p>
                  <p className="text-foreground/50 text-xs">Before</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-red-400 font-bold text-lg font-mono">↓</p>
                  <p className="text-foreground/50 text-xs">Drop</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-foreground/70 font-bold text-lg font-mono">1.82</p>
                  <p className="text-foreground/50 text-xs">After</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Why sharp bookmakers */}
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
                { label: "Accept big bets", desc: "Sharp bookmakers welcome large bets from professional bettors. That's why serious money flows through them." },
                { label: "Never ban winners", desc: "Most bookmakers limit or ban customers who win too often. Sharp bookmakers don't — so winning bettors keep betting there." },
                { label: "Most accurate prices", desc: "Because they take all the smart money, their prices end up being the most accurate reflection of the true probability." },
                { label: "Everyone follows them", desc: "When a sharp bookmaker changes a price, the rest of the market copies it within minutes." },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-border/40 bg-background/60 p-4">
                  <p className="text-primary text-xs font-semibold mb-2">{c.label}</p>
                  <p className="text-foreground/60 text-xs leading-relaxed">{c.desc}</p>
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
            <Tag text="The Source" />
            <H2>Sharp bookmakers set the price for everyone else.</H2>
            <P>
              Not all bookmakers are equal. Most will limit or ban you if you win too often. Sharp bookmakers work differently — they accept professional money and charge very low margins.
            </P>
            <div className="my-4" />
            <P>
              This makes their prices the most accurate in the market. When a sharp bookmaker moves a price, it's the strongest signal available in sports betting. SharpTracker monitors these prices around the clock.
            </P>
          </motion.div>
        </div>
      </Section>

      {/* The Math */}
      <Section>
        <div className="text-center mb-12">
          <Tag text="The Math" />
          <H2>Four ideas that separate winning bettors from everyone else.</H2>
          <p className="text-foreground/60 text-base max-w-2xl mx-auto leading-relaxed">
            You don't need to be a mathematician. You just need to understand these four ideas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FormulaCard
            name="1 — Implied Probability"
            formula="Chance = 1 ÷ Odds"
            plain="Every set of odds has a hidden probability in it. Odds of 2.00 mean the bookmaker thinks there's a 50% chance. Odds of 1.67 mean they think there's a 60% chance."
            example="Odds 2.10 → 1 ÷ 2.10 = 47.6% chance of winning (according to the bookmaker)."
          />
          <FormulaCard
            name="2 — Fair Price (No Vig)"
            formula="Fair Odds = 1 ÷ True Chance"
            plain="Bookmakers add a small cut for themselves — called the vig or margin. Strip that out and you get the fair price: what the bet is actually worth without the house taking a cut."
            example="If the true chance is 50%, the fair price is 1 ÷ 0.50 = 2.00. If the bookmaker offers 2.10, you're getting a better deal."
          />
          <FormulaCard
            name="3 — Expected Value (EV)"
            formula="EV = (Win chance × Profit) − (Lose chance × Stake)"
            plain="EV tells you how much you expect to make — or lose — on average per bet. A positive EV bet will make money over time. A negative EV bet will lose money over time, no matter how lucky you get short-term."
            example="Bet €10 at odds 2.10. True chance is 55%. EV = (0.55 × €11) − (0.45 × €10) = €6.05 − €4.50 = +€1.55 average profit per bet."
          />
          <FormulaCard
            name="4 — Closing Line Value (CLV)"
            formula="CLV = Your odds − Final odds"
            plain="The final price before a game starts is the most accurate price — the whole market has had time to react. If you got better odds than the final price, you got good value. Doing this consistently is proof you have a real edge."
            example="You bet at 2.10. Final price was 1.82. You beat it by 0.28 — that's strong CLV and a sign your timing was right."
          />
        </div>

        {/* CLV visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 rounded-2xl border border-border/40 bg-card/60 p-6"
        >
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">CLV in practice</p>
          <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
            You got 2.10. The game closed at 1.82. The taller bar is your entry — you got paid more than the market thought was fair. That difference is your edge.
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CLV_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid stroke="#ffffff07" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[1.5, 2.3]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="odds" radius={[5, 5, 0, 0]}>
                {CLV_DATA.map((_, i) => (
                  <rect key={i} fill={i === 0 ? "#00ffff" : "#374151"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </Section>

      {/* Long-run growth */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Tag text="The Long Game" />
            <H2>A small edge adds up to a lot.</H2>
            <P>
              You don't need to win every bet. You just need to be right a little more often than the odds suggest — and bet consistently over time.
            </P>
            <div className="my-4" />
            <P>
              A 3% edge on every bet sounds small. But repeat that 200 times and you're up 6 units. Do it 1,000 times — 30 units. Most bettors never reach this because they have no process, no tracking, and no idea if they have a real edge. SharpTracker fixes all three.
            </P>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border/40 bg-background/60 p-6"
          >
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
              Profit over time
            </p>
            <p className="text-foreground/55 text-xs mb-5 leading-relaxed">
              Simulated result of a 3% edge, bet consistently 200 times.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={EV_GROWTH} margin={{ top: 4, right: 12, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ffff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00ffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff07" strokeDasharray="3 3" />
                <XAxis dataKey="bets" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Bets", fill: "#6b7280", fontSize: 9, position: "insideBottomRight", offset: -4 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Units", fill: "#6b7280", fontSize: 9, angle: -90, position: "insideLeft" }} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="profit" stroke="#00ffff" strokeWidth={2.5} fill="url(#growthGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Tag text="Step by Step" />
            <H2>How SharpTracker works.</H2>
            <p className="text-foreground/60 leading-relaxed">
              Four steps. From price drop to your notification — in under a second.
            </p>
          </div>
          <div className="flex flex-col gap-8">
            <StepCard
              num={1}
              title="A price drops"
              desc="SharpTracker watches live prices from sharp bookmakers every second. The moment a price drops more than your set limit, it's flagged."
            />
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-primary/30 rotate-90" /></div>
            <StepCard
              num={2}
              title="The fair price is calculated"
              desc="The system removes the bookmaker's margin and shows the true fair price — so you can see if a bet is actually good value right now."
            />
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-primary/30 rotate-90" /></div>
            <StepCard
              num={3}
              title="You get the alert"
              desc="A notification arrives on your phone with the match, market, drop size, and fair price. All of this happens in under one second."
            />
            <div className="flex justify-center"><ArrowRight className="w-4 h-4 text-primary/30 rotate-90" /></div>
            <StepCard
              num={4}
              title="You bet before others catch up"
              desc="Slower bookmakers take 30 seconds to several minutes to copy the new price. That gap is your window — and SharpTracker puts you right at the front of it."
            />
          </div>
        </div>
      </Section>

      {/* Why it works */}
      <Section dark>
        <div className="text-center mb-12">
          <Tag text="Why This Works" />
          <H2>The market is never perfectly up to date.</H2>
          <p className="text-foreground/60 text-base max-w-2xl mx-auto leading-relaxed">
            There is always a gap between when the right price is known and when everyone else catches up. SharpTracker lives in that gap.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Speed gap",
              body: "Sharp bookmakers update prices in milliseconds. Slower bookmakers take up to several minutes. That time difference is a real pricing gap — and you can bet into it.",
            },
            {
              title: "Information gap",
              body: "Syndicates and sharp groups often know about injuries, lineup changes, or weather before it's public. When their money moves a price, it reflects that. You don't need to know why — just follow the signal.",
            },
            {
              title: "Process gap",
              body: "Most bettors bet by gut feeling and never track their results. Bettors who follow a simple data-driven process — track, measure, repeat — consistently outperform the average over the long run.",
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
              <h3 className="font-semibold text-foreground mb-3">{c.title}</h3>
              <p className="text-foreground/60 text-sm leading-relaxed">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-24 bg-background border-t border-border/20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to bet smarter?</h2>
          <p className="text-foreground/60 mb-8 leading-relaxed">
            SharpTracker handles the data. You handle the bets. Free to start.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              Get Free Access
            </button>
            <Link
              href="/features/odds-drops"
              className="border border-border/50 text-foreground px-8 py-3 rounded-md text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 justify-center"
            >
              See the features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
