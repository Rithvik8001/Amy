import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { sendPastDueEmail } from "@/lib/email";
import { parseLocalDate } from "@/lib/date-utils";
import { autoRenewPastDueSubscriptions } from "@/lib/subscription-utils";
import { getUserCurrency } from "@/lib/user-settings";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active subscriptions for the user
    let userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    // Check for past due subscriptions and send emails (non-blocking)
    // Past due = billing date has PASSED (not today, not tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDueSubscriptions = userSubscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(sub.nextBillingDate);
      // Only past due if billing date is BEFORE today (has passed)
      return billingDate < today;
    });

    // Send past due emails for each subscription (before auto-renewal)
    for (const subscription of pastDueSubscriptions) {
      sendPastDueEmail(userId, {
        id: subscription.id,
        userId: subscription.userId,
        name: subscription.name,
        cost: subscription.cost,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate,
        status: subscription.status,
      }).catch((error) => {
        console.error(
          `Error sending past due email for subscription ${subscription.id} (non-blocking):`,
          error
        );
      });
    }

    // Automatically renew past due subscriptions
    userSubscriptions = await autoRenewPastDueSubscriptions(
      userSubscriptions,
      userId
    );

    // Calculate total monthly spending (only active subscriptions)
    const activeSubscriptions = userSubscriptions.filter(
      (sub) => sub.status === "active"
    );

    let totalMonthly = 0;
    let totalYearly = 0;

    activeSubscriptions.forEach((sub) => {
      const cost = parseFloat(sub.cost);
      if (sub.billingCycle === "monthly") {
        totalMonthly += cost;
      } else if (sub.billingCycle === "yearly") {
        totalYearly += cost;
      }
    });

    // Total yearly spending = (monthly subscriptions × 12) + yearly subscriptions
    const totalYearlySpending = totalMonthly * 12 + totalYearly;

    // Calculate upcoming renewals (reuse today variable from above)

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const upcoming7Days = activeSubscriptions.filter((sub) => {
      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate >= today && billingDate <= next7Days;
    });

    const upcoming30Days = activeSubscriptions.filter((sub) => {
      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate >= today && billingDate <= next30Days;
    });

    // Calculate spending by category
    const categoryBreakdown: Record<string, number> = {};
    activeSubscriptions.forEach((sub) => {
      const category = sub.category || "Uncategorized";
      const cost = parseFloat(sub.cost);
      const monthlyCost = sub.billingCycle === "monthly" ? cost : cost / 12;

      if (categoryBreakdown[category]) {
        categoryBreakdown[category] += monthlyCost;
      } else {
        categoryBreakdown[category] = monthlyCost;
      }
    });

    // Convert category breakdown to array format
    const categoryStats = Object.entries(categoryBreakdown).map(
      ([category, monthlySpending]) => ({
        category,
        monthlySpending: parseFloat(monthlySpending.toFixed(2)),
      })
    );

    // Sort by spending (descending)
    categoryStats.sort((a, b) => b.monthlySpending - a.monthlySpending);

    // Get user's currency preference
    const currency = await getUserCurrency(userId);

    return NextResponse.json({
      totalMonthly: parseFloat(totalMonthly.toFixed(2)),
      totalYearly: parseFloat(totalYearlySpending.toFixed(2)),
      totalActiveSubscriptions: activeSubscriptions.length,
      currency,
      upcomingRenewals: {
        next7Days: upcoming7Days.length,
        next30Days: upcoming30Days.length,
        items: upcoming7Days.map((sub) => ({
          id: sub.id,
          name: sub.name,
          cost: sub.cost,
          billingCycle: sub.billingCycle,
          nextBillingDate: sub.nextBillingDate,
          category: sub.category,
        })),
      },
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription stats" },
      { status: 500 }
    );
  }
}
