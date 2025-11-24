import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { generateIcsFile } from "@/lib/calendar-utils";
import { getUserCurrency } from "@/lib/user-settings";
import { autoRenewPastDueSubscriptions } from "@/lib/subscription-utils";

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

    userSubscriptions = await autoRenewPastDueSubscriptions(
      userSubscriptions,
      userId
    );

    const currency = await getUserCurrency(userId);

    const subscriptionData = userSubscriptions.map((sub) => ({
      id: sub.id,
      name: sub.name,
      cost: sub.cost,
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate,
      category: sub.category,
      paymentMethod: sub.paymentMethod,
      status: sub.status,
    }));

    const icsContent = generateIcsFile(subscriptionData, currency);

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const filename = `amy-subscriptions-${dateStr}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting calendar:", error);
    return NextResponse.json(
      {
        error: "Failed to export calendar",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
