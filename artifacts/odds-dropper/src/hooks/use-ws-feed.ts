import { useEffect, useRef } from "react";

export interface WsOddsEventUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  commenceTime: string;
  marketType: string;
  lines: Array<{
    selection: string;
    openingOdds: number;
    currentOdds: number;
    changePercent: number;
    changeAbsolute: number;
    direction: "drop" | "rise" | "stable";
  }>;
  biggestDrop: number;
  biggestRise: number;
  newDropAt: string | null;
  lastUpdated: string;
}

export interface WsOddsDropEvent {
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

interface UseWsFeedOptions {
  onOddsUpdate?: (event: WsOddsEventUpdate) => void;
  onNewDrop?: (drop: WsOddsDropEvent) => void;
}

export function useWsFeed({ onOddsUpdate, onNewDrop }: UseWsFeedOptions = {}) {
  const onOddsUpdateRef = useRef(onOddsUpdate);
  const onNewDropRef = useRef(onNewDrop);

  useEffect(() => { onOddsUpdateRef.current = onOddsUpdate; });
  useEffect(() => { onNewDropRef.current = onNewDrop; });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const prefix = (import.meta.env.BASE_URL ?? "").replace(/\/$/, "");
      const url = `${proto}//${location.host}${prefix}/api/odds/ws`;

      ws = new WebSocket(url);

      ws.onopen = () => {
        reconnectDelay = 1000;
      };

      ws.onmessage = (e: MessageEvent) => {
        try {
          const msg = JSON.parse(e.data as string) as { type: string; payload: unknown };
          if (msg.type === "oddsUpdate") {
            onOddsUpdateRef.current?.(msg.payload as WsOddsEventUpdate);
          } else if (msg.type === "newDrop") {
            onNewDropRef.current?.(msg.payload as WsOddsDropEvent);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (destroyed) return;
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer !== null) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);
}
