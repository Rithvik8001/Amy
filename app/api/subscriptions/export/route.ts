import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";
import { getUserCurrency } from "@/lib/user-settings";
import { formatSubscriptionCsv } from "@/lib/csv-utils";
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

    const csvContent = formatSubscriptionCsv(userSubscriptions, currency);

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const filename = `amy-subscriptions-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to export subscriptions" },
      { status: 500 }
    );
  }
}
