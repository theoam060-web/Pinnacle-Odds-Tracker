import { logger } from "./logger";
import type { OddsDropEvent } from "./sseManager";

const TELEGRAM_BOT_TOKEN = process.env["TELEGRAM_BOT_TOKEN"];
const TELEGRAM_CHAT_ID = process.env["TELEGRAM_CHAT_ID"];

const BASE_URL = process.env["REPLIT_DEV_DOMAIN"]
  ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
  : process.env["PUBLIC_URL"] || "http://localhost";

export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

export function logTelegramStatus(): void {
  if (isTelegramConfigured()) {
    logger.info("Telegram notifications enabled");
  } else {
    logger.info(
      "Telegram notifications disabled — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to enable"
    );
  }
}

export async function sendTelegramDrop(drop: OddsDropEvent): Promise<void> {
  if (!isTelegramConfigured()) {
    return;
  }

  const directionEmoji = drop.direction === "drop" ? "📉" : "📈";
  const sign = drop.changePercent > 0 ? "+" : "";
  const eventUrl = `${BASE_URL}/event/${drop.eventId}`;

  const text =
    `${directionEmoji} *Odds Movement Detected*\n\n` +
    `🏆 ${drop.leagueName}\n` +
    `⚽ ${drop.homeTeam} vs ${drop.awayTeam}\n` +
    `📊 ${drop.selection}\n` +
    `🔢 ${drop.openingOdds.toFixed(2)} → ${drop.currentOdds.toFixed(2)}\n` +
    `📈 Change: ${sign}${drop.changePercent.toFixed(1)}%\n` +
    `🕐 ${new Date(drop.detectedAt).toLocaleTimeString()}\n\n` +
    `[View Event](${eventUrl})`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      logger.warn({ status: response.status, body }, "Telegram API error");
    }
  } catch (err) {
    logger.warn({ err }, "Failed to send Telegram notification");
  }
}
