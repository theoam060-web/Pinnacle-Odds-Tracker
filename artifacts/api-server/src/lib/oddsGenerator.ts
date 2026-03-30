import { db, oddsEventsTable, oddsMovementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

interface OddsLine {
  selection: string;
  openingOdds: number;
  currentOdds: number;
  changePercent: number;
  changeAbsolute: number;
  direction: "drop" | "rise" | "stable";
}

interface EventSeed {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  leagueName: string;
  commenceTime: Date;
  marketType: "moneyline" | "spread" | "total" | "asian_handicap";
  lines: OddsLine[];
}

function calcChange(opening: number, current: number): OddsLine["direction"] {
  const diff = current - opening;
  if (Math.abs(diff) < 0.005) return "stable";
  return diff < 0 ? "drop" : "rise";
}

function makeLine(selection: string, opening: number, current: number): OddsLine {
  const changeAbsolute = parseFloat((current - opening).toFixed(3));
  const changePercent = parseFloat(((changeAbsolute / opening) * 100).toFixed(2));
  return {
    selection,
    openingOdds: opening,
    currentOdds: current,
    changePercent,
    changeAbsolute,
    direction: calcChange(opening, current),
  };
}

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3600 * 1000);
}

export const seedEvents: EventSeed[] = [
  {
    id: "evt-001",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    sport: "soccer",
    league: "premier_league",
    leagueName: "Premier League",
    commenceTime: hoursFromNow(3),
    marketType: "moneyline",
    lines: [
      makeLine("Manchester City", 1.95, 1.68),
      makeLine("Draw", 3.8, 3.95),
      makeLine("Liverpool", 4.2, 4.85),
    ],
  },
  {
    id: "evt-002",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    sport: "soccer",
    league: "la_liga",
    leagueName: "La Liga",
    commenceTime: hoursFromNow(5),
    marketType: "moneyline",
    lines: [
      makeLine("Real Madrid", 2.1, 1.88),
      makeLine("Draw", 3.5, 3.7),
      makeLine("Barcelona", 3.6, 4.1),
    ],
  },
  {
    id: "evt-003",
    homeTeam: "LA Lakers",
    awayTeam: "Boston Celtics",
    sport: "basketball",
    league: "nba",
    leagueName: "NBA",
    commenceTime: hoursFromNow(6),
    marketType: "spread",
    lines: [
      makeLine("LA Lakers -4.5", 1.92, 1.85),
      makeLine("Boston Celtics +4.5", 1.92, 1.99),
    ],
  },
  {
    id: "evt-004",
    homeTeam: "Golden State Warriors",
    awayTeam: "Miami Heat",
    sport: "basketball",
    league: "nba",
    leagueName: "NBA",
    commenceTime: hoursFromNow(8),
    marketType: "total",
    lines: [
      makeLine("Over 224.5", 1.95, 1.78),
      makeLine("Under 224.5", 1.95, 2.15),
    ],
  },
  {
    id: "evt-005",
    homeTeam: "Bayern Munich",
    awayTeam: "Dortmund",
    sport: "soccer",
    league: "bundesliga",
    leagueName: "Bundesliga",
    commenceTime: hoursFromNow(4),
    marketType: "moneyline",
    lines: [
      makeLine("Bayern Munich", 1.55, 1.41),
      makeLine("Draw", 4.5, 4.9),
      makeLine("Dortmund", 6.0, 7.2),
    ],
  },
  {
    id: "evt-006",
    homeTeam: "Novak Djokovic",
    awayTeam: "Carlos Alcaraz",
    sport: "tennis",
    league: "atp",
    leagueName: "ATP Tour",
    commenceTime: hoursFromNow(2),
    marketType: "moneyline",
    lines: [
      makeLine("Djokovic", 1.72, 1.61),
      makeLine("Alcaraz", 2.15, 2.35),
    ],
  },
  {
    id: "evt-007",
    homeTeam: "Toronto Maple Leafs",
    awayTeam: "Boston Bruins",
    sport: "hockey",
    league: "nhl",
    leagueName: "NHL",
    commenceTime: hoursFromNow(7),
    marketType: "moneyline",
    lines: [
      makeLine("Toronto Maple Leafs", 2.25, 2.0),
      makeLine("Boston Bruins", 1.72, 1.9),
    ],
  },
  {
    id: "evt-008",
    homeTeam: "Juventus",
    awayTeam: "Inter Milan",
    sport: "soccer",
    league: "serie_a",
    leagueName: "Serie A",
    commenceTime: hoursFromNow(9),
    marketType: "asian_handicap",
    lines: [
      makeLine("Juventus -0.25", 1.89, 2.1),
      makeLine("Inter Milan +0.25", 2.0, 1.8),
    ],
  },
  {
    id: "evt-009",
    homeTeam: "New York Yankees",
    awayTeam: "Los Angeles Dodgers",
    sport: "baseball",
    league: "mlb",
    leagueName: "MLB",
    commenceTime: hoursFromNow(10),
    marketType: "moneyline",
    lines: [
      makeLine("New York Yankees", 2.1, 1.88),
      makeLine("Los Angeles Dodgers", 1.85, 2.05),
    ],
  },
  {
    id: "evt-010",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    sport: "soccer",
    league: "ligue_1",
    leagueName: "Ligue 1",
    commenceTime: hoursFromNow(6),
    marketType: "moneyline",
    lines: [
      makeLine("PSG", 1.42, 1.35),
      makeLine("Draw", 4.8, 5.1),
      makeLine("Marseille", 7.5, 8.5),
    ],
  },
  {
    id: "evt-011",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    sport: "soccer",
    league: "premier_league",
    leagueName: "Premier League",
    commenceTime: hoursFromNow(12),
    marketType: "spread",
    lines: [
      makeLine("Arsenal -1", 2.05, 2.35),
      makeLine("Chelsea +1", 1.88, 1.65),
    ],
  },
  {
    id: "evt-012",
    homeTeam: "Milwaukee Bucks",
    awayTeam: "Philadelphia 76ers",
    sport: "basketball",
    league: "nba",
    leagueName: "NBA",
    commenceTime: hoursFromNow(9),
    marketType: "moneyline",
    lines: [
      makeLine("Milwaukee Bucks", 1.65, 1.72),
      makeLine("Philadelphia 76ers", 2.4, 2.2),
    ],
  },
  {
    id: "evt-013",
    homeTeam: "Atletico Madrid",
    awayTeam: "Sevilla",
    sport: "soccer",
    league: "la_liga",
    leagueName: "La Liga",
    commenceTime: hoursFromNow(4),
    marketType: "total",
    lines: [
      makeLine("Over 2.5", 1.75, 1.95),
      makeLine("Under 2.5", 2.15, 1.92),
    ],
  },
  {
    id: "evt-014",
    homeTeam: "Kansas City Chiefs",
    awayTeam: "San Francisco 49ers",
    sport: "american_football",
    league: "nfl",
    leagueName: "NFL",
    commenceTime: hoursFromNow(15),
    marketType: "spread",
    lines: [
      makeLine("Chiefs -3", 1.91, 1.78),
      makeLine("49ers +3", 1.91, 2.08),
    ],
  },
  {
    id: "evt-015",
    homeTeam: "Iga Swiatek",
    awayTeam: "Aryna Sabalenka",
    sport: "tennis",
    league: "wta",
    leagueName: "WTA Tour",
    commenceTime: hoursFromNow(1),
    marketType: "moneyline",
    lines: [
      makeLine("Swiatek", 1.55, 1.44),
      makeLine("Sabalenka", 2.5, 2.75),
    ],
  },
  {
    id: "evt-016",
    homeTeam: "Napoli",
    awayTeam: "AC Milan",
    sport: "soccer",
    league: "serie_a",
    leagueName: "Serie A",
    commenceTime: hoursFromNow(11),
    marketType: "moneyline",
    lines: [
      makeLine("Napoli", 2.55, 2.75),
      makeLine("Draw", 3.3, 3.2),
      makeLine("AC Milan", 2.7, 2.5),
    ],
  },
];

function getBiggestDrop(lines: OddsLine[]): number {
  const drops = lines.filter(l => l.direction === "drop").map(l => l.changePercent);
  return drops.length ? Math.min(...drops) : 0;
}

function getBiggestRise(lines: OddsLine[]): number {
  const rises = lines.filter(l => l.direction === "rise").map(l => l.changePercent);
  return rises.length ? Math.max(...rises) : 0;
}

export async function seedDatabase(): Promise<void> {
  try {
    for (const event of seedEvents) {
      const biggestDrop = getBiggestDrop(event.lines);
      const biggestRise = getBiggestRise(event.lines);

      await db
        .insert(oddsEventsTable)
        .values({
          id: event.id,
          homeTeam: event.homeTeam,
          awayTeam: event.awayTeam,
          sport: event.sport,
          league: event.league,
          leagueName: event.leagueName,
          commenceTime: event.commenceTime,
          marketType: event.marketType,
          lines: event.lines,
          biggestDrop,
          biggestRise,
          lastUpdated: new Date(),
        })
        .onConflictDoNothing();

      const baseTime = Date.now() - 3 * 3600 * 1000;
      for (const line of event.lines) {
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
          const t = baseTime + (i / steps) * 3 * 3600 * 1000;
          const progress = i / steps;
          const interpolated = line.openingOdds + (line.currentOdds - line.openingOdds) * progress;
          const jitter = (Math.random() - 0.5) * 0.02;
          const snappedOdds = parseFloat((interpolated + jitter).toFixed(3));

          await db
            .insert(oddsMovementsTable)
            .values({
              eventId: event.id,
              selection: line.selection,
              odds: snappedOdds,
              recordedAt: new Date(t),
            })
            .onConflictDoNothing();
        }
      }
    }
    logger.info("Database seeded with odds events");
  } catch (err) {
    logger.error({ err }, "Failed to seed database");
  }
}

export function formatEventForApi(row: typeof oddsEventsTable.$inferSelect) {
  const lines = row.lines as OddsLine[];
  return {
    id: row.id,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    sport: row.sport,
    league: row.league,
    leagueName: row.leagueName,
    commenceTime: row.commenceTime.toISOString(),
    marketType: row.marketType,
    lines,
    biggestDrop: row.biggestDrop,
    biggestRise: row.biggestRise,
    lastUpdated: row.lastUpdated.toISOString(),
  };
}
