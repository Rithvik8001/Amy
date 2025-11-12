import { eq } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { getUserCurrency, getUserBudgetSettings } from "@/lib/user-settings";
import {
  checkBudgetStatus,
  calculateProjectedSpending,
  getBudgetPeriodInfo,
} from "@/lib/budget-utils";
import {
  sendBudgetApproachingEmail,
  sendBudgetExceededEmail,
  sendBudgetProjectedExceedEmail,
} from "@/lib/email";

export async function checkAndSendBudgetAlerts(userId: string): Promise<void> {
  try {
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

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

    const budgetSettings = await getUserBudgetSettings(userId);
    const currency = await getUserCurrency(userId);

    if (!budgetSettings.monthlyBudget && !budgetSettings.yearlyBudget) {
      return;
    }

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

    if (budgetSettings.monthlyBudget) {
      const monthlyStatus = checkBudgetStatus(
        totalMonthly,
        budgetSettings.monthlyBudget,
        budgetSettings.budgetAlertThreshold
      );

      const monthlyPercentage =
        (totalMonthly / budgetSettings.monthlyBudget) * 100;

      if (monthlyStatus === "approaching") {
        sendBudgetApproachingEmail(
          userId,
          "monthly",
          totalMonthly,
          budgetSettings.monthlyBudget,
          monthlyPercentage,
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
          monthlyPercentage,
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
      const yearlyStatus = checkBudgetStatus(
        totalYearlySpending,
        budgetSettings.yearlyBudget,
        budgetSettings.budgetAlertThreshold
      );

      const yearlyPercentage =
        (totalYearlySpending / budgetSettings.yearlyBudget) * 100;

      if (yearlyStatus === "approaching") {
        sendBudgetApproachingEmail(
          userId,
          "yearly",
          totalYearlySpending,
          budgetSettings.yearlyBudget,
          yearlyPercentage,
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
          yearlyPercentage,
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
  } catch (error) {
    console.error("Error checking budget alerts:", error);
  }
}
