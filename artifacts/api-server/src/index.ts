import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./lib/oddsGenerator";
import { startOddsPoller } from "./lib/oddsPoller";
import { startMockSimulator } from "./lib/mockSimulator";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const PINNACLE_API_KEY = process.env["PINNACLE_API_KEY"] ?? "";
const POLL_INTERVAL_MS = parseInt(process.env["POLL_INTERVAL_MS"] ?? "60000", 10);
const MIN_DROP_PERCENT = parseFloat(process.env["MIN_DROP_PERCENT"] ?? "2");

logger.info(
  { POLL_INTERVAL_MS, MIN_DROP_PERCENT, hasPinnacleKey: !!PINNACLE_API_KEY },
  "Server config",
);

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (PINNACLE_API_KEY) {
    logger.info("PINNACLE_API_KEY found — starting live odds poller");
    // Poller automatically falls back to mock data after repeated API failures
    startOddsPoller(PINNACLE_API_KEY, POLL_INTERVAL_MS, MIN_DROP_PERCENT);
  } else {
    logger.warn(
      "PINNACLE_API_KEY not set — falling back to mock data with live simulation. " +
      "Set PINNACLE_API_KEY to enable live Pinnacle odds.",
    );
    seedDatabase()
      .then(() => startMockSimulator(30000))
      .catch(err2 => logger.error({ err: err2 }, "Mock seed/simulator startup failed"));
  }
});
