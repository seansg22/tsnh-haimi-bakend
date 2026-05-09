import axios from "axios";
import { z } from "zod";
import { DateTime } from "luxon";
import { AIError } from "./errors.js";
import { buildSystemInstruction, buildUserPrompt, buildRepairPrompt } from "./promptBuilder.js";
import type { BabyAge, BabyProfile, ReminderContent } from "./types.js";
import type { Config } from "./config.js";

const reminderContentSchema = z.object({
  title: z.string(),
  ageLabel: z.string(),
  summary: z.string(),
  whatToExpect: z.array(z.string()),
  activities: z.array(z.string()),
  feedingNotes: z.array(z.string()),
  sleepNotes: z.array(z.string()),
  warningSigns: z.array(z.string()),
  motherWellness: z.object({
    stressRelief: z.array(z.string()),
    nutrition: z.array(z.string()),
    exercise: z.array(z.string()),
  }),
});

// Try to extract a JSON object from a string that may contain surrounding text or markdown fences
function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }
  return text.trim();
}

function parseAndValidate(text: string): ReminderContent {
  const jsonText = extractJson(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new AIError(`AI returned non-JSON response: ${text.slice(0, 300)}`);
  }
  return reminderContentSchema.parse(parsed);
}

function isRateLimitError(err: unknown): boolean {
  if (axios.isAxiosError(err)) return err.response?.status === 429;
  return false;
}

function parseRetryDelay(err: unknown): number | null {
  if (axios.isAxiosError(err)) {
    const retryAfter = err.response?.headers?.["retry-after"];
    if (retryAfter) return Math.ceil(Number(retryAfter));
    const body = err.response?.data as Record<string, unknown> | undefined;
    const msg = typeof body?.error === "object"
      ? JSON.stringify(body.error)
      : String(body?.error ?? "");
    const match = msg.match(/(\d+(?:\.\d+)?)\s*s/i);
    if (match) return Math.ceil(parseFloat(match[1]));
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenRouter(
  config: Config,
  messages: Array<{ role: string; content: string }>,
  label: string,
  sessionId?: string
): Promise<string> {
  const MAX_RETRIES = 3;
  let lastErr: unknown;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "X-Title": config.OPENROUTER_APP_NAME,
  };
  if (config.OPENROUTER_SITE_URL) {
    headers["HTTP-Referer"] = config.OPENROUTER_SITE_URL;
  }

  const body = {
    model: config.OPENROUTER_MODEL,
    messages,
    temperature: 0.7,
    ...(sessionId ? { session_id: sessionId } : {}),
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        body,
        { headers }
      );
      const content: string = response.data.choices[0].message.content;
      return content;
    } catch (err) {
      lastErr = err;

      if (!isRateLimitError(err)) break;

      const delaySec = parseRetryDelay(err) ?? Math.pow(2, attempt) * 10;
      if (attempt < MAX_RETRIES) {
        console.warn(`[${label}] Rate limited (429). Retrying in ${delaySec}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(delaySec * 1000);
      }
    }
  }

  const detail = axios.isAxiosError(lastErr)
    ? `HTTP ${lastErr.response?.status}: ${JSON.stringify(lastErr.response?.data)}`
    : String(lastErr);
  throw new AIError(`OpenRouter request failed: ${detail}`);
}

export async function generateReminderContent(
  profile: BabyProfile,
  age: BabyAge,
  config: Config
): Promise<ReminderContent> {
  const currentDate = DateTime.now().setZone(profile.timezone).toISODate()
    ?? new Date().toISOString().slice(0, 10);

  const systemPrompt = buildSystemInstruction();
  const userPrompt = buildUserPrompt(profile, age, currentDate);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];
  const sessionId = `haimi`;

  console.log(`Calling OpenRouter (model: ${config.OPENROUTER_MODEL}, session: ${sessionId})...`);
  console.log("\n--- System prompt ---\n" + systemPrompt + "\n--- User prompt ---\n" + userPrompt + "\n--- End prompt ---\n");
  const text = await callOpenRouter(config, messages, "generate", sessionId);

  try {
    return parseAndValidate(text);
  } catch {
    console.warn("Response failed validation, attempting repair...");
    const repairMessages = [
      ...messages,
      { role: "assistant", content: text },
      { role: "user", content: buildRepairPrompt(text) },
    ];
    const repairedText = await callOpenRouter(
      config,
      repairMessages,
      "repair",
      sessionId
    );
    try {
      return parseAndValidate(repairedText);
    } catch (secondError) {
      const detail = secondError instanceof Error ? secondError.message : String(secondError);
      throw new AIError(`AI response invalid after repair attempt: ${detail}`);
    }
  }
}
