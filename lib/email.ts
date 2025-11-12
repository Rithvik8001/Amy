import { Resend } from "resend";
import db from "@/db/config";
import { emailNotifications } from "@/db/models/email-notifications";
import { eq, and, gte, lt } from "drizzle-orm";
import { getUserDetails } from "@/lib/clerk-helpers";
import { getUserCurrency } from "@/lib/user-settings";
import { getRenewalReminderEmailHtml } from "@/components/emails/renewal-reminder-email";
import { getPriceChangeEmailHtml } from "@/components/emails/price-change-email";
import { getPastDueEmailHtml } from "@/components/emails/past-due-email";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email notification types
export type EmailNotificationType =
  | "renewal_reminder"
  | "renewal_reminder_1day"
  | "price_change"
  | "past_due";

// Subscription type for email functions
type Subscription = {
  id: number;
  userId: string;
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  status: "active" | "cancelled" | "paused";
};

/**
 * Check if an email has already been sent for a subscription today
 * @param userId - Clerk user ID
 * @param subscriptionId - Subscription ID
 * @param type - Email notification type
 * @returns true if email was already sent today, false otherwise
 */
export async function hasEmailBeenSentToday(
  userId: string,
  subscriptionId: number,
  type: EmailNotificationType
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await db
      .select()
      .from(emailNotifications)
      .where(
        and(
          eq(emailNotifications.userId, userId),
          eq(emailNotifications.subscriptionId, subscriptionId),
          eq(emailNotifications.type, type),
          gte(emailNotifications.sentAt, today),
          lt(emailNotifications.sentAt, tomorrow)
        )
      )
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    console.error("Error checking if email was sent:", error);
    // If check fails, return false to allow sending (fail open)
    return false;
  }
}

/**
 * Log that an email was sent to the database
 * @param userId - Clerk user ID
 * @param subscriptionId - Subscription ID
 * @param type - Email notification type
 * @param metadata - Optional metadata (e.g., oldCost/newCost for price changes)
 */
export async function logEmailSent(
  userId: string,
  subscriptionId: number,
  type: EmailNotificationType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(emailNotifications).values({
      userId,
      subscriptionId,
      type,
      metadata: metadata || null,
    });
  } catch (error) {
    console.error("Error logging email sent:", error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Get dashboard URL for email links
 */
function getDashboardUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  return `${baseUrl.startsWith("http") ? "" : "https://"}${baseUrl}/dashboard`;
}

/**
 * Send renewal reminder email (3 days before due date)
 * @param userId - Clerk user ID
 * @param subscription - Subscription object
 */
export async function sendRenewalReminderEmail(
  userId: string,
  subscription: Subscription
): Promise<boolean> {
  try {
    // Only send for active subscriptions
    if (subscription.status !== "active") {
      return false;
    }

    // Check if email already sent today
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      subscription.id,
      "renewal_reminder"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send renewal reminder: No email found for userId ${userId}`
      );
      return false;
    }

    // Get user's currency preference
    const currency = await getUserCurrency(userId);

    // Generate email HTML
    const html = getRenewalReminderEmailHtml(
      userDetails.firstName,
      subscription.name,
      subscription.cost,
      subscription.billingCycle,
      subscription.nextBillingDate,
      getDashboardUrl(),
      3, // 3 days
      currency
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Renewal Reminder: ${subscription.name} renews in 3 days`,
      html,
    });

    if (result.error) {
      console.error("Error sending renewal reminder email:", result.error);
      return false;
    }

    // Log email sent
    await logEmailSent(userId, subscription.id, "renewal_reminder");

    console.log(
      `Renewal reminder email sent to ${userDetails.email} for subscription ${subscription.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending renewal reminder email for subscription ${subscription.id}:`,
      error
    );
    return false;
  }
}

/**
 * Send renewal reminder email (1 day before due date)
 * @param userId - Clerk user ID
 * @param subscription - Subscription object
 */
export async function sendRenewalReminder1DayEmail(
  userId: string,
  subscription: Subscription
): Promise<boolean> {
  try {
    // Only send for active subscriptions
    if (subscription.status !== "active") {
      return false;
    }

    // Check if email already sent today
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      subscription.id,
      "renewal_reminder_1day"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send 1-day renewal reminder: No email found for userId ${userId}`
      );
      return false;
    }

    // Get user's currency preference
    const currency = await getUserCurrency(userId);

    // Generate email HTML
    const html = getRenewalReminderEmailHtml(
      userDetails.firstName,
      subscription.name,
      subscription.cost,
      subscription.billingCycle,
      subscription.nextBillingDate,
      getDashboardUrl(),
      1, // 1 day
      currency
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Renewal Reminder: ${subscription.name} renews tomorrow`,
      html,
    });

    if (result.error) {
      console.error(
        "Error sending 1-day renewal reminder email:",
        result.error
      );
      return false;
    }

    // Log email sent
    await logEmailSent(userId, subscription.id, "renewal_reminder_1day");

    console.log(
      `1-day renewal reminder email sent to ${userDetails.email} for subscription ${subscription.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending 1-day renewal reminder email for subscription ${subscription.id}:`,
      error
    );
    return false;
  }
}

/**
 * Send price change alert email
 * @param userId - Clerk user ID
 * @param subscription - Subscription object
 * @param oldCost - Previous cost
 * @param newCost - New cost
 */
export async function sendPriceChangeEmail(
  userId: string,
  subscription: Subscription,
  oldCost: string,
  newCost: string
): Promise<boolean> {
  try {
    // Only send for active subscriptions
    if (subscription.status !== "active") {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send price change email: No email found for userId ${userId}`
      );
      return false;
    }

    // Get user's currency preference
    const currency = await getUserCurrency(userId);

    // Generate email HTML
    const html = getPriceChangeEmailHtml(
      userDetails.firstName,
      subscription.name,
      oldCost,
      newCost,
      subscription.billingCycle,
      getDashboardUrl(),
      currency
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Price Change Alert: ${subscription.name}`,
      html,
    });

    if (result.error) {
      console.error("Error sending price change email:", result.error);
      return false;
    }

    // Log email sent with metadata
    await logEmailSent(userId, subscription.id, "price_change", {
      oldCost,
      newCost,
    });

    console.log(
      `Price change email sent to ${userDetails.email} for subscription ${subscription.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending price change email for subscription ${subscription.id}:`,
      error
    );
    return false;
  }
}

/**
 * Send past due notification email
 * @param userId - Clerk user ID
 * @param subscription - Subscription object
 */
export async function sendPastDueEmail(
  userId: string,
  subscription: Subscription
): Promise<boolean> {
  try {
    // Only send for active subscriptions
    if (subscription.status !== "active") {
      return false;
    }

    // Check if email already sent today
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      subscription.id,
      "past_due"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send past due email: No email found for userId ${userId}`
      );
      return false;
    }

    // Get user's currency preference
    const currency = await getUserCurrency(userId);

    // Generate email HTML
    const html = getPastDueEmailHtml(
      userDetails.firstName,
      subscription.name,
      subscription.cost,
      subscription.billingCycle,
      subscription.nextBillingDate,
      getDashboardUrl(),
      currency
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Past Due: ${subscription.name} payment overdue`,
      html,
    });

    if (result.error) {
      console.error("Error sending past due email:", result.error);
      return false;
    }

    // Log email sent
    await logEmailSent(userId, subscription.id, "past_due");

    console.log(
      `Past due email sent to ${userDetails.email} for subscription ${subscription.id}`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending past due email for subscription ${subscription.id}:`,
      error
    );
    return false;
  }
}
