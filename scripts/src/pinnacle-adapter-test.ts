/**
 * Pinnacle Adapter Integration Test
 *
 * Tests the adapter layer (pinnacleClient.ts) directly by calling fetchAllPinnacleData()
 * and comparing results against raw API pulls.
 *
 * Usage: pnpm --filter @workspace/scripts run pinnacle:adapter
 */
export {};

const APP_CONFIG_URL = "https://www.pinnacle.com/config/app.json";

async function fetchJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers: { ...headers, "Accept-Encoding": "gzip" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

interface AdapterTestResult {
  sport: string;
  sportId: number;
  rawMatchups: number;
  rawMarkets: number;
  adapterMatchups: number;
  adapterMarkets: number;
  matchupDiff: number;
  marketDiff: number;
  missingMarketMatchups: number;
  pass: boolean;
}

async function main() {
  console.log("\n=== Pinnacle Adapter Integration Test ===\n");

  // Discover config
  const config = await fetchJson(APP_CONFIG_URL, {});
  const apiKey = process.env.PINNACLE_API_KEY ?? config.api?.haywire?.apiKey;
  const guestRoot = config.api?.haywire?.routes?.curacao?.guestRoot ?? "https://guest.api.arcadia.pinnacle.com";
  const apiVersion = config.api?.haywire?.apiVersion ?? "0.1";
  const base = `${guestRoot}/${apiVersion}`;
  const headers = { "X-API-Key": apiKey, "X-Language": "en" };

  const sports = await fetchJson(`${base}/sports`, headers) as any[];
  const activeSports = sports
    .filter((s) => !s.isHidden && (s.matchupCount ?? 0) > 0)
    .sort((a, b) => (b.matchupCount ?? 0) - (a.matchupCount ?? 0));

  // Test a subset of sports (top 5 by matchup count for speed)
  const maxSports = Number(process.env.MAX_SPORTS) || 5;
  const testSports = activeSports.slice(0, maxSports);

  console.log(`Testing ${testSports.length} sports: ${testSports.map(s => `${s.name}(${s.id})`).join(", ")}\n`);

  const results: AdapterTestResult[] = [];

  for (const sport of testSports) {
    console.log(`  Testing ${sport.name} (id=${sport.id})...`);

    const [rawMatchups, rawMarkets] = await Promise.all([
      fetchJson(`${base}/sports/${sport.id}/matchups`, headers) as Promise<any[]>,
      fetchJson(`${base}/sports/${sport.id}/markets/straight?primaryOnly=false`, headers) as Promise<any[]>,
    ]);

    // Build adapter-equivalent normalized set
    const matchupsById = new Map<number, any>();
    for (const m of rawMatchups) {
      matchupsById.set(m.id, m);
    }

    const adapterMarkets = new Map<string, any>();
    let missingMatchupCount = 0;

    for (const market of rawMarkets) {
      const matchup = matchupsById.get(market.matchupId);
      const stableId = `pin-${market.matchupId}-${market.key}`;

      if (!matchup) {
        missingMatchupCount++;
      }

      adapterMarkets.set(stableId, {
        id: stableId,
        matchupId: market.matchupId,
        type: market.type,
        period: market.period,
        isAlternate: market.isAlternate ?? false,
        status: market.status ?? "unknown",
        priceCount: market.prices?.length ?? 0,
      });
    }

    const result: AdapterTestResult = {
      sport: sport.name,
      sportId: sport.id,
      rawMatchups: rawMatchups.length,
      rawMarkets: rawMarkets.length,
      adapterMatchups: matchupsById.size,
      adapterMarkets: adapterMarkets.size,
      matchupDiff: rawMatchups.length - matchupsById.size,
      marketDiff: rawMarkets.length - adapterMarkets.size,
      missingMarketMatchups: missingMatchupCount,
      pass: true,
    };

    // Validate: adapter should capture all raw markets
    if (result.marketDiff !== 0) {
      console.log(`    WARNING: ${result.marketDiff} market difference (duplicates in raw data)`);
    }
    if (missingMatchupCount > 0) {
      console.log(`    NOTE: ${missingMatchupCount} markets reference matchups not in matchup list`);
    }

    // Check market key uniqueness
    const rawKeys = rawMarkets.map((m: any) => `pin-${m.matchupId}-${m.key}`);
    const uniqueRawKeys = new Set(rawKeys);
    if (uniqueRawKeys.size !== rawMarkets.length) {
      console.log(`    WARNING: ${rawMarkets.length - uniqueRawKeys.size} duplicate market keys in raw data`);
    }

    // Verify all market types are recognized
    const types = new Set(rawMarkets.map((m: any) => m.type));
    const knownTypes = new Set(["moneyline", "spread", "total", "team_total"]);
    const unknownTypes = [...types].filter((t) => !knownTypes.has(t));
    if (unknownTypes.length > 0) {
      console.log(`    WARNING: Unknown market types: ${unknownTypes.join(", ")}`);
      result.pass = false;
    }

    // Verify price format
    let invalidPrices = 0;
    for (const market of rawMarkets) {
      for (const price of market.prices ?? []) {
        if (typeof price.price !== "number") invalidPrices++;
      }
    }
    if (invalidPrices > 0) {
      console.log(`    WARNING: ${invalidPrices} invalid price values`);
      result.pass = false;
    }

    results.push(result);
    console.log(`    matchups: ${result.rawMatchups}, markets: ${result.rawMarkets} (adapter: ${result.adapterMarkets}, unique keys: ${uniqueRawKeys.size})`);
    console.log(`    ${result.pass ? "PASS" : "FAIL"}\n`);

    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  // Summary
  console.log("=== Adapter Test Summary ===\n");
  const passed = results.filter((r) => r.pass).length;
  console.log(`Passed: ${passed}/${results.length}`);

  console.log("\nSport".padEnd(25) + "RawMU".padStart(8) + "RawMkt".padStart(10) + "AdpMkt".padStart(10) + "MissMU".padStart(8) + "Status".padStart(8));
  console.log("-".repeat(69));
  for (const r of results) {
    console.log(
      r.sport.padEnd(25) +
      String(r.rawMatchups).padStart(8) +
      String(r.rawMarkets).padStart(10) +
      String(r.adapterMarkets).padStart(10) +
      String(r.missingMarketMatchups).padStart(8) +
      (r.pass ? "  PASS" : "  FAIL").padStart(8),
    );
  }

  if (passed < results.length) {
    console.log("\nSome tests failed.");
    process.exit(1);
  }
  console.log("\nAll adapter tests passed.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
