import { addMonths, addYears, format } from "date-fns";

export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function calculateNextBillingDate(
  currentDate: string,
  billingCycle: "monthly" | "yearly"
): string {
  // Parse current date as local date
  const current = parseLocalDate(currentDate);

  // Calculate next date based on billing cycle
  let nextDate: Date;
  if (billingCycle === "monthly") {
    // Add 1 month - date-fns handles month-end edge cases automatically
    nextDate = addMonths(current, 1);
  } else {
    // Add 1 year - date-fns handles leap year edge cases automatically
    nextDate = addYears(current, 1);
  }

  // Ensure the date is set to local midnight to avoid timezone issues
  nextDate.setHours(0, 0, 0, 0);

  // Return in YYYY-MM-DD format
  return format(nextDate, "yyyy-MM-dd");
}
