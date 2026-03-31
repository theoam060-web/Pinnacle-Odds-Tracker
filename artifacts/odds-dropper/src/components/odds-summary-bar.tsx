import { useGetOddsSummary, getGetOddsSummaryQueryKey } from "@workspace/api-client-react";
import { Activity } from "lucide-react";

export function OddsSummaryBar() {
  const { data, isLoading } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 15000 }
  });

  return (
    <div className="flex items-center gap-3 mb-5 bg-card border rounded-lg px-5 py-3">
      <Activity className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm text-muted-foreground">Total events right now:</span>
      {isLoading || !data ? (
        <div className="w-8 h-5 bg-muted animate-pulse rounded" />
      ) : (
        <span className="text-xl font-mono font-bold text-foreground">{data.totalEvents.toLocaleString()}</span>
      )}
    </div>
  );
}
