import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  setUserCurrency,
  getUserBudgetSettings,
  setUserBudgetSettings,
} from "@/lib/user-settings";
import { updateCurrencySchema } from "@/lib/validations/currency";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getUserBudgetSettings(userId);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validationResult = updateCurrencySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { currency, monthlyBudget, yearlyBudget, budgetAlertThreshold } =
      validationResult.data;

    if (currency !== undefined) {
      await setUserCurrency(userId, currency);
    }

    if (
      monthlyBudget !== undefined ||
      yearlyBudget !== undefined ||
      budgetAlertThreshold !== undefined
    ) {
      await setUserBudgetSettings(
        userId,
        monthlyBudget ?? undefined,
        yearlyBudget ?? undefined,
        budgetAlertThreshold
      );
    }

    const updatedSettings = await getUserBudgetSettings(userId);

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
