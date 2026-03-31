import type { Response } from "express";

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

type SSEClient = {
  id: string;
  res: Response;
};

const clients: Map<string, SSEClient> = new Map();

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
}

export function getClientCount(): number {
  return clients.size;
}
