import { getConfig, buildBabyProfile } from "./config.js";
import { calculateAge } from "./babyAge.js";
import { generateReminderContent } from "./aiService.js";
import { formatTelegramMessage } from "./formatter.js";
import { sendToTelegram } from "./telegramSender.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
  process.exit(1);
});

async function main() {
  const config = getConfig();
  const profile = buildBabyProfile(config);
  const age = calculateAge(profile.birthDate, profile.timezone);

  console.log(`Baby: ${profile.name} | Age: ${age.label}`);

  const content = await generateReminderContent(profile, age, config);
  const messages = formatTelegramMessage(content);
  const result = await sendToTelegram(messages, config);

  if (result.status === "sent") {
    console.log(`Done: sent ${result.messageCount} message(s) to Telegram.`);
  } else if (result.status === "dry_run") {
    console.log(`Done: dry run complete (${result.messageCount} message(s) not sent).`);
  } else {
    console.error(`Failed to send: ${result.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Send failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
