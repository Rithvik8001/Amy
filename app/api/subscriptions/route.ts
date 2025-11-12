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
import { autoRenewPastDueSubscriptions } from "@/lib/subscription-utils";
import { checkAndSendBudgetAlerts } from "@/lib/budget-alerts";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(asc(subscriptions.nextBillingDate));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDueSubscriptions = userSubscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate < today;
    });

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

    userSubscriptions = await autoRenewPastDueSubscriptions(
      userSubscriptions,
      userId
    );

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
      icon,
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
        icon: icon || null,
      })
      .returning();

    const createdSubscription = newSubscription[0];

    if (status === "active") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      const oneDayFromNow = new Date(today);
      oneDayFromNow.setDate(today.getDate() + 1);

      const billingDate = parseLocalDate(nextBillingDate);

      if (billingDate.getTime() === threeDaysFromNow.getTime()) {
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

      if (billingDate.getTime() === oneDayFromNow.getTime()) {
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

    checkAndSendBudgetAlerts(userId).catch((error) => {
      console.error(
        "Error checking budget alerts after subscription creation (non-blocking):",
        error
      );
    });

    return NextResponse.json(createdSubscription, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
