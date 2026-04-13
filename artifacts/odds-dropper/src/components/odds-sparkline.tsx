import { memo } from "react";

interface Props {
  eventId: string;
  selection: string;
  currentOdds: number;
  openingOdds: number;
  movements?: Array<{ odds: number; timestamp: string | Date; selection: string }>;
  onClick?: () => void;
}

/**
 * Lightweight pure-SVG sparkline — no Recharts, no ResizeObserver overhead.
 * If `movements` is supplied, draws a real multi-point sparkline.
 * Otherwise falls back to a step-line (opening → current).
 */
export const OddsSparkline = memo(function OddsSparkline({
  selection,
  currentOdds,
  openingOdds,
  movements,
  onClick,
}: Props) {
  const isDrop = currentOdds < openingOdds;
  const stroke = isDrop ? "#38bdf8" : "#94a3b8";

  const W = 80;
  const H = 36;
  const pad = 4;
  const iW = W - pad * 2;
  const iH = H - pad * 2;

  // Build point list from movements (filter to this selection) or fallback
  const selMovements = movements
    ? movements
        .filter(m => m.selection === selection)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  const pointOdds: number[] =
    selMovements.length >= 2
      ? selMovements.map(m => m.odds)
      : [openingOdds, currentOdds];

  const lo = Math.min(...pointOdds);
  const hi = Math.max(...pointOdds);
  const range = hi - lo || 0.001;

  const toY = (v: number) => pad + iH - ((v - lo) / range) * iH;
  const toX = (i: number) => pad + (i / (pointOdds.length - 1)) * iW;

  const pts = pointOdds.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
  const polyline = pts.join(" ");

  // Fill area under the line
  const fillPts = [
    `${toX(0).toFixed(1)},${(H - pad).toFixed(1)}`,
    ...pts,
    `${toX(pointOdds.length - 1).toFixed(1)},${(H - pad).toFixed(1)}`,
  ].join(" ");

  const gradId = `sg-${isDrop ? "d" : "r"}`;

  return (
    <div
      className="cursor-pointer group"
      onClick={onClick}
      title="Click for full chart"
    >
      <div className="opacity-80 group-hover:opacity-100 transition-opacity rounded overflow-hidden">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Fill */}
          <polygon points={fillPts} fill={`url(#${gradId})`} />
          {/* Line */}
          <polyline
            points={polyline}
            stroke={stroke}
            strokeWidth={1.5}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* End dot */}
          <circle
            cx={toX(pointOdds.length - 1)}
            cy={toY(pointOdds[pointOdds.length - 1]!)}
            r={2}
            fill={stroke}
          />
        </svg>
      </div>
    </div>
  );
});
