import { Resend } from "resend";
import db from "@/db/config";
import { emailNotifications } from "@/db/models/email-notifications";
import { eq, and, gte, lt } from "drizzle-orm";
import { getUserDetails } from "@/lib/clerk-helpers";
import { getUserCurrency } from "@/lib/user-settings";
import { getRenewalReminderEmailHtml } from "@/components/emails/renewal-reminder-email";
import { getPriceChangeEmailHtml } from "@/components/emails/price-change-email";
import { getPastDueEmailHtml } from "@/components/emails/past-due-email";
import { getBudgetAlertEmailHtml } from "@/components/emails/budget-alert-email";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email notification types
export type EmailNotificationType =
  | "renewal_reminder"
  | "renewal_reminder_1day"
  | "price_change"
  | "past_due"
  | "budget_approaching"
  | "budget_exceeded"
  | "budget_projected_exceed";

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
 * For budget alerts, checks by period instead of day
 * @param userId - Clerk user ID
 * @param subscriptionId - Subscription ID (use 0 or null for budget alerts)
 * @param type - Email notification type
 * @returns true if email was already sent, false otherwise
 */
export async function hasEmailBeenSentToday(
  userId: string,
  subscriptionId: number | null,
  type: EmailNotificationType
): Promise<boolean> {
  try {
    // Budget alerts are tracked by period (month/year), not by day
    const isBudgetAlert =
      type === "budget_approaching" ||
      type === "budget_exceeded" ||
      type === "budget_projected_exceed";

    if (isBudgetAlert) {
      // For budget alerts, check if sent in current period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodStart.setHours(0, 0, 0, 0);

      const existing = await db
        .select()
        .from(emailNotifications)
        .where(
          and(
            eq(emailNotifications.userId, userId),
            eq(emailNotifications.subscriptionId, subscriptionId ?? 0),
            eq(emailNotifications.type, type),
            gte(emailNotifications.sentAt, periodStart)
          )
        )
        .limit(1);

      return existing.length > 0;
    }

    // For subscription emails, check if sent today
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
          eq(emailNotifications.subscriptionId, subscriptionId ?? 0),
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
 * @param subscriptionId - Subscription ID (use 0 or null for budget alerts)
 * @param type - Email notification type
 * @param metadata - Optional metadata (e.g., oldCost/newCost for price changes)
 */
export async function logEmailSent(
  userId: string,
  subscriptionId: number | null,
  type: EmailNotificationType,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await db.insert(emailNotifications).values({
      userId,
      subscriptionId: subscriptionId ?? 0,
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
      subscription.id ?? 0,
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
    await logEmailSent(userId, subscription.id ?? 0, "renewal_reminder");

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
      subscription.id ?? 0,
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
    await logEmailSent(userId, subscription.id ?? 0, "renewal_reminder_1day");

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
    await logEmailSent(userId, subscription.id ?? 0, "price_change", {
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
      subscription.id ?? 0,
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
    await logEmailSent(userId, subscription.id ?? 0, "past_due");

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

/**
 * Send budget approaching alert email
 * @param userId - Clerk user ID
 * @param budgetType - "monthly" or "yearly"
 * @param spent - Amount spent so far
 * @param budget - Budget limit
 * @param percentage - Percentage of budget used
 * @param currency - Currency code
 */
export async function sendBudgetApproachingEmail(
  userId: string,
  budgetType: "monthly" | "yearly",
  spent: number,
  budget: number,
  percentage: number,
  currency: string
): Promise<boolean> {
  try {
    // Check if email already sent this period
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      0,
      "budget_approaching"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send budget approaching email: No email found for userId ${userId}`
      );
      return false;
    }

    // Generate email HTML
    const html = getBudgetAlertEmailHtml(
      userDetails.firstName,
      budgetType,
      spent,
      budget,
      percentage,
      "approaching",
      currency,
      getDashboardUrl()
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Budget Alert: You've spent ${percentage.toFixed(
        1
      )}% of your ${budgetType}ly budget`,
      html,
    });

    if (result.error) {
      console.error("Error sending budget approaching email:", result.error);
      return false;
    }

    // Log email sent
    await logEmailSent(userId, 0, "budget_approaching", {
      budgetType,
      spent,
      budget,
      percentage,
    });

    console.log(
      `Budget approaching email sent to ${userDetails.email} for ${budgetType} budget`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending budget approaching email for ${budgetType} budget:`,
      error
    );
    return false;
  }
}

/**
 * Send budget exceeded alert email
 * @param userId - Clerk user ID
 * @param budgetType - "monthly" or "yearly"
 * @param spent - Amount spent so far
 * @param budget - Budget limit
 * @param percentage - Percentage of budget used
 * @param currency - Currency code
 */
export async function sendBudgetExceededEmail(
  userId: string,
  budgetType: "monthly" | "yearly",
  spent: number,
  budget: number,
  percentage: number,
  currency: string
): Promise<boolean> {
  try {
    // Check if email already sent this period
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      0,
      "budget_exceeded"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send budget exceeded email: No email found for userId ${userId}`
      );
      return false;
    }

    // Generate email HTML
    const html = getBudgetAlertEmailHtml(
      userDetails.firstName,
      budgetType,
      spent,
      budget,
      percentage,
      "exceeded",
      currency,
      getDashboardUrl()
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Budget Exceeded: You've gone over your ${budgetType}ly budget`,
      html,
    });

    if (result.error) {
      console.error("Error sending budget exceeded email:", result.error);
      return false;
    }

    // Log email sent
    await logEmailSent(userId, 0, "budget_exceeded", {
      budgetType,
      spent,
      budget,
      percentage,
    });

    console.log(
      `Budget exceeded email sent to ${userDetails.email} for ${budgetType} budget`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending budget exceeded email for ${budgetType} budget:`,
      error
    );
    return false;
  }
}

/**
 * Send budget projected exceed alert email
 * @param userId - Clerk user ID
 * @param budgetType - "monthly" or "yearly"
 * @param projectedSpending - Projected spending for period
 * @param budget - Budget limit
 * @param currency - Currency code
 */
export async function sendBudgetProjectedExceedEmail(
  userId: string,
  budgetType: "monthly" | "yearly",
  projectedSpending: number,
  budget: number,
  currency: string
): Promise<boolean> {
  try {
    // Check if email already sent this period
    const alreadySent = await hasEmailBeenSentToday(
      userId,
      0,
      "budget_projected_exceed"
    );
    if (alreadySent) {
      return false;
    }

    // Get user details from Clerk
    const userDetails = await getUserDetails(userId);
    if (!userDetails || !userDetails.email) {
      console.warn(
        `Cannot send budget projected exceed email: No email found for userId ${userId}`
      );
      return false;
    }

    // Calculate current percentage for display
    const percentage = (projectedSpending / budget) * 100;

    // Generate email HTML
    const html = getBudgetAlertEmailHtml(
      userDetails.firstName,
      budgetType,
      projectedSpending,
      budget,
      percentage,
      "projected_exceed",
      currency,
      getDashboardUrl(),
      projectedSpending
    );

    // Send email via Resend
    const result = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: userDetails.email,
      subject: `Projected Budget Alert: On track to exceed your ${budgetType}ly budget`,
      html,
    });

    if (result.error) {
      console.error(
        "Error sending budget projected exceed email:",
        result.error
      );
      return false;
    }

    // Log email sent
    await logEmailSent(userId, 0, "budget_projected_exceed", {
      budgetType,
      projectedSpending,
      budget,
    });

    console.log(
      `Budget projected exceed email sent to ${userDetails.email} for ${budgetType} budget`
    );
    return true;
  } catch (error) {
    console.error(
      `Error sending budget projected exceed email for ${budgetType} budget:`,
      error
    );
    return false;
  }
}
