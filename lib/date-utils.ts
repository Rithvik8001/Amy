/**
 * Parse a YYYY-MM-DD date string as a local date (not UTC)
 * This prevents timezone issues when comparing dates
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object set to local midnight
 */

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}
