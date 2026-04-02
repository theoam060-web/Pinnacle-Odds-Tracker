import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { useGetOddsDropById, getGetOddsDropByIdQueryKey } from "@workspace/api-client-react";
import { formatOdds, formatTime } from "@/lib/format";
import { computeNovig } from "@/lib/novig";
import { OddsGraphModal } from "./odds-graph-modal";
import { useAlertStore } from "@/lib/alert-context";

interface Props {
  eventId: string;
  selection: string;
  currentOdds: number;
  openingOdds: number;
}

interface ChartPoint {
  t: string;
  odds: number;
  novig?: number;
}

function buildPoints(
  movements: Array<{ timestamp: Date | string; odds: number; selection: string; limit?: number | null }>,
  lines: Array<{ selection: string; openingOdds: number; currentOdds: number }>,
  selection: string,
  novigMethod: string,
): ChartPoint[] {
  const selMovements = movements
    .filter(m => m.selection === selection)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const openLine = lines.find(l => l.selection === selection);

  const pts: ChartPoint[] = [];
  if (openLine) {
    pts.push({ t: "open", odds: openLine.openingOdds, novig: openLine.openingOdds });
  }

  for (const m of selMovements) {
    const allOdds = lines.map(l => {
      const latest = movements
        .filter(mv => mv.selection === l.selection && new Date(mv.timestamp).getTime() <= new Date(m.timestamp).getTime())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return latest?.odds ?? l.currentOdds;
    });
    const selIdx = lines.findIndex(l => l.selection === selection);
    const novigAll = computeNovig(allOdds, selIdx);

    pts.push({
      t: formatTime(m.timestamp),
      odds: m.odds,
      novig: (novigAll as any)[novigMethod] ?? m.odds,
    });
  }

  return pts;
}

export function OddsSparkline({ eventId, selection, currentOdds, openingOdds }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { novigMethod } = useAlertStore();

  const { data: event } = useGetOddsDropById(eventId, {
    query: {
      queryKey: getGetOddsDropByIdQueryKey(eventId),
      staleTime: 15000,
      refetchInterval: 10000,
    },
  });

  const points = event
    ? buildPoints(event.movements, event.lines, selection, novigMethod)
    : [
        { t: "open", odds: openingOdds, novig: openingOdds },
        { t: "now", odds: currentOdds, novig: currentOdds },
      ];

  const isDrop = currentOdds < openingOdds;
  const hasHistory = points.length > 2;

  return (
    <>
      <div
        className="cursor-pointer group flex flex-col items-end gap-0.5"
        onClick={() => setModalOpen(true)}
        title="Click for full chart"
      >
        {/* Mini chart */}
        <div className="w-[90px] h-[38px] opacity-80 group-hover:opacity-100 transition-opacity rounded overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 3, right: 2, left: 2, bottom: 3 }}>
              <YAxis domain={["auto", "auto"]} hide />
              {/* No-vig line (red) */}
              {hasHistory && (
                <Line
                  type="stepAfter"
                  dataKey="novig"
                  stroke="#f87171"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              )}
              {/* Raw odds line (blue) */}
              <Line
                type="stepAfter"
                dataKey="odds"
                stroke={isDrop ? "#38bdf8" : "#94a3b8"}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Drop % label */}
        <div className={`text-[11px] font-mono font-bold tabular-nums leading-none ${isDrop ? "text-green-400" : "text-red-400"}`}>
          {isDrop ? "↓" : "↑"}{Math.abs(((currentOdds - openingOdds) / openingOdds) * 100).toFixed(1)}%
        </div>
      </div>

      {modalOpen && event && (
        <OddsGraphModal
          event={event}
          defaultSelection={selection}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
