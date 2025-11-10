import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";
import {
  sendRenewalReminderEmail,
  sendPriceChangeEmail,
  sendRenewalReminder1DayEmail,
} from "@/lib/email";
import { parseLocalDate } from "@/lib/date-utils";

// GET /api/subscriptions/[id] - Get single subscription
export async function GET(
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

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription[0]);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions/[id] - Update subscription
export async function PUT(
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

    const oldSubscription = existingSubscription[0];
    const oldCost = oldSubscription.cost;
    const oldNextBillingDate = oldSubscription.nextBillingDate;
    const oldStatus = oldSubscription.status;

    const body = await request.json();

    if (Object.keys(body).length === 0) {
      return NextResponse.json(existingSubscription[0]);
    }

    const validationResult = updateSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    const updateValues: Record<string, unknown> = {};

    if (updateData.name !== undefined) updateValues.name = updateData.name;
    if (updateData.cost !== undefined)
      updateValues.cost = updateData.cost.toString();
    if (updateData.billingCycle !== undefined)
      updateValues.billingCycle = updateData.billingCycle;
    if (updateData.nextBillingDate !== undefined)
      updateValues.nextBillingDate = updateData.nextBillingDate;
    if (updateData.category !== undefined)
      updateValues.category = updateData.category || null;
    if (updateData.status !== undefined)
      updateValues.status = updateData.status;
    if (updateData.paymentMethod !== undefined)
      updateValues.paymentMethod = updateData.paymentMethod || null;
    if (updateData.icon !== undefined)
      updateValues.icon = updateData.icon || null;

    // Only update updatedAt if there are actual changes
    if (Object.keys(updateValues).length === 0) {
      // No changes, return existing subscription
      return NextResponse.json(existingSubscription[0]);
    }

    const updatedSubscription = await db
      .update(subscriptions)
      .set({
        ...updateValues,
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

    const updatedSub = updatedSubscription[0];

    // Check for price change and send email if needed
    if (
      updateData.cost !== undefined &&
      oldStatus === "active" &&
      updatedSub.status === "active"
    ) {
      const newCost = updatedSub.cost;
      if (oldCost !== newCost) {
        // Price changed - send email (non-blocking)
        sendPriceChangeEmail(
          userId,
          {
            id: updatedSub.id,
            userId: updatedSub.userId,
            name: updatedSub.name,
            cost: updatedSub.cost,
            billingCycle: updatedSub.billingCycle,
            nextBillingDate: updatedSub.nextBillingDate,
            status: updatedSub.status,
          },
          oldCost,
          newCost
        ).catch((error) => {
          console.error(
            "Error sending price change email (non-blocking):",
            error
          );
        });
      }
    }

    // Check if renewal reminder should be sent (3 days or 1 day before due date)
    const finalNextBillingDate =
      updateData.nextBillingDate !== undefined
        ? updateData.nextBillingDate
        : oldNextBillingDate;
    const finalStatus =
      updateData.status !== undefined ? updatedSub.status : oldStatus;

    if (finalStatus === "active") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      const oneDayFromNow = new Date(today);
      oneDayFromNow.setDate(today.getDate() + 1);

      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(finalNextBillingDate);

      // Check if billing date is exactly 3 days away
      if (billingDate.getTime() === threeDaysFromNow.getTime()) {
        // Send renewal reminder email (non-blocking)
        sendRenewalReminderEmail(userId, {
          id: updatedSub.id,
          userId: updatedSub.userId,
          name: updatedSub.name,
          cost: updatedSub.cost,
          billingCycle: updatedSub.billingCycle,
          nextBillingDate: finalNextBillingDate,
          status: updatedSub.status,
        }).catch((error) => {
          console.error(
            "Error sending renewal reminder email (non-blocking):",
            error
          );
        });
      }

      // Check if billing date is exactly 1 day away
      if (billingDate.getTime() === oneDayFromNow.getTime()) {
        // Send 1-day renewal reminder email (non-blocking)
        sendRenewalReminder1DayEmail(userId, {
          id: updatedSub.id,
          userId: updatedSub.userId,
          name: updatedSub.name,
          cost: updatedSub.cost,
          billingCycle: updatedSub.billingCycle,
          nextBillingDate: finalNextBillingDate,
          status: updatedSub.status,
        }).catch((error) => {
          console.error(
            "Error sending 1-day renewal reminder email (non-blocking):",
            error
          );
        });
      }
    }

    return NextResponse.json(updatedSub);
  } catch (error) {
    console.error("Error updating subscription:", error);

    // Provide more detailed error information
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "Unknown error";

    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "Failed to update subscription",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" && errorStack
          ? { stack: errorStack }
          : {}),
      },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
export async function DELETE(
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

    // Check if subscription exists and belongs to user
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

    await db
      .delete(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.userId, userId)
        )
      );

    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
