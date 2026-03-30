import { useRoute } from "wouter";
import { useGetOddsDropById, getGetOddsDropByIdQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatChange, formatOdds, formatTime, formatDate } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Minus, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function EventDetailPage() {
  const [match, params] = useRoute("/event/:id");
  const id = params?.id;

  const { data: event, isLoading } = useGetOddsDropById(id || "", {
    query: {
      queryKey: getGetOddsDropByIdQueryKey(id || ""),
      enabled: !!id
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-card w-1/3 rounded"></div>
          <div className="h-64 bg-card rounded"></div>
          <div className="h-48 bg-card rounded"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Event not found.</div>
      </Layout>
    );
  }

  // Format data for Recharts
  const chartData = event.movements.reduce((acc: any[], move) => {
    const timeStr = formatTime(move.timestamp);
    let entry = acc.find(item => item.time === timeStr);
    if (!entry) {
      entry = { time: timeStr, fullTime: move.timestamp };
      acc.push(entry);
    }
    entry[move.selection] = move.odds;
    return acc;
  }, []).sort((a, b) => new Date(a.fullTime).getTime() - new Date(b.fullTime).getTime());

  const colors = ["#ffb020", "#22d3ee", "#f87171", "#4ade80"];

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to feed
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{event.sport.toUpperCase()}</Badge>
              <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground">{event.leagueName}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {event.homeTeam} <span className="text-muted-foreground mx-2 text-xl font-normal">vs</span> {event.awayTeam}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Commences: {formatDate(event.commenceTime)} at {formatTime(event.commenceTime)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Market</div>
            <div className="text-xl font-semibold capitalize bg-card border px-4 py-2 rounded-md inline-block">
              {event.marketType.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Odds Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={formatOdds}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '6px' }}
                      itemStyle={{ fontFamily: 'var(--font-mono)' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    {event.lines.map((line, idx) => (
                      <Line
                        key={line.selection}
                        type="stepAfter"
                        dataKey={line.selection}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Current Lines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.lines.map(line => (
                <div key={line.selection} className="p-4 border rounded-md bg-background/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">{line.selection}</span>
                    <Badge variant="outline" className={`
                      ${line.direction === 'drop' ? 'text-drop border-drop/30 bg-drop' : ''}
                      ${line.direction === 'rise' ? 'text-rise border-rise/30 bg-rise' : ''}
                      ${line.direction === 'stable' ? 'text-muted-foreground' : ''}
                    `}>
                      {line.direction === 'drop' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {line.direction === 'rise' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {line.direction === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                      {formatChange(line.changePercent)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Open</div>
                      <div className="font-mono text-sm">{formatOdds(line.openingOdds)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current</div>
                      <div className="font-mono text-lg font-bold">{formatOdds(line.currentOdds)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
