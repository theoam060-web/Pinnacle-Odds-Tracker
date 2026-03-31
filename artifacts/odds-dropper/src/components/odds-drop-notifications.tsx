import { useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOddsStream, type OddsDropEvent, type OddsStreamFilters } from "@/hooks/use-odds-stream";
import { useDropAudio } from "@/hooks/use-drop-audio";
import { toast } from "@/hooks/use-toast";
import { formatChange, formatOdds } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface OddsDropNotificationsProps {
  filters?: OddsStreamFilters;
}

export function OddsDropNotifications({ filters }: OddsDropNotificationsProps) {
  const { muted, toggleMute, playDrop } = useDropAudio();

  const handleDrop = useCallback((drop: OddsDropEvent) => {
    playDrop();

    const isDown = drop.direction === "drop";
    const sign = drop.changePercent > 0 ? "+" : "";

    toast({
      title: (
        <span className="flex items-center gap-1.5 font-semibold text-sm">
          {isDown
            ? <ArrowDownRight className="w-4 h-4 text-drop shrink-0" />
            : <ArrowUpRight className="w-4 h-4 text-rise shrink-0" />}
          {drop.homeTeam} vs {drop.awayTeam}
        </span>
      ) as any,
      description: (
        <div className="text-xs mt-1 space-y-0.5">
          <div className="text-muted-foreground">{drop.leagueName} · {drop.selection}</div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted-foreground">{formatOdds(drop.openingOdds)}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">{formatOdds(drop.currentOdds)}</span>
            <span className={`font-bold ${isDown ? "text-drop" : "text-rise"}`}>
              {sign}{formatChange(drop.changePercent)}
            </span>
          </div>
        </div>
      ) as any,
      duration: 8000,
    });
  }, [playDrop]);

  useOddsStream({ filters, onDrop: handleDrop });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMute}
      title={muted ? "Unmute notifications" : "Mute notifications"}
      className="h-8 w-8"
    >
      {muted
        ? <VolumeX className="h-4 w-4 text-muted-foreground" />
        : <Volume2 className="h-4 w-4" />}
    </Button>
  );
}
