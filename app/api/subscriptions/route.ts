import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import {
  sendRenewalReminderEmail,
  sendPastDueEmail,
  sendRenewalReminder1DayEmail,
} from "@/lib/email";
import { parseLocalDate } from "@/lib/date-utils";

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

    // Check for past due subscriptions and send emails (non-blocking)
    // Past due = billing date has PASSED (not today, not tomorrow)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDueSubscriptions = userSubscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(sub.nextBillingDate);
      // Only past due if billing date is BEFORE today (has passed)
      return billingDate < today;
    });

    // Send past due emails for each subscription
    for (const subscription of pastDueSubscriptions) {
      sendPastDueEmail(userId, {
        id: subscription.id,
        userId: subscription.userId,
        name: subscription.name,
        cost: subscription.cost,
        billingCycle: subscription.billingCycle,
        nextBillingDate: subscription.nextBillingDate,
        status: subscription.status,
      }).catch((error) => {
        console.error(
          `Error sending past due email for subscription ${subscription.id} (non-blocking):`,
          error
        );
      });
    }

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

    const createdSubscription = newSubscription[0];

    // Check if renewal reminder should be sent (3 days or 1 day before due date)
    if (status === "active") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      const oneDayFromNow = new Date(today);
      oneDayFromNow.setDate(today.getDate() + 1);

      // Parse date as local date to avoid timezone issues
      const billingDate = parseLocalDate(nextBillingDate);

      // Check if billing date is exactly 3 days away
      if (billingDate.getTime() === threeDaysFromNow.getTime()) {
        // Send renewal reminder email (non-blocking)
        sendRenewalReminderEmail(userId, {
          id: createdSubscription.id,
          userId: createdSubscription.userId,
          name: createdSubscription.name,
          cost: createdSubscription.cost,
          billingCycle: createdSubscription.billingCycle,
          nextBillingDate: createdSubscription.nextBillingDate,
          status: createdSubscription.status,
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
          id: createdSubscription.id,
          userId: createdSubscription.userId,
          name: createdSubscription.name,
          cost: createdSubscription.cost,
          billingCycle: createdSubscription.billingCycle,
          nextBillingDate: createdSubscription.nextBillingDate,
          status: createdSubscription.status,
        }).catch((error) => {
          console.error(
            "Error sending 1-day renewal reminder email (non-blocking):",
            error
          );
        });
      }
    }

    return NextResponse.json(createdSubscription, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
