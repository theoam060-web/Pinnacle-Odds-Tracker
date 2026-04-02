import type { Response } from "express";
import type WebSocket from "ws";

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

export interface OddsEventUpdate {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  commenceTime: string;
  marketType: "moneyline" | "spread" | "total" | "asian_handicap";
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

export interface MarketUpdate {
  id: string;
  matchupId: number;
  marketKey: string;
  sport: string;
  league: string;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  type: string;
  period: number;
  isAlternate: boolean;
  status: string;
  prices: Array<{
    designation: string;
    points: number | null;
    americanPrice: number;
    decimalPrice: number;
  }>;
  biggestDrop: number;
  biggestRise: number;
  lastUpdated: string;
}

type SSEClient = {
  id: string;
  res: Response;
};

const clients: Map<string, SSEClient> = new Map();
const wsClients: Set<WebSocket> = new Set();

let clientCounter = 0;

export function registerSSEClient(res: Response): string {
  const id = `client-${++clientCounter}`;
  clients.set(id, { id, res });
  return id;
}

export function unregisterSSEClient(id: string): void {
  clients.delete(id);
}

export function broadcastOddsDrop(drop: OddsDropEvent): void {
  const data = JSON.stringify(drop);
  for (const [id, client] of clients) {
    try {
      client.res.write(`event: newDrop\ndata: ${data}\n\n`);
    } catch {
      clients.delete(id);
    }
  }
  broadcastWsMessage("newDrop", drop);
}

export function broadcastOddsUpdate(event: OddsEventUpdate): void {
  const data = JSON.stringify(event);
  for (const [id, client] of clients) {
    try {
      client.res.write(`event: oddsUpdate\ndata: ${data}\n\n`);
    } catch {
      clients.delete(id);
    }
  }
  broadcastWsMessage("oddsUpdate", event);
}

export function broadcastMarketUpdate(market: MarketUpdate): void {
  const data = JSON.stringify(market);
  for (const [id, client] of clients) {
    try {
      client.res.write(`event: marketUpdate\ndata: ${data}\n\n`);
    } catch {
      clients.delete(id);
    }
  }
  broadcastWsMessage("marketUpdate", market);
}

export function registerWsClient(ws: WebSocket): void {
  wsClients.add(ws);
}

export function unregisterWsClient(ws: WebSocket): void {
  wsClients.delete(ws);
}

function broadcastWsMessage(
  type: string,
  payload: unknown,
): void {
  if (wsClients.size === 0) return;
  const data = JSON.stringify({ type, payload });
  for (const ws of wsClients) {
    if (ws.readyState !== 1) {
      wsClients.delete(ws);
      continue;
    }
    try {
      ws.send(data);
    } catch {
      wsClients.delete(ws);
    }
  }
}

export function getClientCount(): number {
  return clients.size + wsClients.size;
}
