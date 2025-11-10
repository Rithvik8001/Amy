import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { calculateNextBillingDate } from "@/lib/date-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const subscriptionId = parseInt(resolvedParams.id);

    if (isNaN(subscriptionId)) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 }
      );
    }

    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      )
      .limit(1);

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const subscription = existingSubscription[0];

    if (subscription.status !== "active") {
      return NextResponse.json(
        {
          error: "Cannot renew subscription",
          details: `Only active subscriptions can be renewed. Current status: ${subscription.status}`,
        },
        { status: 400 }
      );
    }

    const nextBillingDate = calculateNextBillingDate(
      subscription.nextBillingDate,
      subscription.billingCycle
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextBillingDate);
    nextDate.setHours(0, 0, 0, 0);

    if (nextDate <= today) {
      return NextResponse.json(
        {
          error: "Invalid date calculation",
          details: "Calculated next billing date must be in the future",
        },
        { status: 400 }
      );
    }

    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        nextBillingDate,
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      )
      .returning();

    if (updatedSubscription.length === 0) {
      return NextResponse.json(
        { error: "Failed to update subscription - no rows affected" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSubscription[0]);
  } catch (error) {
    console.error("Error renewing subscription:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to renew subscription",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
