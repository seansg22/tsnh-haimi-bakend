import axios from "axios";
import type { Config } from "./config.js";
import type { SendResult } from "./types.js";

export async function sendToTelegram(
  messages: string[],
  config: Config
): Promise<SendResult> {
  console.log("\n--- Generated message ---");
  for (const [i, msg] of messages.entries()) {
    if (messages.length > 1) console.log(`\n[Part ${i + 1}/${messages.length}]`);
    console.log(msg);
  }
  console.log("--- END ---\n");

  if (!config.ENABLE_TELEGRAM_SEND) {
    console.log("ENABLE_TELEGRAM_SEND=false — message not sent to Telegram.");
    return { status: "dry_run", messageCount: messages.length };
  }

  const token = config.TELEGRAM_BOT_TOKEN!;
  const chatId = config.TELEGRAM_CHAT_ID!;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    for (const [i, text] of messages.entries()) {
      console.log(`Sending part ${i + 1}/${messages.length} to Telegram...`);
      await axios.post(url, { chat_id: chatId, text });
    }
    console.log(`Telegram: sent ${messages.length} message(s) successfully.`);
    return { status: "sent", messageCount: messages.length };
  } catch (err) {
    const message = axios.isAxiosError(err)
      ? `HTTP ${err.response?.status}: ${JSON.stringify(err.response?.data)}`
      : String(err);
    console.error(`Telegram send failed: ${message}`);
    return { status: "failed", error: message };
  }
}
