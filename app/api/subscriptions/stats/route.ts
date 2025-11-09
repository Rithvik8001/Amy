import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/config";
import { subscriptions } from "@/db/models/subscriptions";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active subscriptions for the user
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    // Calculate total monthly spending (only active subscriptions)
    const activeSubscriptions = userSubscriptions.filter(
      (sub) => sub.status === "active"
    );

    let totalMonthly = 0;
    let totalYearly = 0;

    activeSubscriptions.forEach((sub) => {
      const cost = parseFloat(sub.cost);
      if (sub.billingCycle === "monthly") {
        totalMonthly += cost;
      } else if (sub.billingCycle === "yearly") {
        totalYearly += cost;
      }
    });

    // Total yearly spending = (monthly subscriptions × 12) + yearly subscriptions
    const totalYearlySpending = totalMonthly * 12 + totalYearly;

    // Calculate upcoming renewals
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const upcoming7Days = activeSubscriptions.filter((sub) => {
      const billingDate = new Date(sub.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);
      return billingDate >= today && billingDate <= next7Days;
    });

    const upcoming30Days = activeSubscriptions.filter((sub) => {
      const billingDate = new Date(sub.nextBillingDate);
      billingDate.setHours(0, 0, 0, 0);
      return billingDate >= today && billingDate <= next30Days;
    });

    // Calculate spending by category
    const categoryBreakdown: Record<string, number> = {};
    activeSubscriptions.forEach((sub) => {
      const category = sub.category || "Uncategorized";
      const cost = parseFloat(sub.cost);
      const monthlyCost = sub.billingCycle === "monthly" ? cost : cost / 12;

      if (categoryBreakdown[category]) {
        categoryBreakdown[category] += monthlyCost;
      } else {
        categoryBreakdown[category] = monthlyCost;
      }
    });

    // Convert category breakdown to array format
    const categoryStats = Object.entries(categoryBreakdown).map(
      ([category, monthlySpending]) => ({
        category,
        monthlySpending: parseFloat(monthlySpending.toFixed(2)),
      })
    );

    // Sort by spending (descending)
    categoryStats.sort((a, b) => b.monthlySpending - a.monthlySpending);

    return NextResponse.json({
      totalMonthly: parseFloat(totalMonthly.toFixed(2)),
      totalYearly: parseFloat(totalYearlySpending.toFixed(2)),
      totalActiveSubscriptions: activeSubscriptions.length,
      upcomingRenewals: {
        next7Days: upcoming7Days.length,
        next30Days: upcoming30Days.length,
        items: upcoming7Days.map((sub) => ({
          id: sub.id,
          name: sub.name,
          cost: sub.cost,
          billingCycle: sub.billingCycle,
          nextBillingDate: sub.nextBillingDate,
          category: sub.category,
        })),
      },
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription stats" },
      { status: 500 }
    );
  }
}
