/**
 * Pinnacle API Smoke Test
 *
 * Validates that all guest endpoints are reachable, properly authenticated,
 * and return expected response shapes.
 *
 * Usage: pnpm --filter @workspace/scripts run pinnacle:smoke
 */
export {};

const APP_CONFIG_URL = "https://www.pinnacle.com/config/app.json";
const DEFAULT_GUEST_ROOT = "https://guest.api.arcadia.pinnacle.com";
const DEFAULT_API_VERSION = "0.1";

interface SmokeTestResult {
  name: string;
  status: "pass" | "fail";
  detail: string;
  durationMs: number;
}

const results: SmokeTestResult[] = [];

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const start = Date.now();
  const res = await fetch(url, { headers: { ...headers, "Accept-Encoding": "gzip" } });
  const durationMs = Date.now() - start;
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`);
  }
  const body = await res.json();
  return { body, durationMs, status: res.status };
}

async function test(name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const detail = await fn();
    results.push({ name, status: "pass", detail, durationMs: Date.now() - start });
    console.log(`  ✓ ${name}: ${detail}`);
  } catch (err: any) {
    results.push({ name, status: "fail", detail: err.message, durationMs: Date.now() - start });
    console.log(`  ✗ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log("\n=== Pinnacle API Smoke Test ===\n");

  // Step 1: Discover guest config
  let apiKey = process.env.PINNACLE_API_KEY ?? "";
  let guestRoot = DEFAULT_GUEST_ROOT;
  let apiVersion = DEFAULT_API_VERSION;

  await test("Fetch app.json config", async () => {
    const { body } = (await fetchJson(APP_CONFIG_URL)) as any;
    const key = body?.api?.haywire?.apiKey;
    const root = body?.api?.haywire?.routes?.curacao?.guestRoot;
    if (!key) throw new Error("No apiKey found in config");
    if (!apiKey) apiKey = key;
    if (root) guestRoot = root;
    apiVersion = body?.api?.haywire?.apiVersion ?? apiVersion;
    return `apiKey=${key.slice(0, 8)}..., guestRoot=${guestRoot}, version=${apiVersion}`;
  });

  const base = `${guestRoot}/${apiVersion}`;
  const headers = { "X-API-Key": apiKey, "X-Language": "en" };

  // Step 2: Test core endpoints
  await test("GET /sports", async () => {
    const { body, durationMs } = (await fetchJson(`${base}/sports`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    const active = body.filter((s: any) => (s.matchupCount ?? 0) > 0);
    return `${body.length} total sports, ${active.length} active (${durationMs}ms)`;
  });

  await test("GET /sports/live", async () => {
    const { body } = (await fetchJson(`${base}/sports/live`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} live sports`;
  });

  // Step 3: Test sport-level endpoints (soccer = 29)
  const sportId = 29;

  await test(`GET /sports/${sportId}/matchups (all)`, async () => {
    const { body, durationMs } = (await fetchJson(`${base}/sports/${sportId}/matchups`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    const types = new Map<string, number>();
    for (const m of body) {
      const t = m.type ?? "unknown";
      types.set(t, (types.get(t) ?? 0) + 1);
    }
    const typeSummary = [...types.entries()].map(([k, v]) => `${k}=${v}`).join(", ");
    return `${body.length} matchups (${typeSummary}) (${durationMs}ms)`;
  });

  await test(`GET /sports/${sportId}/matchups/highlighted`, async () => {
    const { body } = (await fetchJson(`${base}/sports/${sportId}/matchups/highlighted`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} highlighted matchups`;
  });

  await test(`GET /sports/${sportId}/matchups/live`, async () => {
    const { body } = (await fetchJson(`${base}/sports/${sportId}/matchups/live?withSpecials=false`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} live matchups`;
  });

  await test(`GET /sports/${sportId}/markets/straight (all)`, async () => {
    const { body, durationMs } = (await fetchJson(`${base}/sports/${sportId}/markets/straight?primaryOnly=false`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    const types = new Map<string, number>();
    const periods = new Map<number, number>();
    for (const m of body) {
      types.set(m.type, (types.get(m.type) ?? 0) + 1);
      periods.set(m.period, (periods.get(m.period) ?? 0) + 1);
    }
    const typeSummary = [...types.entries()].map(([k, v]) => `${k}=${v}`).join(", ");
    const periodSummary = [...periods.entries()].map(([k, v]) => `p${k}=${v}`).join(", ");
    return `${body.length} markets (${typeSummary}) periods(${periodSummary}) (${durationMs}ms)`;
  });

  await test(`GET /sports/${sportId}/leagues`, async () => {
    const { body } = (await fetchJson(`${base}/sports/${sportId}/leagues`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} leagues`;
  });

  // Step 4: Test smaller sport
  const smallSportId = 33; // Tennis
  await test(`GET /sports/${smallSportId}/matchups (Tennis)`, async () => {
    const { body } = (await fetchJson(`${base}/sports/${smallSportId}/matchups`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} matchups`;
  });

  await test(`GET /sports/${smallSportId}/markets/straight (Tennis)`, async () => {
    const { body } = (await fetchJson(`${base}/sports/${smallSportId}/markets/straight?primaryOnly=false`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `${body.length} markets`;
  });

  // Step 5: Test matchup-level endpoint
  await test("GET /matchups/{id}/markets/straight", async () => {
    const { body: matchups } = (await fetchJson(`${base}/sports/${sportId}/matchups/highlighted`, headers)) as any;
    const matchup = matchups.find((m: any) => m.type === "matchup");
    if (!matchup) throw new Error("No matchup found");
    const { body } = (await fetchJson(`${base}/matchups/${matchup.id}/markets/straight`, headers)) as any;
    if (!Array.isArray(body)) throw new Error("Expected array");
    return `matchup ${matchup.id}: ${body.length} markets`;
  });

  // Summary
  console.log("\n=== Summary ===");
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  console.log(`Passed: ${passed}, Failed: ${failed}, Total: ${results.length}`);

  if (failed > 0) {
    console.log("\nFailed tests:");
    for (const r of results.filter((r) => r.status === "fail")) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
    process.exit(1);
  }

  console.log("\nAll smoke tests passed.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
