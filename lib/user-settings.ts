import { eq } from "drizzle-orm";
import db from "@/db/config";
import { userSettings } from "@/db/models/user-settings";
import { getDefaultCurrency } from "@/lib/currency-utils";
import { sql } from "drizzle-orm";

export type UserBudgetSettings = {
  currency: string;
  monthlyBudget: number | null;
  yearlyBudget: number | null;
  budgetAlertThreshold: number;
};

/**
 * Get user's currency preference (defaults to USD if not set)
 * @param userId - Clerk user ID
 * @returns Currency code (e.g., "USD")
 */
export async function getUserCurrency(userId: string): Promise<string> {
  try {
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (settings.length === 0 || !settings[0]) {
      return getDefaultCurrency();
    }

    return settings[0].currency || getDefaultCurrency();
  } catch (error) {
    console.error("Error fetching user currency:", error);
    return getDefaultCurrency();
  }
}

/**
 * Get user's full budget settings
 * @param userId - Clerk user ID
 * @returns Full settings object including budgets
 */
export async function getUserBudgetSettings(
  userId: string
): Promise<UserBudgetSettings> {
  try {
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (settings.length === 0 || !settings[0]) {
      return {
        currency: getDefaultCurrency(),
        monthlyBudget: null,
        yearlyBudget: null,
        budgetAlertThreshold: 80,
      };
    }

    const setting = settings[0];
    return {
      currency: setting.currency || getDefaultCurrency(),
      monthlyBudget: setting.monthlyBudget
        ? parseFloat(setting.monthlyBudget)
        : null,
      yearlyBudget: setting.yearlyBudget
        ? parseFloat(setting.yearlyBudget)
        : null,
      budgetAlertThreshold: setting.budgetAlertThreshold
        ? parseFloat(setting.budgetAlertThreshold)
        : 80,
    };
  } catch (error) {
    console.error("Error fetching user budget settings:", error);
    return {
      currency: getDefaultCurrency(),
      monthlyBudget: null,
      yearlyBudget: null,
      budgetAlertThreshold: 80,
    };
  }
}

/**
 * Set or update user's currency preference
 * Creates record if doesn't exist, updates if it does
 * @param userId - Clerk user ID
 * @param currency - ISO currency code
 */
export async function setUserCurrency(
  userId: string,
  currency: string
): Promise<void> {
  try {
    // Check if user settings exist
    const existing = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userSettings)
        .set({
          currency,
          updatedAt: sql`now()`,
        })
        .where(eq(userSettings.userId, userId));
    } else {
      // Create new record
      await db.insert(userSettings).values({
        userId,
        currency,
      });
    }
  } catch (error) {
    console.error("Error setting user currency:", error);
    throw error;
  }
}

/**
 * Set or update user's budget settings
 * Creates record if doesn't exist, updates if it does
 * @param userId - Clerk user ID
 * @param monthlyBudget - Monthly budget (null to clear)
 * @param yearlyBudget - Yearly budget (null to clear)
 * @param budgetAlertThreshold - Alert threshold percentage (optional)
 */
export async function setUserBudgetSettings(
  userId: string,
  monthlyBudget?: number | null,
  yearlyBudget?: number | null,
  budgetAlertThreshold?: number
): Promise<void> {
  try {
    // Check if user settings exist
    const existing = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    const updateData: Record<string, unknown> = {
      updatedAt: sql`now()`,
    };

    if (monthlyBudget !== undefined) {
      updateData.monthlyBudget =
        monthlyBudget === null ? null : monthlyBudget.toString();
    }
    if (yearlyBudget !== undefined) {
      updateData.yearlyBudget =
        yearlyBudget === null ? null : yearlyBudget.toString();
    }
    if (budgetAlertThreshold !== undefined) {
      updateData.budgetAlertThreshold = budgetAlertThreshold.toString();
    }

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, userId));
    } else {
      // Create new record with defaults
      await db.insert(userSettings).values({
        userId,
        currency: getDefaultCurrency(),
        monthlyBudget:
          monthlyBudget !== undefined && monthlyBudget !== null
            ? monthlyBudget.toString()
            : null,
        yearlyBudget:
          yearlyBudget !== undefined && yearlyBudget !== null
            ? yearlyBudget.toString()
            : null,
        budgetAlertThreshold:
          budgetAlertThreshold !== undefined
            ? budgetAlertThreshold.toString()
            : "80.00",
      });
    }
  } catch (error) {
    console.error("Error setting user budget settings:", error);
    throw error;
  }
}

