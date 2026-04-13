import { useQuery } from "@tanstack/react-query";
import { getOddsDropById } from "@workspace/api-client-react";
import { OddsGraphModal } from "@/components/odds-graph-modal";

interface Props {
  eventId: string;
  defaultSelection: string;
  onClose: () => void;
}

export function EventGraphModal({ eventId, defaultSelection, onClose }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["odds-drop-by-id", eventId],
    queryFn: () => getOddsDropById(eventId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading chart…</span>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-card border border-border rounded-lg p-6 max-w-sm text-center">
          <p className="text-sm text-muted-foreground">Could not load event data.</p>
          <button className="mt-3 text-xs text-primary underline" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const event = {
    id: data.id,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    leagueName: data.leagueName,
    sport: data.sport,
    commenceTime: data.commenceTime,
    marketType: data.marketType,
    lines: (data.lines as Array<{
      selection: string;
      openingOdds: number;
      currentOdds: number;
      changePercent: number;
    }>).map(l => ({
      selection: l.selection,
      openingOdds: l.openingOdds,
      currentOdds: l.currentOdds,
      changePercent: l.changePercent,
    })),
    movements: ((data as any).movements ?? []).map((m: {
      timestamp: string;
      odds: number;
      selection: string;
      limit?: number | null;
    }) => ({
      timestamp: m.timestamp,
      odds: m.odds,
      selection: m.selection,
      limit: m.limit ?? null,
    })),
  };

  return (
    <OddsGraphModal
      event={event}
      defaultSelection={defaultSelection}
      onClose={onClose}
    />
  );
}
