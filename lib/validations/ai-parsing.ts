import { z } from "zod";

/**
 * Schema for AI to parse natural language subscription descriptions
 * All fields are optional to allow partial parsing
 */
export const aiParsedSubscriptionSchema = z.object({
  name: z.string().optional().describe("The subscription service name"),
  cost: z
    .number()
    .optional()
    .describe("The monthly cost (convert yearly to monthly by dividing by 12)"),
  billingCycle: z
    .enum(["monthly", "yearly"])
    .optional()
    .describe("The billing frequency"),
  nextBillingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional()
    .describe(
      "Next billing/renewal date in YYYY-MM-DD format. Extract from text if mentioned (e.g., 'nov 22nd', 'November 22', '11/22', '2025-11-22'). If no date is mentioned, omit this field."
    ),
  category: z.string().optional().describe("Category from available options"),
  paymentMethod: z
    .string()
    .optional()
    .describe(
      "Payment method if mentioned (e.g., Credit Card, PayPal, Apple Pay)"
    ),
  icon: z
    .string()
    .optional()
    .describe(
      "Simple Icons identifier if it's a well-known service (e.g., 'netflix', 'spotify')"
    ),
});

export type AIParsedSubscription = z.infer<typeof aiParsedSubscriptionSchema>;

