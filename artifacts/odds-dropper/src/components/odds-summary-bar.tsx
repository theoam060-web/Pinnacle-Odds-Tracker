import { useGetOddsSummary, getGetOddsSummaryQueryKey } from "@workspace/api-client-react";
import { LiveTimestamp } from "./live-timestamp";
import { TrendingDown, TrendingUp, Activity, BarChart3 } from "lucide-react";

export function OddsSummaryBar() {
  const { data, isLoading } = useGetOddsSummary({
    query: { queryKey: getGetOddsSummaryQueryKey(), refetchInterval: 15000 }
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-wrap gap-4 mb-6 animate-pulse">
        <div className="h-16 bg-card border rounded-md flex-1 min-w-[200px]" />
        <div className="h-16 bg-card border rounded-md flex-1 min-w-[200px]" />
        <div className="h-16 bg-card border rounded-md flex-1 min-w-[200px]" />
        <div className="h-16 bg-card border rounded-md flex-1 min-w-[200px]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border rounded-md p-4 flex flex-col justify-between">
        <div className="flex items-center text-muted-foreground mb-2">
          <Activity className="w-4 h-4 mr-2" />
          <span className="text-xs uppercase tracking-wider font-semibold">Tracked Events</span>
        </div>
        <div className="text-2xl font-mono font-bold text-foreground">
          {data.totalEvents.toLocaleString()}
        </div>
      </div>
      
      <div className="bg-card border rounded-md p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-drop rounded-bl-full opacity-50" />
        <div className="flex items-center text-muted-foreground mb-2">
          <TrendingDown className="w-4 h-4 mr-2 text-drop" />
          <span className="text-xs uppercase tracking-wider font-semibold">Total Drops</span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-mono font-bold text-foreground">{data.dropsCount.toLocaleString()}</div>
          <div className="text-xs text-drop font-mono font-medium">{data.avgDropPercent.toFixed(2)}% avg</div>
        </div>
      </div>

      <div className="bg-card border rounded-md p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute right-0 top-0 w-16 h-16 bg-rise rounded-bl-full opacity-50" />
        <div className="flex items-center text-muted-foreground mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-rise" />
          <span className="text-xs uppercase tracking-wider font-semibold">Total Rises</span>
        </div>
        <div className="text-2xl font-mono font-bold text-foreground">
          {data.risesCount.toLocaleString()}
        </div>
      </div>

      <div className="bg-card border rounded-md p-4 flex flex-col justify-between">
        <div className="flex items-center text-muted-foreground mb-2">
          <BarChart3 className="w-4 h-4 mr-2" />
          <span className="text-xs uppercase tracking-wider font-semibold">Last Updated</span>
        </div>
        <div className="text-lg font-mono font-medium text-foreground flex items-center h-full">
          <LiveTimestamp date={data.lastUpdated} />
        </div>
      </div>
    </div>
  );
}
