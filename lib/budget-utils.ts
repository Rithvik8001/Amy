export type BudgetStatus = "under" | "approaching" | "exceeded" | null;

export type BudgetPeriodType = "monthly" | "yearly";

export interface BudgetPeriodInfo {
  startDate: Date;
  endDate: Date;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
}

export function checkBudgetStatus(
  spent: number,
  budget: number | null,
  threshold: number = 80
): BudgetStatus {
  if (!budget || budget === 0) return null;

  const percentage = (spent / budget) * 100;

  if (percentage >= 100) return "exceeded";
  if (percentage >= threshold) return "approaching";
  return "under";
}

export function calculateProjectedSpending(
  currentSpending: number,
  daysElapsed: number,
  totalDaysInPeriod: number
): number {
  if (daysElapsed === 0) return currentSpending;
  const dailyRate = currentSpending / daysElapsed;
  return dailyRate * totalDaysInPeriod;
}

export function getBudgetPeriodInfo(
  periodType: BudgetPeriodType
): BudgetPeriodInfo {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;

  if (periodType === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31);
  }

  const daysElapsed = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.floor(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalDays =
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    startDate,
    endDate,
    daysElapsed,
    daysRemaining,
    totalDays,
  };
}

export function formatBudgetStatus(status: BudgetStatus): string {
  switch (status) {
    case "under":
      return "Under Budget";
    case "approaching":
      return "Approaching Budget";
    case "exceeded":
      return "Budget Exceeded";
    default:
      return "No Budget Set";
  }
}
