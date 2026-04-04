import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { formatOdds } from "@/lib/format";

interface Price {
  designation: string;
  decimalPrice: number;
  openingDecimalPrice: number;
  points: number | null;
  changePercent: number | null;
  direction: string | null;
}

interface Market {
  id: string;
  type: string;
  period: number;
  side: string | null;
  isAlternate: boolean;
  prices: Price[];
}

interface Matchup {
  id: number;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  sport: string;
  startTime: string;
}

interface MatchupResponse {
  matchup: Matchup;
  markets: Market[];
}

interface Props {
  matchupId: number;
  onClose: () => void;
}

const DESIGNATION_LABELS: Record<string, string> = {
  home: "Home",
  away: "Away",
  draw: "Draw",
  over: "Over",
  under: "Under",
};

function ChangeArrow({ direction, pct }: { direction: string | null; pct: number | null }) {
  if (pct == null || direction == null || direction === "stable" || Math.abs(pct) < 0.01) {
    return <span className="text-muted-foreground/50 text-[10px]">—</span>;
  }
  const isDrop = direction === "drop";
  const color = isDrop ? "text-green-400" : "text-red-400";
  const Icon = isDrop ? TrendingDown : TrendingUp;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${color}`}>
      <Icon className="w-2.5 h-2.5" />
      {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

function PriceCell({ price, label }: { price: Price; label?: string }) {
  const display = label ?? DESIGNATION_LABELS[price.designation] ?? price.designation;
  const isDrop = price.direction === "drop";
  const isRise = price.direction === "rise";
  const changed = isDrop || isRise;

  const pointsLabel =
    price.points != null ? (price.points > 0 ? `+${price.points}` : `${price.points}`) : null;

  const currentColor = isDrop
    ? "text-green-400"
    : isRise
    ? "text-red-400"
    : "text-white";

  return (
    <div className="bg-black/30 border border-white/5 rounded-md p-2 flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] text-muted-foreground font-medium truncate">
          {display}
          {pointsLabel && (
            <span className="ml-1 text-primary/70 font-mono">{pointsLabel}</span>
          )}
        </span>
        <ChangeArrow direction={price.direction} pct={price.changePercent} />
      </div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        {changed && (
          <span className="text-[11px] font-mono text-muted-foreground/50 line-through">
            {formatOdds(price.openingDecimalPrice)}
          </span>
        )}
        <span className={`text-sm font-bold font-mono ${currentColor}`}>
          {formatOdds(price.decimalPrice)}
        </span>
      </div>

      {!changed && (
        <div className="text-[10px] text-muted-foreground/50 font-mono">
          Open: {formatOdds(price.openingDecimalPrice)}
        </div>
      )}
    </div>
  );
}

type SectionDef = {
  key: string;
  label: string;
  filter: (m: Market) => boolean;
};

const SECTIONS: SectionDef[] = [
  {
    key: "ft_result",
    label: "Full Time Result",
    filter: m => m.type === "moneyline" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_result",
    label: "1st Half Result",
    filter: m => m.type === "moneyline" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "handicap",
    label: "Handicap",
    filter: m => m.type === "spread" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_handicap",
    label: "1st Half Handicap",
    filter: m => m.type === "spread" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "ou",
    label: "Over / Under Goals",
    filter: m => m.type === "total" && m.period === 0 && !m.isAlternate,
  },
  {
    key: "h1_ou",
    label: "1st Half Over / Under",
    filter: m => m.type === "total" && m.period === 1 && !m.isAlternate,
  },
  {
    key: "team_total_home",
    label: "Home Team Goals",
    filter: m => m.type === "team_total" && m.period === 0 && m.side === "home" && !m.isAlternate,
  },
  {
    key: "team_total_away",
    label: "Away Team Goals",
    filter: m => m.type === "team_total" && m.period === 0 && m.side === "away" && !m.isAlternate,
  },
];

function MarketSection({ label, markets, homeTeam, awayTeam }: {
  label: string;
  markets: Market[];
  homeTeam: string;
  awayTeam: string;
}) {
  if (markets.length === 0) return null;

  const allPricePairs: Array<{ price: Price; label?: string }> = markets.flatMap(market =>
    market.prices.map(price => ({
      price,
      label: resolveLabel(price.designation, homeTeam, awayTeam),
    }))
  );

  if (allPricePairs.length === 0) return null;

  const count = allPricePairs.length;
  const cols =
    count <= 2 ? "grid-cols-2" : count === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 px-0.5">
        {label}
      </div>
      <div className={`grid ${cols} gap-1.5`}>
        {allPricePairs.map(({ price, label: lbl }, i) => (
          <PriceCell key={i} price={price} label={lbl} />
        ))}
      </div>
    </div>
  );
}

function resolveLabel(designation: string, homeTeam: string, awayTeam: string): string {
  if (designation === "home") return homeTeam;
  if (designation === "away") return awayTeam;
  return DESIGNATION_LABELS[designation] ?? designation;
}

export function PinnacleOddsModal({ matchupId, onClose }: Props) {
  const { data, isLoading, isError } = useQuery<MatchupResponse>({
    queryKey: ["matchup", matchupId],
    queryFn: async () => {
      const res = await fetch(`/api/matchups/${matchupId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  });

  const sections = data
    ? SECTIONS.map(sec => ({
        ...sec,
        markets: data.markets.filter(sec.filter),
      })).filter(s => s.markets.length > 0)
    : [];

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="bg-[#0d1117] border-white/10 max-w-lg w-full max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-white/5 shrink-0">
          {data?.matchup ? (
            <>
              <DialogTitle className="text-sm font-bold leading-tight">
                {data.matchup.homeTeam}{" "}
                <span className="text-muted-foreground font-normal">vs.</span>{" "}
                {data.matchup.awayTeam}
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {data.matchup.leagueName} · Pinnacle Live Odds
              </p>
            </>
          ) : (
            <DialogTitle className="text-sm font-bold">Pinnacle Odds</DialogTitle>
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading markets…
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Could not load odds data.
            </div>
          )}

          {!isLoading && !isError && sections.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No data available.
            </div>
          )}

          {sections.map(sec => (
            <MarketSection
              key={sec.key}
              label={sec.label}
              markets={sec.markets}
              homeTeam={data?.matchup.homeTeam ?? "Home"}
              awayTeam={data?.matchup.awayTeam ?? "Away"}
            />
          ))}
        </div>

        <div className="shrink-0 px-4 py-2.5 border-t border-white/5 text-[10px] text-muted-foreground/50 text-right">
          Odds via Pinnacle · Refreshes every 15s
        </div>
      </DialogContent>
    </Dialog>
  );
}
