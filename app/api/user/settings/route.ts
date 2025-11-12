import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserCurrency, setUserCurrency } from "@/lib/user-settings";
import { updateCurrencySchema } from "@/lib/validations/currency";

/**
 * GET /api/user/settings
 * Fetch user's currency preference (defaults to USD if not set)
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currency = await getUserCurrency(userId);

    return NextResponse.json({ currency });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings
 * Update user's currency preference
 */
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
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

    const { currency } = validationResult.data;

    // Update user currency
    await setUserCurrency(userId, currency);

    return NextResponse.json({ currency });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}

