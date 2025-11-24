import { format, addDays } from "date-fns";
import { formatCurrency } from "./currency-utils";

type Subscription = {
  id: number;
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string | null;
  paymentMethod: string | null;
  status: "active" | "cancelled" | "paused";
};

/**
 * Escape text for iCalendar format
 * @param text - Text to escape
 * @returns Escaped text
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Format date for iCalendar (YYYYMMDD)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in YYYYMMDD format
 */
function formatIcsDate(dateString: string): string {
  return dateString.replace(/-/g, "");
}

/**
 * Format date for Google Calendar URL (YYYYMMDD)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in YYYYMMDD format
 */
function formatGoogleCalendarDate(dateString: string): string {
  return dateString.replace(/-/g, "");
}

/**
 * Generate description for calendar event
 * @param subscription - Subscription object
 * @param currency - Currency code for formatting
 * @returns Formatted description
 */
function generateEventDescription(
  subscription: Subscription,
  currency: string = "USD"
): string {
  const parts: string[] = [];
  
  parts.push(`Cost: ${formatCurrency(parseFloat(subscription.cost), currency)}/${subscription.billingCycle}`);
  
  if (subscription.paymentMethod) {
    parts.push(`Payment Method: ${subscription.paymentMethod}`);
  }
  
  if (subscription.category) {
    parts.push(`Category: ${subscription.category}`);
  }
  
  parts.push(`Billing Cycle: ${subscription.billingCycle}`);
  parts.push(`Recurring: ${subscription.billingCycle === "monthly" ? "Monthly" : "Yearly"}`);
  
  return parts.join("\\n");
}

/**
 * Generate iCalendar (.ics) event for a subscription
 * @param subscription - Subscription object
 * @param currency - Currency code for formatting
 * @returns iCalendar event string
 */
export function generateIcsEvent(
  subscription: Subscription,
  currency: string = "USD"
): string {
  if (subscription.status !== "active") {
    throw new Error("Only active subscriptions can be added to calendar");
  }

  const startDate = formatIcsDate(subscription.nextBillingDate);
  // End date is next day (for all-day events)
  const billingDate = new Date(subscription.nextBillingDate);
  const endDateObj = addDays(billingDate, 1);
  const endDate = formatIcsDate(format(endDateObj, "yyyy-MM-dd"));

  const summary = escapeIcsText(`${subscription.name} Renewal`);
  const description = escapeIcsText(
    generateEventDescription(subscription, currency)
  );

  // RRULE for recurring events
  const rrule =
    subscription.billingCycle === "monthly"
      ? "RRULE:FREQ=MONTHLY;INTERVAL=1"
      : "RRULE:FREQ=YEARLY;INTERVAL=1";

  // Generate unique ID for event
  const uid = `amy-subscription-${subscription.id}@amy.bz`;

  return `BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
${rrule}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT`;
}

/**
 * Generate Google Calendar URL for a subscription
 * @param subscription - Subscription object
 * @param currency - Currency code for formatting
 * @returns Google Calendar URL
 */
export function generateGoogleCalendarUrl(
  subscription: Subscription,
  currency: string = "USD"
): string {
  if (subscription.status !== "active") {
    throw new Error("Only active subscriptions can be added to calendar");
  }

  const startDate = formatGoogleCalendarDate(subscription.nextBillingDate);
  // End date is next day (for all-day events)
  const billingDate = new Date(subscription.nextBillingDate);
  const endDateObj = addDays(billingDate, 1);
  const endDate = formatGoogleCalendarDate(format(endDateObj, "yyyy-MM-dd"));

  const title = encodeURIComponent(`${subscription.name} Renewal`);
  const description = encodeURIComponent(
    generateEventDescription(subscription, currency).replace(/\\n/g, "\n")
  );

  // Google Calendar URL format
  // Note: Google Calendar URLs don't support RRULE directly,
  // so we include recurrence info in the description
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}`;

  return url;
}

/**
 * Generate complete .ics file content for multiple subscriptions
 * @param subscriptions - Array of subscription objects
 * @param currency - Currency code for formatting
 * @returns Complete .ics file content
 */
export function generateIcsFile(
  subscriptions: Subscription[],
  currency: string = "USD"
): string {
  // Filter only active subscriptions
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  );

  if (activeSubscriptions.length === 0) {
    throw new Error("No active subscriptions to export");
  }

  // Generate events
  const events = activeSubscriptions
    .map((sub) => generateIcsEvent(sub, currency))
    .join("\n");

  // Get current date/time for PRODID and DTSTAMP
  const now = new Date();
  const dtstamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  // Generate .ics file content
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amy Subscription Tracker//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
DTSTAMP:${dtstamp}
${events}
END:VCALENDAR`;
}

