import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "../currency-utils";
import { budgetSchema } from "./budget";

const currencyCodes = SUPPORTED_CURRENCIES.map((c) => c.code) as [
  string,
  ...string[]
];

export const currencySchema = z.enum(currencyCodes as [string, ...string[]], {
  message: "Invalid currency code",
});

export const updateCurrencySchema = z
  .object({
    currency: currencySchema.optional(),
  })
  .merge(budgetSchema);

export type UpdateCurrencyInput = z.infer<typeof updateCurrencySchema>;
