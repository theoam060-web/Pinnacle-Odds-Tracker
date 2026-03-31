import { useEffect, useRef, useCallback } from "react";

export interface OddsDropEvent {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  direction: "drop" | "rise";
  detectedAt: string;
}

export interface OddsStreamFilters {
  sport?: string;
  league?: string;
  minDropPercent?: number;
  minOdds?: number;
  maxOdds?: number;
}

function matchesFilters(drop: OddsDropEvent, filters: OddsStreamFilters): boolean {
  if (filters.sport && filters.sport !== "all" && drop.sport !== filters.sport) return false;
  if (filters.league && filters.league !== "all" && drop.league !== filters.league) return false;
  if (filters.minDropPercent !== undefined && Math.abs(drop.changePercent) < filters.minDropPercent) return false;
  if (filters.minOdds !== undefined && drop.currentOdds < filters.minOdds) return false;
  if (filters.maxOdds !== undefined && drop.currentOdds > filters.maxOdds) return false;
  return true;
}

interface UseOddsStreamOptions {
  filters?: OddsStreamFilters;
  onDrop?: (drop: OddsDropEvent) => void;
}

export function useOddsStream({ filters = {}, onDrop }: UseOddsStreamOptions = {}) {
  const filtersRef = useRef(filters);
  const onDropRef = useRef(onDrop);

  useEffect(() => {
    filtersRef.current = filters;
  });

  useEffect(() => {
    onDropRef.current = onDrop;
  });

  const getStreamUrl = useCallback(() => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
    return `${base}/api/odds/stream`;
  }, []);

  useEffect(() => {
    const url = getStreamUrl();
    const es = new EventSource(url);

    es.addEventListener("newDrop", (e: MessageEvent) => {
      try {
        const drop: OddsDropEvent = JSON.parse(e.data);
        if (matchesFilters(drop, filtersRef.current)) {
          onDropRef.current?.(drop);
        }
      } catch {
      }
    });

    es.onerror = () => {
    };

    return () => {
      es.close();
    };
  }, [getStreamUrl]);
}
