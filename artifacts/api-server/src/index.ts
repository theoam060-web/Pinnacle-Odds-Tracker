import app from "./app.js";
import { logger } from "./lib/logger.js";
import { startOddsPoller } from "./lib/oddsPoller.js";
import { logTelegramStatus } from "./lib/telegramNotifier.js";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { registerWsClient, unregisterWsClient } from "./lib/sseManager.js";
import type WebSocket from "ws";
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

const PINNACLE_API_KEY = process.env["PINNACLE_API_KEY"] ?? "";
const POLL_INTERVAL_MS = parseInt(process.env["POLL_INTERVAL_MS"] ?? "60000", 10);
const MIN_DROP_PERCENT = parseFloat(process.env["MIN_DROP_PERCENT"] ?? "2");
const ENABLE_WS = process.env["ENABLE_WS"] !== "false";

logger.info({ POLL_INTERVAL_MS, MIN_DROP_PERCENT, hasPinnacleKey: !!PINNACLE_API_KEY, wsEnabled: ENABLE_WS }, "Server config");

async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set — skipping Stripe init");
    return;
  }
  try {
    logger.info("Running Stripe schema migrations…");
    await runMigrations({ databaseUrl });

    logger.info("Initialising StripeSync…");
    const sync = await getStripeSync();

    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (domain) {
      const webhookUrl = `https://${domain}/api/stripe/webhook`;
      logger.info({ webhookUrl }, "Setting up managed Stripe webhook…");
      await sync.findOrCreateManagedWebhook(webhookUrl);
    } else {
      logger.warn("REPLIT_DOMAINS not set — skipping webhook setup");
    }

    logger.info("Syncing Stripe data…");
    await sync.syncBackfill();
    logger.info("Stripe init complete.");
  } catch (err) {
    logger.error({ err }, "Stripe init failed — continuing without Stripe");
  }
}

const server = createServer(app);
let wsServer: WebSocketServer | null = null;

if (ENABLE_WS) {
  wsServer = new WebSocketServer({ server, path: "/api/odds/ws" });
  wsServer.on("connection", (socket: WebSocket) => {
    registerWsClient(socket);
    socket.send(JSON.stringify({ type: "connected", payload: { transport: "websocket" } }));
    socket.on("close", () => unregisterWsClient(socket));
  });
}

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening");
  logTelegramStatus();
  if (ENABLE_WS) logger.info("WebSocket subscriptions available at /api/odds/ws");
  else logger.warn("WebSocket subscriptions disabled (ENABLE_WS=false)");

  startOddsPoller(PINNACLE_API_KEY, POLL_INTERVAL_MS, MIN_DROP_PERCENT);

  if (!PINNACLE_API_KEY) {
    logger.info("PINNACLE_API_KEY override not set — using auto-discovered guest key.");
  }

  void initStripe();
});
