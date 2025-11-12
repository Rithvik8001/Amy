/**
 * Supported currencies with their display names and symbols
 */
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

/**
 * Get list of supported currencies
 */
export function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: string): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  return currencyInfo?.symbol || "$";
}

/**
 * Get default currency (USD)
 */
export function getDefaultCurrency(): string {
  return "USD";
}

/**
 * Format amount as currency using Intl.NumberFormat
 * @param amount - Amount to format (number)
 * @param currency - ISO currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  // Validate currency code
  const isValidCurrency = SUPPORTED_CURRENCIES.some((c) => c.code === currency);
  const currencyCode = isValidCurrency ? currency : "USD";

  try {
    // Use Intl.NumberFormat for proper locale-aware formatting
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback to simple formatting if Intl fails
    console.error(`Error formatting currency ${currencyCode}:`, error);
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format currency for display in selectors (e.g., "USD - $")
 */
export function formatCurrencyForDisplay(currency: string): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  if (currencyInfo) {
    return `${currencyInfo.code} - ${currencyInfo.symbol}`;
  }
  return currency;
}

