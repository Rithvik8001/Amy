import { z } from "zod";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  cost: z.number().positive("Cost must be a positive number"),
  billingCycle: z.enum(["monthly", "yearly"], {
    message: "Billing cycle must be 'monthly' or 'yearly'",
  }),
  nextBillingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  category: z.string().max(100, "Category is too long").optional(),
  status: z.enum(["active", "cancelled", "paused"]).default("active"),
  paymentMethod: z.string().max(100, "Payment method is too long").optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const updateSubscriptionSchema = createSubscriptionSchema
  .partial()
  .extend({
    name: z
      .string()
      .min(1, "Name is required")
      .max(255, "Name is too long")
      .optional(),
    cost: z.number().positive("Cost must be a positive number").optional(),
    billingCycle: z
      .enum(["monthly", "yearly"], {
        message: "Billing cycle must be 'monthly' or 'yearly'",
      })
      .optional(),
    nextBillingDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
  });

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
