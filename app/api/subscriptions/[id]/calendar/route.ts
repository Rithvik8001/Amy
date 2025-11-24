import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import {
  generateIcsEvent,
  generateGoogleCalendarUrl,
} from "@/lib/calendar-utils";
import { getUserCurrency } from "@/lib/user-settings";

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

    const sub = subscription[0];

    if (sub.status !== "active") {
      return NextResponse.json(
        { error: "Only active subscriptions can be added to calendar" },
        { status: 400 }
      );
    }

    const currency = await getUserCurrency(userId);

    const subscriptionData = {
      id: sub.id,
      name: sub.name,
      cost: sub.cost,
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate,
      category: sub.category,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
    };

    const icsContent = generateIcsEvent(subscriptionData, currency);
    const googleCalendarUrl = generateGoogleCalendarUrl(subscriptionData, currency);

    return NextResponse.json({
      success: true,
      icsContent,
      googleCalendarUrl,
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error("Error generating calendar event:", error);
    return NextResponse.json(
      {
        error: "Failed to generate calendar event",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

