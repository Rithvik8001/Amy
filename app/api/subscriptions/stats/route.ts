import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import {
  sendPastDueEmail,
  sendBudgetApproachingEmail,
  sendBudgetExceededEmail,
  sendBudgetProjectedExceedEmail,
} from "@/lib/email";
import { parseLocalDate } from "@/lib/date-utils";
import { autoRenewPastDueSubscriptions } from "@/lib/subscription-utils";
import { getUserCurrency, getUserBudgetSettings } from "@/lib/user-settings";
import {
  checkBudgetStatus,
  calculateProjectedSpending,
  getBudgetPeriodInfo,
} from "@/lib/budget-utils";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDueSubscriptions = userSubscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate < today;
    });

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

    userSubscriptions = await autoRenewPastDueSubscriptions(
      userSubscriptions,
      userId
    );

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

    const totalYearlySpending = totalMonthly * 12 + totalYearly;

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const upcoming7Days = activeSubscriptions.filter((sub) => {
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate >= today && billingDate <= next7Days;
    });

    const upcoming30Days = activeSubscriptions.filter((sub) => {
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate >= today && billingDate <= next30Days;
    });

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

    const categoryStats = Object.entries(categoryBreakdown).map(
      ([category, monthlySpending]) => ({
        category,
        monthlySpending: parseFloat(monthlySpending.toFixed(2)),
      })
    );

    categoryStats.sort((a, b) => b.monthlySpending - a.monthlySpending);

    const currency = await getUserCurrency(userId);
    const budgetSettings = await getUserBudgetSettings(userId);

    const monthlyPeriod = getBudgetPeriodInfo("monthly");
    const yearlyPeriod = getBudgetPeriodInfo("yearly");

    const projectedMonthlySpending = calculateProjectedSpending(
      totalMonthly,
      monthlyPeriod.daysElapsed,
      monthlyPeriod.totalDays
    );

    const projectedYearlySpending = calculateProjectedSpending(
      totalYearlySpending,
      yearlyPeriod.daysElapsed,
      yearlyPeriod.totalDays
    );

    const monthlyStatus = budgetSettings.monthlyBudget
      ? checkBudgetStatus(
          totalMonthly,
          budgetSettings.monthlyBudget,
          budgetSettings.budgetAlertThreshold
        )
      : null;

    const yearlyStatus = budgetSettings.yearlyBudget
      ? checkBudgetStatus(
          totalYearlySpending,
          budgetSettings.yearlyBudget,
          budgetSettings.budgetAlertThreshold
        )
      : null;

    const monthlyPercentage = budgetSettings.monthlyBudget
      ? (totalMonthly / budgetSettings.monthlyBudget) * 100
      : null;

    const yearlyPercentage = budgetSettings.yearlyBudget
      ? (totalYearlySpending / budgetSettings.yearlyBudget) * 100
      : null;

    const monthlyRemaining = budgetSettings.monthlyBudget
      ? budgetSettings.monthlyBudget - totalMonthly
      : null;

    const yearlyRemaining = budgetSettings.yearlyBudget
      ? budgetSettings.yearlyBudget - totalYearlySpending
      : null;

    if (budgetSettings.monthlyBudget) {
      if (monthlyStatus === "approaching") {
        sendBudgetApproachingEmail(
          userId,
          "monthly",
          totalMonthly,
          budgetSettings.monthlyBudget,
          monthlyPercentage!,
          currency
        ).catch((error) => {
          console.error(
            "Error sending monthly budget approaching email (non-blocking):",
            error
          );
        });
      } else if (monthlyStatus === "exceeded") {
        sendBudgetExceededEmail(
          userId,
          "monthly",
          totalMonthly,
          budgetSettings.monthlyBudget,
          monthlyPercentage!,
          currency
        ).catch((error) => {
          console.error(
            "Error sending monthly budget exceeded email (non-blocking):",
            error
          );
        });
      }

      if (
        projectedMonthlySpending > budgetSettings.monthlyBudget &&
        monthlyStatus !== "exceeded"
      ) {
        sendBudgetProjectedExceedEmail(
          userId,
          "monthly",
          projectedMonthlySpending,
          budgetSettings.monthlyBudget,
          currency
        ).catch((error) => {
          console.error(
            "Error sending monthly budget projected exceed email (non-blocking):",
            error
          );
        });
      }
    }

    if (budgetSettings.yearlyBudget) {
      if (yearlyStatus === "approaching") {
        sendBudgetApproachingEmail(
          userId,
          "yearly",
          totalYearlySpending,
          budgetSettings.yearlyBudget,
          yearlyPercentage!,
          currency
        ).catch((error) => {
          console.error(
            "Error sending yearly budget approaching email (non-blocking):",
            error
          );
        });
      } else if (yearlyStatus === "exceeded") {
        sendBudgetExceededEmail(
          userId,
          "yearly",
          totalYearlySpending,
          budgetSettings.yearlyBudget,
          yearlyPercentage!,
          currency
        ).catch((error) => {
          console.error(
            "Error sending yearly budget exceeded email (non-blocking):",
            error
          );
        });
      }

      if (
        projectedYearlySpending > budgetSettings.yearlyBudget &&
        yearlyStatus !== "exceeded"
      ) {
        sendBudgetProjectedExceedEmail(
          userId,
          "yearly",
          projectedYearlySpending,
          budgetSettings.yearlyBudget,
          currency
        ).catch((error) => {
          console.error(
            "Error sending yearly budget projected exceed email (non-blocking):",
            error
          );
        });
      }
    }

    return NextResponse.json({
      totalMonthly: parseFloat(totalMonthly.toFixed(2)),
      totalYearly: parseFloat(totalYearlySpending.toFixed(2)),
      totalActiveSubscriptions: activeSubscriptions.length,
      currency,
      budget: {
        monthlyBudget: budgetSettings.monthlyBudget,
        yearlyBudget: budgetSettings.yearlyBudget,
        monthlySpent: parseFloat(totalMonthly.toFixed(2)),
        yearlySpent: parseFloat(totalYearlySpending.toFixed(2)),
        monthlyRemaining:
          monthlyRemaining !== null
            ? parseFloat(monthlyRemaining.toFixed(2))
            : null,
        yearlyRemaining:
          yearlyRemaining !== null
            ? parseFloat(yearlyRemaining.toFixed(2))
            : null,
        monthlyPercentage:
          monthlyPercentage !== null
            ? parseFloat(monthlyPercentage.toFixed(2))
            : null,
        yearlyPercentage:
          yearlyPercentage !== null
            ? parseFloat(yearlyPercentage.toFixed(2))
            : null,
        monthlyStatus,
        yearlyStatus,
        projectedMonthlySpending: parseFloat(
          projectedMonthlySpending.toFixed(2)
        ),
        projectedYearlySpending: parseFloat(projectedYearlySpending.toFixed(2)),
      },
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
