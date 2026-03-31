import { useState } from "react";
import { AreaChart, Area, Tooltip, ResponsiveContainer } from "recharts";
import { useGetOddsDropById, getGetOddsDropByIdQueryKey } from "@workspace/api-client-react";
import { formatOdds, formatTime } from "@/lib/format";
import { OddsGraphModal } from "./odds-graph-modal";

interface Props {
  eventId: string;
  selection: string;
  currentOdds: number;
  openingOdds: number;
}

interface ChartPoint {
  t: string;
  odds: number;
}

function buildPoints(
  movements: Array<{ timestamp: Date | string; odds: number; selection: string }>,
  selection: string,
  openingOdds: number,
): ChartPoint[] {
  const filtered = movements
    .filter(m => m.selection === selection)
    .map(m => ({ t: formatTime(m.timestamp), odds: m.odds }))
    .sort((a, b) => a.t.localeCompare(b.t));

  if (filtered.length === 0) {
    return [{ t: "open", odds: openingOdds }];
  }

  return [{ t: "open", odds: openingOdds }, ...filtered];
}

export function OddsSparkline({ eventId, selection, currentOdds, openingOdds }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: event } = useGetOddsDropById(eventId, {
    query: {
      queryKey: getGetOddsDropByIdQueryKey(eventId),
      staleTime: 30000,
    },
  });

  const points = event
    ? buildPoints(event.movements, selection, openingOdds)
    : [{ t: "open", odds: openingOdds }, { t: "now", odds: currentOdds }];

  const isDrop = currentOdds < openingOdds;

  return (
    <>
      <div
        className="cursor-pointer group"
        onClick={() => setModalOpen(true)}
        title="Click to see full chart"
      >
        <div className="w-full h-8 opacity-80 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height={32}>
            <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id={`grad-${eventId}-${selection}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDrop ? "#22c55e" : "#f87171"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDrop ? "#22c55e" : "#f87171"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="odds"
                stroke={isDrop ? "#22c55e" : "#f87171"}
                strokeWidth={1.5}
                fill={`url(#grad-${eventId}-${selection})`}
                dot={false}
                activeDot={{ r: 3 }}
                isAnimationActive={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-popover border border-border rounded px-2 py-1 text-[10px] font-mono shadow-md">
                      {payload[0].payload.t} · {formatOdds(payload[0].value as number)}
                    </div>
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
