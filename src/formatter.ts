import type { ReminderContent } from "./types.js";

const MAX_MESSAGE_LENGTH = 4096;
const MAX_BULLETS_PER_SECTION = 5;

function escapeMdV2(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\\-]/g, "\\$&");
}

function bullets(items: string[]): string {
  return items
    .slice(0, MAX_BULLETS_PER_SECTION)
    .map((item) => `• ${escapeMdV2(item.trim())}`)
    .join("\n");
}

function buildBabyMessage(content: ReminderContent): string {
  const parts = [
    `👶 *${escapeMdV2(content.title)}*`,
    "",
    `Tuổi: *${escapeMdV2(content.ageLabel)}*`,
    "",
    `*Tóm tắt:*`,
    escapeMdV2(content.summary.trim()),
    "",
    `🌱 *Tuần này có thể mong đợi:*\n${bullets(content.whatToExpect)}`,
    "",
    `🎲 *Hoạt động gợi ý:*\n${bullets(content.activities)}`,
    "",
    `🍼 *Ăn:*\n${bullets(content.feedingNotes)}`,
    "",
    `😴 *Ngủ:*\n${bullets(content.sleepNotes)}`,
    "",
    `⚠️ *Dấu hiệu cần chú ý:*\n${bullets(content.warningSigns)}`,
  ];
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildMotherMessage(content: ReminderContent): string {
  const parts = [
    `💆 *Chăm sóc mẹ:*`,
    "",
    `🥗 *Dinh dưỡng cho mẹ:*\n${bullets(content.motherWellness.nutrition)}`,
    "",
    `🏃 *Vận động:*\n${bullets(content.motherWellness.exercise)}`,
  ];
  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function splitIfNeeded(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) return [text];

  const chunks: string[] = [];
  const lines = text.split("\n");
  let current = "";

  for (const line of lines) {
    const addition = current.length > 0 ? `\n${line}` : line;
    if (current.length + addition.length > MAX_MESSAGE_LENGTH) {
      chunks.push(current.trim());
      current = line;
    } else {
      current += addition;
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}

export function formatTelegramMessage(content: ReminderContent): string[] {
  return [
    ...splitIfNeeded(buildBabyMessage(content)),
    ...splitIfNeeded(buildMotherMessage(content)),
  ];
}
