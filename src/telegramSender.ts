import axios from "axios";
import type { Config } from "./config.js";
import type { SendResult } from "./types.js";

function maskChatId(chatId: string): string {
  return chatId.length <= 4 ? "****" : "*".repeat(chatId.length - 4) + chatId.slice(-4);
}

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
  const chatIds = config.TELEGRAM_CHAT_ID!.split(",").map((id) => id.trim()).filter(Boolean);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const failedRecipients: string[] = [];

  for (const chatId of chatIds) {
    try {
      for (const [i, text] of messages.entries()) {
        console.log(`Sending part ${i + 1}/${messages.length} to ${maskChatId(chatId)}...`);
        await axios.post(url, { chat_id: chatId, text });
      }
      console.log(`Sent ${messages.length} message(s) to ${maskChatId(chatId)}.`);
    } catch (err) {
      const detail = axios.isAxiosError(err)
        ? `HTTP ${err.response?.status}: ${JSON.stringify(err.response?.data)}`
        : String(err);
      console.error(`Failed to send to ${maskChatId(chatId)}: ${detail}`);
      failedRecipients.push(maskChatId(chatId));
    }
  }

  const recipientCount = chatIds.length;
  const successCount = recipientCount - failedRecipients.length;

  if (failedRecipients.length === 0) {
    console.log(`Telegram: sent ${messages.length} message(s) to ${recipientCount} recipient(s) successfully.`);
    return { status: "sent", messageCount: messages.length, recipientCount };
  } else if (successCount > 0) {
    console.error(`Telegram: partial failure — sent to ${successCount}/${recipientCount} recipient(s). Failed: ${failedRecipients.join(", ")}`);
    return { status: "partial", messageCount: messages.length, recipientCount, failedRecipients };
  } else {
    console.error(`Telegram: all ${recipientCount} recipient(s) failed.`);
    return { status: "failed", messageCount: messages.length, recipientCount, failedRecipients, error: `All ${recipientCount} recipient(s) failed` };
  }
}
