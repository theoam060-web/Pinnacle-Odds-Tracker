/**
 * Pinnacle Market Coverage Test
 *
 * Fetches all sports, all matchups, and all markets from the guest API,
 * then reports coverage statistics to validate the adapter captures everything.
 *
 * Usage: pnpm --filter @workspace/scripts run pinnacle:coverage
 */
export {};

const APP_CONFIG_URL = "https://www.pinnacle.com/config/app.json";

interface SportCoverage {
  sportId: number;
  sportName: string;
  matchupCount: number;
  regularMatchups: number;
  specialMatchups: number;
  marketCount: number;
  marketTypes: Record<string, number>;
  periods: Record<number, number>;
  alternateCount: number;
  primaryCount: number;
  openCount: number;
  closedCount: number;
  uniqueMatchupsWithMarkets: number;
  fetchTimeMs: number;
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers: { ...headers, "Accept-Encoding": "gzip" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function main() {
  console.log("\n=== Pinnacle Market Coverage Test ===\n");

  // Discover config
  const config = await fetchJson(APP_CONFIG_URL, {});
  const apiKey = process.env.PINNACLE_API_KEY ?? config.api?.haywire?.apiKey;
  const guestRoot = config.api?.haywire?.routes?.curacao?.guestRoot ?? "https://guest.api.arcadia.pinnacle.com";
  const apiVersion = config.api?.haywire?.apiVersion ?? "0.1";
  const base = `${guestRoot}/${apiVersion}`;
  const headers = { "X-API-Key": apiKey, "X-Language": "en" };

  console.log(`Using: ${base} (key: ${apiKey?.slice(0, 8)}...)\n`);

  // Fetch all sports
  const sports = await fetchJson(`${base}/sports`, headers) as any[];
  const activeSports = sports.filter((s: any) => !s.isHidden && (s.matchupCount ?? 0) > 0);

  console.log(`Active sports: ${activeSports.length}\n`);

  const coverageResults: SportCoverage[] = [];
  let grandTotalMatchups = 0;
  let grandTotalMarkets = 0;

  // Limit to env or all
  const maxSports = Number(process.env.MAX_SPORTS) || activeSports.length;
  const targetSports = activeSports
    .sort((a, b) => (b.matchupCount ?? 0) - (a.matchupCount ?? 0))
    .slice(0, maxSports);

  for (const sport of targetSports) {
    const start = Date.now();
    console.log(`  Fetching ${sport.name} (id=${sport.id}, expected matchups=${sport.matchupCount})...`);

    try {
      const [matchups, markets] = await Promise.all([
        fetchJson(`${base}/sports/${sport.id}/matchups`, headers) as Promise<any[]>,
        fetchJson(`${base}/sports/${sport.id}/markets/straight?primaryOnly=false`, headers) as Promise<any[]>,
      ]);

      const fetchTimeMs = Date.now() - start;

      const regularMatchups = matchups.filter((m) => m.type === "matchup").length;
      const specialMatchups = matchups.filter((m) => m.type === "special").length;

      const marketTypes: Record<string, number> = {};
      const periods: Record<number, number> = {};
      let alternateCount = 0;
      let primaryCount = 0;
      let openCount = 0;
      let closedCount = 0;
      const matchupsWithMarkets = new Set<number>();

      for (const m of markets) {
        marketTypes[m.type] = (marketTypes[m.type] ?? 0) + 1;
        periods[m.period] = (periods[m.period] ?? 0) + 1;
        if (m.isAlternate) alternateCount++;
        else primaryCount++;
        if (m.status === "open") openCount++;
        else if (m.status === "closed") closedCount++;
        matchupsWithMarkets.add(m.matchupId);
      }

      const coverage: SportCoverage = {
        sportId: sport.id,
        sportName: sport.name,
        matchupCount: matchups.length,
        regularMatchups,
        specialMatchups,
        marketCount: markets.length,
        marketTypes,
        periods,
        alternateCount,
        primaryCount,
        openCount,
        closedCount,
        uniqueMatchupsWithMarkets: matchupsWithMarkets.size,
        fetchTimeMs,
      };

      coverageResults.push(coverage);
      grandTotalMatchups += matchups.length;
      grandTotalMarkets += markets.length;

      const typeStr = Object.entries(marketTypes).map(([k, v]) => `${k}=${v}`).join(" ");
      const periodStr = Object.entries(periods).map(([k, v]) => `p${k}=${v}`).join(" ");
      console.log(`    matchups: ${matchups.length} (regular=${regularMatchups}, special=${specialMatchups})`);
      console.log(`    markets: ${markets.length} (primary=${primaryCount}, alt=${alternateCount}, open=${openCount})`);
      console.log(`    types: ${typeStr}`);
      console.log(`    periods: ${periodStr}`);
      console.log(`    time: ${fetchTimeMs}ms\n`);
    } catch (err: any) {
      console.log(`    ERROR: ${err.message}\n`);
    }

    // Rate limit between sports
    if (targetSports.indexOf(sport) < targetSports.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Summary
  console.log("=== Coverage Summary ===\n");
  console.log(`Sports tested: ${coverageResults.length}`);
  console.log(`Grand total matchups: ${grandTotalMatchups}`);
  console.log(`Grand total markets: ${grandTotalMarkets}`);

  // Market type breakdown
  const allTypes: Record<string, number> = {};
  const allPeriods: Record<number, number> = {};
  for (const c of coverageResults) {
    for (const [k, v] of Object.entries(c.marketTypes)) {
      allTypes[k] = (allTypes[k] ?? 0) + v;
    }
    for (const [k, v] of Object.entries(c.periods)) {
      allPeriods[Number(k)] = (allPeriods[Number(k)] ?? 0) + v;
    }
  }

  console.log(`\nMarket types across all sports:`);
  for (const [type, count] of Object.entries(allTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }

  console.log(`\nPeriods across all sports:`);
  for (const [period, count] of Object.entries(allPeriods).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  period ${period}: ${count}`);
  }

  // Per-sport table
  console.log("\n=== Per-Sport Table ===\n");
  console.log("Sport".padEnd(25) + "Matchups".padStart(10) + "Markets".padStart(10) + "Primary".padStart(10) + "Alt".padStart(8) + "Open".padStart(8) + "Time(ms)".padStart(10));
  console.log("-".repeat(81));
  for (const c of coverageResults.sort((a, b) => b.marketCount - a.marketCount)) {
    console.log(
      c.sportName.padEnd(25) +
      String(c.matchupCount).padStart(10) +
      String(c.marketCount).padStart(10) +
      String(c.primaryCount).padStart(10) +
      String(c.alternateCount).padStart(8) +
      String(c.openCount).padStart(8) +
      String(c.fetchTimeMs).padStart(10),
    );
  }

  console.log("\nCoverage test complete.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
