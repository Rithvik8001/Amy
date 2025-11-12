import { z } from "zod";

export const budgetSchema = z.object({
  monthlyBudget: z
    .number()
    .positive("Monthly budget must be a positive number")
    .max(9999999.99, "Monthly budget is too large")
    .optional()
    .nullable(),
  yearlyBudget: z
    .number()
    .positive("Yearly budget must be a positive number")
    .max(9999999.99, "Yearly budget is too large")
    .optional()
    .nullable(),
  budgetAlertThreshold: z
    .number()
    .min(50, "Alert threshold must be at least 50%")
    .max(100, "Alert threshold must be at most 100%")
    .optional(),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
