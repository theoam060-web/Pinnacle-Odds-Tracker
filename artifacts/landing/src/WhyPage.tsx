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

export default function WhyPage() {
  const { lang } = useLang();
  const w = tPages(lang).why;

  return (
    <div>
      <section className="py-24 bg-background border-t border-border/20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">{w.ctaH2}</h2>
          <p className="text-foreground/60 mb-8 leading-relaxed">{w.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(0,255,255,0.2)]"
            >
              {w.ctaBtn1}
            </Link>
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
