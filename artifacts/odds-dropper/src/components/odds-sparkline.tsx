import { memo } from "react";
import { useLocation } from "wouter";

interface Props {
  eventId: string;
  selection: string;
  currentOdds: number;
  openingOdds: number;
}

/**
 * Lightweight pure-SVG sparkline — no Recharts, no ResizeObserver overhead.
 * Renders 2 points (opening → current) as a step-line chart.
 */
export const OddsSparkline = memo(function OddsSparkline({
  eventId,
  currentOdds,
  openingOdds,
}: Props) {
  const [, navigate] = useLocation();
  const isDrop = currentOdds < openingOdds;
  const stroke = isDrop ? "#38bdf8" : "#94a3b8";

  const W = 150;
  const H = 72;
  const pad = 8;
  const iW = W - pad * 2;
  const iH = H - pad * 2;

  const lo = Math.min(openingOdds, currentOdds);
  const hi = Math.max(openingOdds, currentOdds);
  const range = hi - lo || 1;

  const toY = (v: number) => pad + iH - ((v - lo) / range) * iH;

  const x1 = pad;
  const x2 = pad + iW / 2;
  const x3 = pad + iW;
  const y1 = toY(openingOdds);
  const y2 = toY(currentOdds);

  // Step-after: horizontal then vertical
  const d = `M ${x1} ${y1} H ${x2} V ${y2} H ${x3}`;

  return (
    <div
      className="cursor-pointer group flex flex-col items-end gap-0.5"
      onClick={() => navigate(`/event/${eventId}`)}
      title="Click for full chart"
    >
      <div className="w-[150px] h-[72px] opacity-85 group-hover:opacity-100 transition-opacity rounded overflow-hidden bg-[#0c0e14] border border-white/8">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* subtle horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line
              key={t}
              x1={pad}
              x2={W - pad}
              y1={pad + iH * (1 - t)}
              y2={pad + iH * (1 - t)}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="2 4"
            />
          ))}
          <path d={d} stroke={stroke} strokeWidth={2} fill="none" />
          {/* endpoint dot */}
          <circle cx={x3} cy={y2} r={3} fill={stroke} />
        </svg>
      </div>
    </div>
  );
});
