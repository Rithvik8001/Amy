import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { eq } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { getUserCurrency, getUserBudgetSettings } from "@/lib/user-settings";
import { budgetRecommendationsSchema } from "@/lib/validations/budget-recommendations";
import {
  analyzeSpendingPatterns,
  prepareAnalysisContext,
} from "@/lib/budget-analysis";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    const currency = await getUserCurrency(userId);
    const budgetSettings = await getUserBudgetSettings(userId);

    const analysis = analyzeSpendingPatterns(userSubscriptions);

    const context = prepareAnalysisContext(
      analysis,
      {
        monthlyBudget: budgetSettings.monthlyBudget,
        yearlyBudget: budgetSettings.yearlyBudget,
      },
      currency
    );

    if (analysis.activeSubscriptionsCount === 0) {
      const fallbackMonthly = 50; // Conservative estimate
      const fallbackYearly = fallbackMonthly * 12;

      return NextResponse.json({
        success: true,
        data: {
          suggestedMonthlyBudget: fallbackMonthly,
          suggestedYearlyBudget: fallbackYearly,
          reasoning:
            "You don't have any active subscriptions yet. We've suggested a conservative starting budget. You can adjust this as you add subscriptions.",
          confidence: "low",
          insights: [
            "Start with a conservative budget and adjust as you add subscriptions",
            "Consider tracking your first few subscriptions to understand your spending patterns",
          ],
        },
      });
    }

    let confidence: "high" | "medium" | "low" = "medium";
    if (analysis.hasHistoricalData && analysis.activeSubscriptionsCount >= 3) {
      confidence = "high";
    } else if (analysis.activeSubscriptionsCount < 2) {
      confidence = "low";
    }

    const model = openai("gpt-4o-mini");

    const hasExistingBudget =
      budgetSettings.monthlyBudget || budgetSettings.yearlyBudget;

    const prompt = `You are a financial advisor helping a user ${
      hasExistingBudget
        ? "review and potentially adjust their existing subscription budget"
        : "set realistic subscription budgets"
    }.

${context}

${
  hasExistingBudget
    ? `IMPORTANT: The user already has budgets set. Your recommendations should:
   - Compare their current budget vs their actual spending
   - Suggest adjustments if their spending patterns have changed
   - Validate if their current budget is realistic (too high, too low, or just right)
   - Explain whether they should increase, decrease, or maintain their current budget
   - Consider if their current spending is sustainable within their existing budget`
    : `The user doesn't have a budget set yet. Your recommendations should:
   - Help them establish their first budget based on current spending patterns
   - Provide a starting point they can adjust over time`
}

Based on this analysis, provide personalized budget recommendations:

1. **Monthly Budget**: Suggest a realistic monthly budget that:
   - Accounts for current monthly spending (${
     analysis.totalMonthly
   } ${currency}/month)
   - Includes a 10-20% buffer for new subscriptions or price increases
   - Suggested amount should be approximately: ${
     analysis.totalMonthly
   } * 1.15 to 1.20 (15-20% buffer)
   - Is practical and achievable
   - Considers the user's spending patterns and category distribution
   ${
     hasExistingBudget && budgetSettings.monthlyBudget
       ? `- Compares with their current monthly budget of ${budgetSettings.monthlyBudget} ${currency}`
       : ""
   }

2. **Yearly Budget**: Suggest a yearly budget that:
   - Accounts for current yearly spending (${
     analysis.totalYearly
   } ${currency}/year) - NOTE: This already includes monthly subscriptions multiplied by 12 plus any yearly subscriptions
   - Includes a 10-20% buffer for new subscriptions and price changes
   - Should be approximately: (suggested monthly budget * 12) + buffer for yearly subscriptions
   - IMPORTANT: Do NOT multiply the yearly spending again - it's already annualized. Just add a buffer.
   ${
     hasExistingBudget && budgetSettings.yearlyBudget
       ? `- Compares with their current yearly budget of ${budgetSettings.yearlyBudget} ${currency}`
       : ""
   }

3. **Reasoning**: Provide clear, concise reasoning (2-4 sentences) explaining:
   - Why these specific amounts were chosen
   - What factors influenced the recommendation
   - How the budget relates to their current spending
   - For yearly budget: Explain that it's based on monthly budget * 12 plus buffer, NOT yearly spending * 12
   ${
     hasExistingBudget
       ? "- Whether their current budget needs adjustment and why"
       : ""
   }

4. **Confidence**: Assess confidence level as "${confidence}" based on:
   - Data quality (historical data, number of subscriptions)
   - Spending pattern clarity
   - Consistency of spending

5. **Insights**: Provide 2-4 actionable insights about their spending, such as:
   - Notable spending patterns
   - Category distribution observations
   - Suggestions for optimization
   - Warnings about potential increases
   ${
     hasExistingBudget
       ? "- Comparison of current budget vs actual spending and recommendations for adjustment"
       : ""
   }

Be practical and helpful. The recommendations should feel personalized and actionable.`;

    try {
      const { object } = await generateObject({
        model,
        schema: budgetRecommendationsSchema,
        prompt,
      });

      const expectedYearlyMin = object.suggestedMonthlyBudget * 10;
      const expectedYearlyMax = object.suggestedMonthlyBudget * 14;

      if (
        object.suggestedYearlyBudget < expectedYearlyMin ||
        object.suggestedYearlyBudget > expectedYearlyMax
      ) {
        const correctedYearly = object.suggestedMonthlyBudget * 12 * 1.15;
        object.suggestedYearlyBudget = Math.round(correctedYearly * 100) / 100;
      }

      return NextResponse.json({
        success: true,
        data: object,
      });
    } catch (aiError) {
      console.error("AI error generating budget recommendations:", aiError);

      const fallbackMonthly = Math.ceil(analysis.totalMonthly * 1.2);
      const fallbackYearly = Math.ceil(analysis.totalYearly * 1.2);

      return NextResponse.json({
        success: true,
        data: {
          suggestedMonthlyBudget: fallbackMonthly,
          suggestedYearlyBudget: fallbackYearly,
          reasoning: `Based on your current monthly spending of ${analysis.totalMonthly} ${currency}, we suggest a monthly budget of ${fallbackMonthly} ${currency} (20% buffer for new subscriptions or price increases). Your yearly budget of ${fallbackYearly} ${currency} accounts for your current annual spending plus a buffer.`,
          confidence: "medium",
          insights: [
            `You're currently spending ${analysis.totalMonthly} ${currency}/month on ${analysis.activeSubscriptionsCount} active subscriptions`,
            analysis.highestSpendingCategories.length > 0
              ? `Your highest spending category is ${
                  analysis.highestSpendingCategories[0].category
                } at ${analysis.highestSpendingCategories[0].amount.toFixed(
                  2
                )} ${currency}/month`
              : "Consider categorizing your subscriptions for better insights",
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error generating budget recommendations:", error);
    return NextResponse.json(
      {
        error: "Failed to generate budget recommendations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
