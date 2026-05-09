import { DateTime } from "luxon";
import { ValidationError } from "./errors.js";
import type { BabyAge } from "./types.js";

export function calculateAge(birthDate: string, timezone: string): BabyAge {
  const birth = DateTime.fromISO(birthDate, { zone: timezone }).startOf("day");
  const now = DateTime.now().setZone(timezone).startOf("day");

  if (birth > now) {
    throw new ValidationError("Birth date is in the future");
  }

  const days = Math.floor(now.diff(birth, "days").days);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(now.diff(birth, "months").months);
  const years = Math.floor(now.diff(birth, "years").years);
  const remainingMonths = months - years * 12;

  let label: string;
  if (days < 7) {
    label = `${days} ngày tuổi`;
  } else if (days < 90) {
    label = `${weeks} tuần tuổi`;
  } else if (months < 12) {
    label = `${months} tháng tuổi`;
  } else {
    label = remainingMonths > 0
      ? `${years} tuổi ${remainingMonths} tháng`
      : `${years} tuổi`;
  }

  return { days, weeks, months, years, label };
}
