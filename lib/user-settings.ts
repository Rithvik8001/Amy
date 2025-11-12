import { eq } from "drizzle-orm";
import db from "@/db/config";
import { userSettings } from "@/db/models/user-settings";
import { getDefaultCurrency } from "@/lib/currency-utils";
import { sql } from "drizzle-orm";

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

