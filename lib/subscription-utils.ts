import { eq, and, sql, inArray } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions, type Subscription } from "@/db/models/subscriptions";
import { parseLocalDate, calculateNextBillingDate } from "@/lib/date-utils";

export async function autoRenewPastDueSubscriptions(
  subscriptionsList: Subscription[],
  userId: string
): Promise<Subscription[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for active subscriptions with past due dates
    const pastDueSubscriptions = subscriptionsList.filter((sub) => {
      if (sub.status !== "active") return false;
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate < today;
    });

    if (pastDueSubscriptions.length === 0) {
      return subscriptionsList;
    }

    // Calculate next billing dates for all past due subscriptions
    const updates = pastDueSubscriptions.map((sub) => ({
      id: sub.id,
      nextBillingDate: calculateNextBillingDate(
        sub.nextBillingDate,
        sub.billingCycle
      ),
    }));

    // Batch update subscriptions
    const subscriptionIds = updates.map((u) => u.id);

    // Update each subscription individually to ensure proper date calculation
    for (const update of updates) {
      await db
        .update(subscriptions)
        .set({
          nextBillingDate: update.nextBillingDate,
          updatedAt: sql`now()`,
        })
        .where(
          and(eq(subscriptions.id, update.id), eq(subscriptions.userId, userId))
        );
    }

    // Fetch updated subscriptions from database
    const updatedSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          inArray(subscriptions.id, subscriptionIds)
        )
      );

    // Create a map of updated subscriptions
    const updatedMap = new Map(
      updatedSubscriptions.map((sub) => [sub.id, sub])
    );

    // Merge updated subscriptions back into original list
    const result = subscriptionsList.map((sub) => {
      const updated = updatedMap.get(sub.id);
      return updated ?? sub;
    });

    console.log(
      `Auto-renewed ${pastDueSubscriptions.length} subscription(s) for user ${userId}`
    );

    return result;
  } catch (error) {
    console.error("Error auto-renewing past due subscriptions:", error);
    // Return original list if update fails (non-blocking)
    return subscriptionsList;
  }
}
