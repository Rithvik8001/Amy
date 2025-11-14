import type { Subscription } from "@/db/models/subscriptions";

export type SpendingAnalysis = {
  totalMonthly: number;
  totalYearly: number;
  activeSubscriptionsCount: number;
  averageSubscriptionCost: number;
  categoryBreakdown: Record<string, number>;
  highestSpendingCategories: Array<{ category: string; amount: number }>;
  hasHistoricalData: boolean;
  spendingTrend: "increasing" | "decreasing" | "stable" | "unknown";
};

/**
 * Analyze spending patterns from subscriptions
 */
export function analyzeSpendingPatterns(
  subscriptions: Subscription[]
): SpendingAnalysis {
  const activeSubscriptions = subscriptions.filter(
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

  const categoryStats = Object.entries(categoryBreakdown)
    .map(([category, monthlySpending]) => ({
      category,
      amount: parseFloat(monthlySpending.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);

  const averageSubscriptionCost =
    activeSubscriptions.length > 0
      ? totalMonthly / activeSubscriptions.length
      : 0;

  // Determine spending trend based on creation dates
  // Simple heuristic: if most subscriptions are recent, trend is "increasing"
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const recentSubscriptions = activeSubscriptions.filter((sub) => {
    const createdAt = new Date(sub.createdAt);
    return createdAt >= threeMonthsAgo;
  });

  let spendingTrend: "increasing" | "decreasing" | "stable" | "unknown" =
    "unknown";
  if (activeSubscriptions.length > 0) {
    const recentRatio = recentSubscriptions.length / activeSubscriptions.length;
    if (recentRatio > 0.5) {
      spendingTrend = "increasing";
    } else if (recentRatio < 0.2) {
      spendingTrend = "stable";
    } else {
      spendingTrend = "stable";
    }
  }

  // Check if we have historical data (subscriptions older than 1 month)
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const hasHistoricalData = activeSubscriptions.some((sub) => {
    const createdAt = new Date(sub.createdAt);
    return createdAt < oneMonthAgo;
  });

  return {
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat(totalYearlySpending.toFixed(2)),
    activeSubscriptionsCount: activeSubscriptions.length,
    averageSubscriptionCost: parseFloat(averageSubscriptionCost.toFixed(2)),
    categoryBreakdown,
    highestSpendingCategories: categoryStats.slice(0, 5),
    hasHistoricalData,
    spendingTrend,
  };
}

/**
 * Prepare analysis context for AI prompt
 */
export function prepareAnalysisContext(
  analysis: SpendingAnalysis,
  existingBudgets: {
    monthlyBudget: number | null;
    yearlyBudget: number | null;
  },
  currency: string
): string {
  const contextParts: string[] = [];

  contextParts.push(
    `Current Spending Analysis:\n- Monthly spending: ${analysis.totalMonthly} ${currency}\n- Yearly spending: ${analysis.totalYearly} ${currency}\n- Active subscriptions: ${analysis.activeSubscriptionsCount}\n- Average subscription cost: ${analysis.averageSubscriptionCost} ${currency}/month`
  );

  if (analysis.highestSpendingCategories.length > 0) {
    contextParts.push(
      `\nTop Spending Categories:\n${analysis.highestSpendingCategories
        .map(
          (cat) =>
            `- ${cat.category}: ${cat.amount.toFixed(2)} ${currency}/month`
        )
        .join("\n")}`
    );
  }

  if (existingBudgets.monthlyBudget || existingBudgets.yearlyBudget) {
    contextParts.push(
      `\nExisting Budgets:\n${
        existingBudgets.monthlyBudget
          ? `- Monthly: ${existingBudgets.monthlyBudget} ${currency}`
          : ""
      }${
        existingBudgets.yearlyBudget
          ? `\n- Yearly: ${existingBudgets.yearlyBudget} ${currency}`
          : ""
      }`
    );
  }

  contextParts.push(
    `\nData Quality:\n- Historical data available: ${
      analysis.hasHistoricalData ? "Yes" : "No"
    }\n- Spending trend: ${analysis.spendingTrend}`
  );

  return contextParts.join("\n");
}
