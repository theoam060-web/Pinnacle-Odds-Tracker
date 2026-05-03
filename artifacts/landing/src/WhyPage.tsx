import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowLeft, ArrowRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, CartesianGrid,
} from "recharts";
import { useLang } from "./LanguageContext";
import { tPages } from "./i18n-pages";

const ODDS_DATA = [
  { t: "08:00", odds: 2.10 },
  { t: "09:00", odds: 2.10 },
  { t: "10:00", odds: 2.09 },
  { t: "11:00", odds: 2.10 },
  { t: "11:30", odds: 1.84 },
  { t: "12:00", odds: 1.83 },
  { t: "13:00", odds: 1.82 },
  { t: "14:00", odds: 1.82 },
];

const GROWTH_DATA = [
  { bets: 0,    sharp: 0.0,  avg: 0.0  },
  { bets: 50,   sharp: 1.2,  avg: 2.8  },
  { bets: 100,  sharp: -0.8, avg: 1.1  },
  { bets: 150,  sharp: 2.9,  avg: -3.2 },
  { bets: 200,  sharp: 1.4,  avg: -6.8 },
  { bets: 250,  sharp: 6.1,  avg: -4.1 },
  { bets: 300,  sharp: 5.3,  avg: -9.7 },
  { bets: 350,  sharp: 9.8,  avg: -13.4 },
  { bets: 400,  sharp: 8.2,  avg: -16.9 },
  { bets: 450,  sharp: 13.7, avg: -21.3 },
  { bets: 500,  sharp: 11.9, avg: -18.4 },
  { bets: 550,  sharp: 17.2, avg: -24.6 },
  { bets: 600,  sharp: 21.8, avg: -28.9 },
  { bets: 650,  sharp: 18.6, avg: -32.1 },
  { bets: 700,  sharp: 24.3, avg: -35.8 },
  { bets: 750,  sharp: 27.9, avg: -33.2 },
  { bets: 800,  sharp: 23.5, avg: -39.4 },
  { bets: 850,  sharp: 29.7, avg: -43.1 },
  { bets: 900,  sharp: 33.2, avg: -46.8 },
  { bets: 950,  sharp: 30.1, avg: -44.2 },
  { bets: 1000, sharp: 36.4, avg: -51.7 },
];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="text-primary font-bold">{payload[0].value}</p>
    </div>
  );
}

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

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/70 leading-relaxed text-base">{children}</p>;
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

export default function WhyPage() {
  const { lang } = useLang();
  const tp = tPages(lang);
  const w = tp.why;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{tp.back}</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">
              Sharp<span className="text-primary">Tracker</span>
            </span>
          </Link>
          <button className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-md text-sm transition-all">
            {tp.getAccess}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="container mx-auto px-6 relative text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{w.badge}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{w.h1}</h1>
            <p className="text-lg md:text-xl text-foreground/65 leading-relaxed">{w.subtitle}</p>
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
            <Tag text={w.basicsTag} />
            <H2>{w.basicsH2}</H2>
            <P>{w.basicsP1}</P>
            <div className="my-4" />
            <P>{w.basicsP2}</P>
            <div className="my-4" />
            <P>{w.basicsP3}</P>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-border/40 bg-card/60 p-6">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">{w.basicsChartLabel}</p>
              <p className="text-foreground/55 text-xs mb-5">{w.basicsChartDesc}</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ODDS_DATA} margin={{ top: 8, right: 12, bottom: 0, left: -24 }}>
                  <CartesianGrid stroke="#ffffff07" strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[1.70, 2.20]} tickCount={4} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceArea
                    x1="11:30" x2="12:00"
                    fill="#00ffff" fillOpacity={0.07}
                    stroke="#00ffff" strokeOpacity={0.2}
                    label={{ value: w.yourWindow, fill: "#00ffff", fontSize: 9, position: "insideTop" }}
                  />
                  <ReferenceLine
                    x="11:30" stroke="#ff6b6b" strokeDasharray="4 2" strokeWidth={1.5}
                    label={{ value: w.dropLabel, fill: "#ff6b6b", fontSize: 9, position: "insideTopRight" }}
                  />
                  <Line type="stepAfter" dataKey="odds" stroke="#00ffff" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#00ffff" }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3 pt-3 border-t border-border/20">
                <div className="text-center flex-1">
                  <p className="text-primary font-bold text-lg font-mono">2.10</p>
                  <p className="text-foreground/50 text-xs">{w.before}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-red-400 font-bold text-lg font-mono">↓</p>
                  <p className="text-foreground/50 text-xs">{w.dropLabel}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-foreground/70 font-bold text-lg font-mono">1.82</p>
                  <p className="text-foreground/50 text-xs">{w.after}</p>
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
              {w.booksCards.map((c) => (
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
            <Tag text={w.booksTag} />
            <H2>{w.booksH2}</H2>
            <P>{w.booksP1}</P>
            <div className="my-4" />
            <P>{w.booksP2}</P>
          </motion.div>
        </div>
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
            <Tag text={w.longTag} />
            <H2>{w.longH2}</H2>
            <P>{w.longP1}</P>
            <div className="my-4" />
            <P>{w.longP2}</P>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border/40 bg-background/60 p-6"
          >
            <div className="flex items-center gap-4 mb-5">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-primary uppercase tracking-widest">
                <span className="w-6 h-[2px] bg-primary inline-block rounded" />
                SharpTracker
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
                <span className="w-6 h-[2px] bg-red-500/60 inline-block rounded" />
                {w.avgBettor}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={GROWTH_DATA} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <XAxis hide={true} />
                <YAxis hide={true} />
                <ReferenceLine y={0} stroke="#ffffff12" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="sharp" stroke="#00ffff" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#00ffff" }} />
                <Line type="monotone" dataKey="avg" stroke="#ef4444" strokeWidth={2} strokeOpacity={0.55} dot={false} activeDot={{ r: 3, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-end mt-2">
              <p className="text-[11px] font-mono text-foreground/45">
                <span className="text-primary font-semibold">+36 units</span>
                {" vs "}
                <span className="text-red-500/70">−52 units</span>
                {" — after 1,000 bets"}
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Tag text={w.howTag} />
            <H2>{w.howH2}</H2>
            <p className="text-foreground/60 leading-relaxed">{w.howSubtitle}</p>
          </div>
          <div className="flex flex-col gap-8">
            {w.howSteps.map((step, i) => (
              <div key={i}>
                <StepCard num={i + 1} title={step.title} desc={step.desc} />
                {i < w.howSteps.length - 1 && (
                  <div className="flex justify-center mt-8">
                    <ArrowRight className="w-4 h-4 text-primary/30 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Why it works */}
      <Section dark>
        <div className="text-center mb-12">
          <Tag text={w.whyTag} />
          <H2>{w.whyH2}</H2>
          <p className="text-foreground/60 text-base max-w-2xl mx-auto leading-relaxed">{w.whySubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {w.whyGaps.map((c) => (
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
          <h2 className="text-3xl font-bold mb-4">{w.ctaH2}</h2>
          <p className="text-foreground/60 mb-8 leading-relaxed">{w.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              {w.ctaBtn1}
            </button>
            <Link
              href="/features/odds-drops"
              className="border border-border/50 text-foreground px-8 py-3 rounded-md text-sm hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 justify-center"
            >
              {w.ctaBtn2}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
