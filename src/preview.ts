import { getConfig, buildBabyProfile } from "./config.js";
import { calculateAge } from "./babyAge.js";
import { generateReminderContent } from "./aiService.js";
import { formatTelegramMessage } from "./formatter.js";

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

  console.log("\n--- Generated JSON ---");
  console.log(JSON.stringify(content, null, 2));

  const messages = formatTelegramMessage(content);
  console.log("\n--- Formatted Telegram Message ---");
  for (const [i, msg] of messages.entries()) {
    if (messages.length > 1) console.log(`\n[Part ${i + 1}/${messages.length}]`);
    console.log(msg);
  }
  console.log("--- END ---");
}

main().catch((err) => {
  console.error(`Preview failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
