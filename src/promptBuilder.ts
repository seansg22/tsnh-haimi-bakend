import type { BabyAge, BabyProfile } from "./types.js";

const SCHEMA = `{
  "title": string,
  "ageLabel": string,
  "summary": string,
  "whatToExpect": string[],
  "whatParentsShouldDo": string[],
  "activities": string[],
  "feedingNotes": string[],
  "sleepNotes": string[],
  "warningSigns": string[],
  "motherWellness": {
    "stressRelief": string[],
    "nutrition": string[],
    "exercise": string[]
  },
}`;

export function buildSystemInstruction(): string {
  return `You are generating general baby development guidance for parents.
For fever, breathing difficulty, poor feeding, dehydration, seizures, abnormal lethargy, or parental concern, advise contacting a pediatrician or emergency care.
Use birth weight only as background context.
Do not assess growth status from birth weight alone.
Return JSON only. No greeting. No explanation. No text before or after the JSON object. Do not include markdown.`;
}

export function buildUserPrompt(
  profile: BabyProfile,
  age: BabyAge,
  currentDate: string
): string {
  return `Generate a weekly baby development reminder for the following baby:

Baby name: ${profile.name}
Mother name: ${profile.motherName}
Gender: ${profile.gender}
Birth date: ${profile.birthDate}
Birth weight: ${profile.birthWeightGrams} grams
Feeding method: ${profile.feedingMethod}
Current date: ${currentDate}
Age in days: ${age.days}
Age in weeks: ${age.weeks}
Age in months: ${age.months}
Age in years: ${age.years}
Age label: ${age.label}

Language: Vietnamese (vi)
Tone: warm, encouraging, and concise — suitable for a Telegram message on mobile
Scope: comprehensive, practical, age-appropriate general parenting guidance

Return a JSON object matching exactly this schema:
${SCHEMA}

---

BABY SECTIONS — cover ALL of the following topics, distributed naturally across whatToExpect, whatParentsShouldDo, activities, feedingNotes, and sleepNotes. Each bullet is 2–3 sentences: state the fact then give a real-life example or concrete how-to.

+ Development & milestones
+ What parents should do (whatParentsShouldDo)
+ Stimulation activities (activities)
+ Feeding (feedingNotes) — cover ALL of
+ Sleep (sleepNotes) — cover ALL of
+ Warning signs (warningSigns) — always include age-appropriate thresholds and observable signs; provide the correct clinical numbers for a ${age.weeks}-week-old for each
---

MOTHER WELLNESS SECTION:

+ stressRelief — practical mental health support (3–4 items)
+ nutrition — specific dietary guidance for a ${profile.feedingMethod} mother at ${age.weeks} weeks postpartum (3–4 items)
+ exercise — safe postpartum movement at ${age.weeks} weeks postpartum (3–4 items):

---

- Do not use markdown formatting inside any string value
- Include specific numbers throughout wherever they add clarity
- Keep each bullet 2–3 sentences max — concrete and actionable, not generic

Return JSON only. Do not include markdown fences. Do not include any greeting or text before or after the JSON.`;
}

export function buildRepairPrompt(invalidJson: string): string {
  return `The following JSON response does not match the required schema. Fix it so that it strictly matches.

Required schema:
${SCHEMA}

Invalid response:
${invalidJson}

Rules:
- All fields must be present including motherWellness with stressRelief, nutrition, and exercise arrays
- All array fields must contain strings
- Do not add extra fields
- Return JSON only. Do not include markdown fences. Do not include any greeting or text before or after the JSON.`;
}
