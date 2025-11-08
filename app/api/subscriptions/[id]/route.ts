import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { updateSubscriptionSchema } from "@/lib/validations/subscription";

// GET /api/subscriptions/[id] - Get single subscription
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, parseInt(params.id)),
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
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if subscription exists and belongs to user
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, parseInt(params.id)),
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

    const body = await request.json();

    // If no fields to update, return existing subscription
    if (Object.keys(body).length === 0) {
      return NextResponse.json(existingSubscription[0]);
    }

    // Validate request body with Zod
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

    // Build update object (only include provided fields)
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
          eq(subscriptions.id, parseInt(params.id)),
          eq(subscriptions.userId, userId)
        )
      )
      .returning();

    return NextResponse.json(updatedSubscription[0]);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      {
        error: "Failed to update subscription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if subscription exists and belongs to user
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, parseInt(params.id)),
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
          eq(subscriptions.id, parseInt(params.id)),
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
