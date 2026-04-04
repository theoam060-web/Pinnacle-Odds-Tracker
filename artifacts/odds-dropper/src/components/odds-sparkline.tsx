import { LineChart, Line, ResponsiveContainer, YAxis, CartesianGrid } from "recharts";
import { useLocation } from "wouter";

interface Props {
  eventId: string;
  selection: string;
  currentOdds: number;
  openingOdds: number;
}

export function OddsSparkline({ eventId, selection, currentOdds, openingOdds }: Props) {
  const [, navigate] = useLocation();

  const isDrop = currentOdds < openingOdds;

  const points = [
    { t: "open", odds: openingOdds },
    { t: "now", odds: currentOdds },
  ];

  return (
    <div
      className="cursor-pointer group flex flex-col items-end gap-0.5"
      onClick={() => navigate(`/event/${eventId}`)}
      title="Click for full chart"
    >
      <div className="w-[150px] h-[72px] opacity-85 group-hover:opacity-100 transition-opacity rounded overflow-hidden bg-[#0c0e14] border border-white/8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 6, right: 6, left: 6, bottom: 6 }}>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <YAxis domain={["auto", "auto"]} hide />
            <Line
              type="stepAfter"
              dataKey="odds"
              stroke={isDrop ? "#38bdf8" : "#94a3b8"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
