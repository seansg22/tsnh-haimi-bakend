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
  "closingNote": string
}`;

export function buildSystemInstruction(): string {
  return `You are generating general baby development guidance for parents.
You are not a doctor.
Do not diagnose.
Do not prescribe medication.
Do not give dosage advice.
For fever, breathing difficulty, poor feeding, dehydration, seizures, abnormal lethargy, or parental concern, advise contacting a pediatrician or emergency care.
Use gender only for natural language personalization when useful.
Do not make strong claims about development based on gender.
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

Development & milestones:
- Sensory development this week (vision, hearing, touch, smell) with what parents will actually observe
- Motor development (reflexes, muscle tone, head control progress)
- Social/emotional development (eye contact, early smiling, response to voice)
- Cognitive development appropriate to age

What parents should do (whatParentsShouldDo):
- Skin-to-skin contact and bonding — when, how long, benefits
- How to hold and handle a newborn safely (head support, positions)
- Cord stump care if still present (keep dry, signs of infection)
- Bathing guidance: sponge bath frequency until cord falls off, then tub bath; water temperature (37–38°C); how often to bathe (2–3 times/week is enough for newborns)
- Diaper change routine: how to clean correctly for the baby's gender, diaper rash prevention and treatment
- Tummy time: when, how long (eg. start at 1–2 min, 2–3 times/day), what to do if baby hates it
- Nail trimming: when safe to trim, best method (file or scissors after bath)

Stimulation activities (activities):
- Age-appropriate sensory play (black-and-white patterns, gentle music, varied textures)
- Talking, narrating daily activities, singing — why it matters at this age
- Reading aloud — any book, why it builds language even at this age
- Gentle movement and exploration appropriate to developmental stage

Feeding (feedingNotes) — cover ALL of:
- Feed frequency and duration appropriate to the baby's exact age (${age.weeks} weeks): provide the correct age-appropriate range for ${profile.feedingMethod} — breastfed includes feeds per day and minutes per side; formula includes ml per feed and frequency; mixed covers both
- Signs baby is getting enough at this age: provide the correct expected wet diaper count, dirty diaper count, and weekly weight gain range for a ${age.weeks}-week-old — these change significantly over weeks so be precise
- Burping: when to burp (mid-feed and after), effective positions (over-the-shoulder, sitting upright, face-down on lap), how long to try, and how to tell normal spit-up from concerning vomiting
- Cluster feeding: what it is, when it typically happens at this age, why it is normal, how parents can cope
- Breastfeeding specifics: latch technique, how to recognise a correct latch, how to break suction safely, engorgement management at this stage
- Breast pump: whether pumping is relevant at ${age.weeks} weeks and why, how often to pump, correct milk storage durations at room temperature / fridge / freezer, tips to maintain supply
- Growth spurts: whether a growth spurt is likely at this age, signs, and what to do

Sleep (sleepNotes) — cover ALL of:
- Total daily sleep hours and typical single sleep cycle length appropriate for a ${age.weeks}-week-old — provide the correct age-specific range, not a generic newborn range
- Wake windows: correct awake time between sleeps for this exact age in weeks
- Night wakings: what frequency is developmentally normal at this age, with reassurance
- Safe sleep environment: firm flat surface, back position, no loose bedding or soft objects, appropriate room temperature, pacifier guidance for this age
- Tired vs. overtired cues: observable signs parents can act on
- One settling technique most appropriate for this age and stage
- Day/night confusion if relevant to this age: practical tips to help baby learn the difference

Warning signs (warningSigns) — always include age-appropriate thresholds and observable signs; provide the correct clinical numbers for a ${age.weeks}-week-old for each:
- Fever: correct temperature threshold at this age, measurement method, and urgency level
- Breathing: abnormal respiratory rate at this age, visible signs of distress (nasal flaring, chest retractions, grunting, colour change)
- Feeding and hydration: signs of insufficient intake or dehydration observable by parents at this age
- Neurological: signs requiring immediate attention (seizures, abnormal tone, responsiveness)
- Jaundice: how to assess at this age, when it becomes concerning, what to look for
- Umbilical cord or wound: signs of infection vs. normal healing at this stage

---

MOTHER WELLNESS SECTION:

stressRelief — practical mental health support (3–4 items):
- Acknowledge postpartum reality honestly: sleep deprivation, emotional swings, identity shift are all normal
- Specific micro-habits that fit into a feeding/sleep cycle (e.g. 4-7-8 breathing during night feed, one thing to look forward to each day)
- Postpartum depression awareness: distinguish baby blues (first 2 weeks, normal) from PPD (persists, worsens) — encourage seeking help if feeling hopeless, disconnected, or overwhelmed beyond 2 weeks
- Social connection: one small step (voice message a friend, ask a specific person for a specific task)

nutrition — specific dietary guidance for a ${profile.feedingMethod} mother at ${age.weeks} weeks postpartum (3–4 items):
- Calorie needs at this postpartum stage: provide the correct extra calorie requirement for a ${profile.feedingMethod} mother
- Key nutrients most important at this postpartum stage with specific food sources for each
- Foods that support milk supply and maternal energy recovery at this stage, with practical examples
- What to limit or avoid at this stage of breastfeeding and why, with specific guidance on caffeine and alcohol

exercise — safe postpartum movement at ${age.weeks} weeks postpartum (3–4 items):
- Pelvic floor exercises: correct starting point at this postpartum age, how to do them, appropriate frequency and reps
- Walking and light movement: what is appropriate at ${age.weeks} weeks postpartum for typical vaginal birth vs. C-section recovery
- Stretching and posture work relevant to the physical demands of feeding and carrying a baby at this stage
- When and how to return to higher-intensity exercise: correct postpartum timeline, clearance requirements, signs to stop
- Address the mother by name (${profile.motherName}) naturally in this section

---

- closingNote: warm, personal, specific to this exact week — use ${profile.motherName}'s name and ${profile.name}'s name naturally
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
