import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "../currency-utils";

const currencyCodes = SUPPORTED_CURRENCIES.map((c) => c.code) as [string, ...string[]];

/**
 * Zod schema for currency validation
 */
export const currencySchema = z.enum(currencyCodes as [string, ...string[]], {
  errorMap: () => ({ message: "Invalid currency code" }),
});

/**
 * Schema for updating user currency settings
 */
export const updateCurrencySchema = z.object({
  currency: currencySchema,
});

export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>;

