import app from "./app";
import { logger } from "./lib/logger";
import { startOddsPoller } from "./lib/oddsPoller";
import { logTelegramStatus } from "./lib/telegramNotifier";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { registerWsClient, unregisterWsClient } from "./lib/sseManager";
import type WebSocket from "ws";

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
const ENABLE_WS = process.env["ENABLE_WS"] !== "false";

logger.info(
  { POLL_INTERVAL_MS, MIN_DROP_PERCENT, hasPinnacleKeyOverride: !!PINNACLE_API_KEY, wsEnabled: ENABLE_WS },
  "Server config",
);

const server = createServer(app);
let wsServer: WebSocketServer | null = null;

if (ENABLE_WS) {
  wsServer = new WebSocketServer({ server, path: "/api/odds/ws" });
  wsServer.on("connection", (socket: WebSocket) => {
    registerWsClient(socket);
    socket.send(JSON.stringify({ type: "connected", payload: { transport: "websocket" } }));
    socket.on("close", () => {
      unregisterWsClient(socket);
    });
  });
}

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening");
  logTelegramStatus();
  if (ENABLE_WS) {
    logger.info("WebSocket subscriptions available at /api/odds/ws");
  } else {
    logger.warn("WebSocket subscriptions are disabled via ENABLE_WS=false");
  }

  // Poller auto-discovers the Arcadia guest key from Pinnacle frontend config.
  // If both discovery and requests fail consistently, we fallback to mock data.
  startOddsPoller(PINNACLE_API_KEY, POLL_INTERVAL_MS, MIN_DROP_PERCENT);

  if (!PINNACLE_API_KEY) {
    logger.info(
      "PINNACLE_API_KEY override not set — using auto-discovered guest key from Pinnacle app config.",
    );
  }
});
