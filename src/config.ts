import "dotenv/config";
import { z } from "zod";
import { ConfigError } from "./errors.js";
import type { BabyProfile } from "./types.js";

const booleanString = (defaultVal: string) =>
  z
    .string()
    .default(defaultVal)
    .transform((v) => v.toLowerCase() === "true");

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  BABY_NAME: z.string().min(1, "BABY_NAME must not be empty"),
  MOTHER_NAME: z.string().default("Mẹ"),
  BABY_BIRTH_DATE: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "BABY_BIRTH_DATE must be in YYYY-MM-DD format")
    .refine((v) => !isNaN(Date.parse(v)), "BABY_BIRTH_DATE is not a valid date"),
  BABY_BIRTH_WEIGHT_GRAMS: z.coerce
    .number()
    .positive("BABY_BIRTH_WEIGHT_GRAMS must be a positive number"),
  BABY_GENDER: z
    .enum(["female", "male", "other", "unspecified"])
    .default("unspecified"),
  BABY_FEEDING_METHOD: z
    .enum(["breastfed", "formula", "mixed"])
    .default("breastfed"),
  TIMEZONE: z.string().default("Asia/Ho_Chi_Minh"),
  AI_PROVIDER: z.string().default("openrouter"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default("openrouter/auto"),
  OPENROUTER_SITE_URL: z.string().optional(),
  OPENROUTER_APP_NAME: z.string().default("Baby Reminder Bot"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  ENABLE_TELEGRAM_SEND: booleanString("false"),
});

export type Config = z.infer<typeof envSchema>;

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
    throw new ConfigError(`Invalid configuration:\n${messages}`);
  }

  const config = result.data;

  if (config.ENABLE_TELEGRAM_SEND) {
    if (!config.TELEGRAM_BOT_TOKEN) {
      throw new ConfigError("TELEGRAM_BOT_TOKEN is required when ENABLE_TELEGRAM_SEND=true");
    }
    if (!config.TELEGRAM_CHAT_ID) {
      throw new ConfigError("TELEGRAM_CHAT_ID is required when ENABLE_TELEGRAM_SEND=true");
    }
  }

  _config = config;
  return _config;
}

export function buildBabyProfile(config: Config): BabyProfile {
  return {
    name: config.BABY_NAME,
    birthDate: config.BABY_BIRTH_DATE,
    birthWeightGrams: config.BABY_BIRTH_WEIGHT_GRAMS,
    gender: config.BABY_GENDER,
    timezone: config.TIMEZONE,
    language: "vi",
    feedingMethod: config.BABY_FEEDING_METHOD,
    motherName: config.MOTHER_NAME,
  };
}
