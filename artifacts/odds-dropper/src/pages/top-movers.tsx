import { useGetTopMovers, getGetTopMoversQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Activity } from "lucide-react";
import { formatChange, formatOdds } from "@/lib/format";
import { Link } from "wouter";
import { LiveTimestamp } from "@/components/live-timestamp";

export default function TopMoversPage() {
  const { data: movers, isLoading } = useGetTopMovers({
    query: {
      queryKey: getGetTopMoversQueryKey(),
      refetchInterval: 60000
    }
  });

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Top Movers
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          The largest absolute odds movements detected in the last hour across all tracked markets.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted/20" />
              <CardContent className="h-32 bg-muted/10" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movers?.map(event => {
            const biggestLine = [...event.lines].sort((a, b) => 
              Math.abs(b.changePercent) - Math.abs(a.changePercent)
            )[0];

            const isDrop = biggestLine.direction === "drop";

            return (
              <Link key={event.id} href={`/event/${event.id}`} className="block h-full group">
                <Card className="h-full hover:border-primary/50 transition-colors bg-card hover:bg-card/80 overflow-hidden relative">
                  <div className={`absolute top-0 left-0 w-1 h-full ${isDrop ? 'bg-drop' : 'bg-rise'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {event.sport} • {event.leagueName}
                      </div>
                      <LiveTimestamp date={event.lastUpdated} prefix="Updated" />
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {event.homeTeam} <span className="text-muted-foreground font-normal text-sm mx-1">vs</span> {event.awayTeam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <div className="text-xs text-muted-foreground capitalize mb-1">
                          {event.marketType.replace('_', ' ')} • <span className="font-semibold text-foreground">{biggestLine.selection}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-muted-foreground line-through text-sm">
                            {formatOdds(biggestLine.openingOdds)}
                          </span>
                          <span className="font-mono text-2xl font-bold">
                            {formatOdds(biggestLine.currentOdds)}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center text-xl font-bold font-mono px-3 py-1 rounded ${
                        isDrop ? 'bg-drop/10 text-drop' : 'bg-rise/10 text-rise'
                      }`}>
                        {isDrop ? <ArrowDownRight className="w-5 h-5 mr-1" /> : <ArrowUpRight className="w-5 h-5 mr-1" />}
                        {formatChange(biggestLine.changePercent)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          
          {movers?.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed rounded-lg text-muted-foreground">
              No significant movements detected in the last hour.
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
