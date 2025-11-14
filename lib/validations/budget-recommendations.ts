import { z } from "zod";

export const budgetRecommendationsSchema = z.object({
  suggestedMonthlyBudget: z
    .number()
    .positive()
    .describe("Suggested monthly budget amount"),
  suggestedYearlyBudget: z
    .number()
    .positive()
    .describe("Suggested yearly budget amount"),
  reasoning: z
    .string()
    .min(50)
    .describe("Clear explanation for why these budgets were recommended"),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("Confidence level based on data quality and spending patterns"),
  insights: z
    .array(z.string())
    .min(1)
    .describe("Array of actionable spending insights"),
});

export type BudgetRecommendations = z.infer<typeof budgetRecommendationsSchema>;
