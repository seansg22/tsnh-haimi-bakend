export type BabyGender = "female" | "male" | "other" | "unspecified";
export type Language = "vi" | "en";
export type FeedingMethod = "breastfed" | "formula" | "mixed";

export type BabyProfile = {
  name: string;
  birthDate: string;
  birthWeightGrams: number;
  gender: BabyGender;
  timezone: string;
  language: Language;
  feedingMethod: FeedingMethod;
  motherName: string;
};

export type BabyAge = {
  days: number;
  weeks: number;
  months: number;
  years: number;
  label: string;
};

export type ReminderContent = {
  title: string;
  ageLabel: string;
  summary: string;
  whatToExpect: string[];
  whatParentsShouldDo: string[];
  activities: string[];
  feedingNotes: string[];
  sleepNotes: string[];
  warningSigns: string[];
  motherWellness: {
    stressRelief: string[];
    nutrition: string[];
    exercise: string[];
  };
};

export type SendResult = {
  status: "dry_run" | "sent" | "partial" | "failed";
  messageCount?: number;
  recipientCount?: number;
  failedRecipients?: string[];
  error?: string;
};
