import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useLang } from "./LanguageContext";
import { t } from "./i18n";

const USAGE_OPTIONS = [
  { value: "light",  label: "Light (2–5 hours / week)"   },
  { value: "medium", label: "Medium (5–10 hours / week)"  },
  { value: "heavy",  label: "Heavy (10–20 hours / week)"  },
];
const TIMEFRAME_OPTIONS = [
  { value: "2w", label: "2 weeks",  weeks: 2  },
  { value: "1m", label: "1 month",  weeks: 4  },
  { value: "3m", label: "3 months", weeks: 13 },
  { value: "6m", label: "6 months", weeks: 26 },
];
const PROFIT_TABLE: Record<string, Record<string, [number, number]>> = {
  light:  { "2w": [15, 60],   "1m": [30, 120],  "3m": [90, 360],   "6m": [180, 720]  },
  medium: { "2w": [30, 120],  "1m": [60, 240],  "3m": [180, 750],  "6m": [375, 1350] },
  heavy:  { "2w": [60, 225],  "1m": [120, 450], "3m": [375, 1800], "6m": [750, 3750] },
};

export default function ProfitCalculatorSection() {
  const { lang } = useLang();
  const tr = t(lang);
  const [bankroll, setBankroll] = useState(1000);
  const [usage, setUsage]       = useState("medium");
  const [timeframe, setTimeframe] = useState("3m");
  const [result, setResult]     = useState<{ data: { w: string; v: number }[]; profit: number; roi: number } | null>(null);

  function calculate() {
    const tf = tr.calc.timeframeOptions.find(o => o.value === timeframe)!;

    let rng = ((Date.now() * 1000003) ^ 0xdeadbeef) >>> 0;
    const rand = () => {
      rng ^= rng << 13; rng ^= rng >> 17; rng ^= rng << 5;
      return (rng >>> 0) / 4294967296;
    };

    const [pMin, pMax] = PROFIT_TABLE[usage][timeframe];
    const scaleFactor  = bankroll / 1000;
    const targetProfit = (pMin + rand() * (pMax - pMin)) * scaleFactor;
    const targetFinal  = bankroll + targetProfit;

    const days        = tf.weeks * 7;
    const noiseFactor = 0.04;

    let cur = bankroll;
    const raw: number[] = [cur];

    for (let i = 1; i <= days; i++) {
      const r    = rand();
      const move = (r - 0.46) * noiseFactor * 2;
      cur = Math.max(cur * (1 + move), bankroll * 0.5);
      raw.push(cur);
    }

    const rawFinal = raw[raw.length - 1];
    const driftScale = targetFinal / rawFinal;
    const data = raw.map((v, i) => {
      const tPos = i / (raw.length - 1);
      const drift = 1 + tPos * (driftScale - 1);
      return { w: String(i), v: Math.max(0, Math.round(v * drift - bankroll)) };
    });

    const profit = data[data.length - 1].v;
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
          <span className="text-xs font-mono tracking-widest text-primary uppercase">{tr.calc.badge}</span>
          <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight mt-3 mb-4">{tr.calc.heading}</h2>
          <p className="text-foreground/65 text-xl max-w-xl mx-auto">
            {tr.calc.subtitle}
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

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">{tr.calc.bankrollLabel}</label>
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
                <p className="text-xs text-muted-foreground">{tr.calc.bankrollHint}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">{tr.calc.usageLabel}</label>
                <div className="relative">
                  <select
                    value={usage}
                    onChange={e => setUsage(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {tr.calc.usageOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
                <p className="text-xs text-muted-foreground">{tr.calc.usageHint}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold font-sans">{tr.calc.timeframeLabel}</label>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={e => setTimeframe(e.target.value)}
                    className={inputCls + " appearance-none pr-10 cursor-pointer"}
                  >
                    {tr.calc.timeframeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
                </div>
              </div>

              <button
                onClick={calculate}
                className="w-full bg-primary text-background font-bold font-sans py-3.5 rounded-lg hover:bg-primary/85 active:scale-[0.98] transition-all text-sm tracking-wide"
              >
                {tr.calc.calculateBtn}
              </button>
            </div>

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
                          formatter={(v: number) => [`+€${v.toLocaleString()}`, "Profit"]}
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
                      Data may not reflect actual results. Illustrative purposes only. Past performance does not guarantee future results.
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
