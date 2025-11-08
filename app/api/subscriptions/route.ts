import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { createSubscriptionSchema } from "@/lib/validations/subscription";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(asc(subscriptions.nextBillingDate));

    return NextResponse.json(userSubscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = createSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      cost,
      billingCycle,
      nextBillingDate,
      category,
      status,
      paymentMethod,
    } = validationResult.data;

    const newSubscription = await db
      .insert(subscriptions)
      .values({
        userId,
        name,
        cost: cost.toString(),
        billingCycle,
        nextBillingDate,
        category: category || null,
        status,
        paymentMethod: paymentMethod || null,
      })
      .returning();

    return NextResponse.json(newSubscription[0], { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
