import { useState } from "react";
import { Link } from "wouter";
import { useGetOddsDrops, getGetOddsDropsQueryKey, useGetSports, getGetSportsQueryKey, useGetLeaguesBySport, getGetLeaguesBySportQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OddsSummaryBar } from "@/components/odds-summary-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Minus, Search } from "lucide-react";
import { formatChange, formatOdds, formatTime } from "@/lib/format";

export default function FeedPage() {
  const [sport, setSport] = useState<string>("all");
  const [league, setLeague] = useState<string>("all");
  const [direction, setDirection] = useState<string>("all");

  const { data: sports } = useGetSports({ query: { queryKey: getGetSportsQueryKey() } });
  const { data: leagues } = useGetLeaguesBySport(sport, { 
    query: { 
      queryKey: getGetLeaguesBySportQueryKey(sport),
      enabled: sport !== "all" 
    } 
  });

  const params = {
    sport: sport === "all" ? undefined : sport,
    league: league === "all" ? undefined : league,
    direction: direction === "all" ? undefined : direction as any
  };

  const { data: events, isLoading } = useGetOddsDrops(params, {
    query: {
      queryKey: getGetOddsDropsQueryKey(params),
      refetchInterval: 15000,
    }
  });

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Live Market Feed</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Real-time stream of significant odds movements on Pinnacle. Automatically refreshes every 15 seconds.
        </p>
      </div>

      <OddsSummaryBar />

      <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-card border rounded-lg p-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="w-[180px]">
            <Select value={sport} onValueChange={(val) => { setSport(val); setLeague("all"); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports?.map(s => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.icon} {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-[200px]">
            <Select value={league} onValueChange={setLeague} disabled={sport === "all"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                {leagues?.map(l => (
                  <SelectItem key={l.slug} value={l.slug}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[150px]">
            <Select value={direction} onValueChange={setDirection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Movements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movements</SelectItem>
                <SelectItem value="drop">Drops Only</SelectItem>
                <SelectItem value="rise">Rises Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Time</TableHead>
              <TableHead>Event</TableHead>
              <TableHead className="w-[150px]">League</TableHead>
              <TableHead className="w-[120px]">Market</TableHead>
              <TableHead className="w-[120px] text-right">Selection</TableHead>
              <TableHead className="w-[100px] text-right">Open</TableHead>
              <TableHead className="w-[100px] text-right">Current</TableHead>
              <TableHead className="w-[100px] text-right">Move</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : events?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No significant movements found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              events?.map(event => {
                // Find biggest movement line to highlight
                const biggestLine = [...event.lines].sort((a, b) => 
                  Math.abs(b.changePercent) - Math.abs(a.changePercent)
                )[0];

                return (
                  <TableRow key={event.id} className="group hover:bg-muted/20 cursor-pointer">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatTime(event.commenceTime)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/event/${event.id}`}>
                        <div className="font-medium text-sm text-foreground hover:text-primary transition-colors">
                          {event.homeTeam} <span className="text-muted-foreground mx-1 text-xs">vs</span> {event.awayTeam}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal tracking-wide truncate max-w-[130px] inline-block align-bottom border-muted-foreground/20">
                        {event.leagueName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">
                      {event.marketType.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs">
                      {biggestLine.selection}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatOdds(biggestLine.openingOdds)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatOdds(biggestLine.currentOdds)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold flex items-center justify-end">
                      {biggestLine.direction === 'drop' && <ArrowDownRight className="w-3 h-3 mr-1 text-drop" />}
                      {biggestLine.direction === 'rise' && <ArrowUpRight className="w-3 h-3 mr-1 text-rise" />}
                      {biggestLine.direction === 'stable' && <Minus className="w-3 h-3 mr-1 text-muted-foreground" />}
                      <span className={
                        biggestLine.direction === 'drop' ? 'text-drop' :
                        biggestLine.direction === 'rise' ? 'text-rise' : 'text-muted-foreground'
                      }>
                        {formatChange(biggestLine.changePercent)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
