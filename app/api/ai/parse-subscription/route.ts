import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { getCategories } from "@/lib/subscription-templates";
import { aiParsedSubscriptionSchema } from "@/lib/validations/ai-parsing";
import { checkRateLimit, recordAiRequest } from "@/lib/rate-limit";
import { validateAiInput } from "@/lib/content-validation";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check rate limit before processing
    const rateLimit = await checkRateLimit(userId, "parse-subscription");
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil(
        (rateLimit.resetAt.getTime() - Date.now()) / 1000
      );
      
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've exceeded the limit of 25 requests per hour. Please try again later.`,
          retryAfter,
          resetAt: rateLimit.resetAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": "25",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text input is required" },
        { status: 400 }
      );
    }

    // Validate content for malicious patterns
    const validation = validateAiInput(text);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid input",
          message: validation.error || "Input contains prohibited content or exceeds maximum length.",
        },
        { status: 400 }
      );
    }

    const categories = getCategories();
    const categoriesList = categories.join(", ");

    const model = openai("gpt-4o-mini");

    // Get current year for date parsing
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const { object } = await generateObject({
      model,
      schema: aiParsedSubscriptionSchema,
      prompt: `Parse the following user input about a subscription and extract structured data.

User input: "${text}"

Current date context: Today is ${currentYear}-${currentMonth
        .toString()
        .padStart(2, "0")}-${new Date()
        .getDate()
        .toString()
        .padStart(2, "0")} (Year: ${currentYear}, Month: ${currentMonth})

Instructions:
- Extract the subscription name (e.g., "Netflix", "Spotify Premium")
- Extract the cost amount. If yearly cost is mentioned, convert to monthly by dividing by 12
- Determine billing cycle (monthly or yearly). If ambiguous, default to monthly
- Extract next billing/renewal date if mentioned. Parse dates like "nov 22nd", "November 22", "11/22", "2025-11-22" and convert to YYYY-MM-DD format.
  IMPORTANT: If no year is specified in the date, ALWAYS use ${currentYear} (the current year). For example:
  - "nov 22nd" → "2025-11-22" (assuming current year is ${currentYear})
  - "November 22" → "2025-11-22"
  - "12/15" → "2025-12-15"
  - If a past date in the current year has already passed, assume it's for next year
  - If no date is mentioned at all, omit this field
- Categorize from these options: ${categoriesList}
- Extract payment method if mentioned (e.g., "Credit Card", "PayPal", "Apple Pay")
- Suggest an icon identifier if it's a well-known service (use lowercase, e.g., "netflix", "spotify", "youtube")

Examples:
- "I pay $15.99 monthly for Netflix" → name: "Netflix", cost: 15.99, billingCycle: "monthly", category: "Streaming", icon: "netflix"
- "$120/year for Adobe Creative Cloud, renews on Dec 15" → name: "Adobe Creative Cloud", cost: 10.00, billingCycle: "yearly", category: "Software", icon: "adobe", nextBillingDate: "${currentYear}-12-15"
- "Spotify Premium $10.99 per month, next payment nov 22nd" → name: "Spotify Premium", cost: 10.99, billingCycle: "monthly", category: "Music", icon: "spotify", nextBillingDate: "${currentYear}-11-22"

If any information is missing or unclear, omit that field. Only extract what you can confidently determine from the input.`,
    });

    // Determine missing fields
    const requiredFields: string[] = [];
    const optionalFields: string[] = [];

    if (!object.name) requiredFields.push("name");
    if (!object.cost) requiredFields.push("cost");
    if (!object.billingCycle) requiredFields.push("billingCycle");

    if (!object.category) optionalFields.push("category");
    if (!object.paymentMethod) optionalFields.push("paymentMethod");
    if (!object.icon) optionalFields.push("icon");
    if (!object.nextBillingDate) optionalFields.push("nextBillingDate");

    // Validate cost is positive if provided
    if (object.cost !== undefined && object.cost <= 0) {
      return NextResponse.json(
        { error: "Cost must be a positive number" },
        { status: 400 }
      );
    }

    // Record successful request (non-blocking)
    recordAiRequest(userId, "parse-subscription", text.length).catch(
      (error) => {
        console.error("Error recording AI request:", error);
      }
    );

    // Calculate remaining requests for headers
    const updatedRateLimit = await checkRateLimit(userId, "parse-subscription");
    const remaining = updatedRateLimit.remaining - 1; // Subtract 1 for this request

    return NextResponse.json(
      {
        success: true,
        data: object,
        missingFields: {
          required: requiredFields,
          optional: optionalFields,
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": "25",
          "X-RateLimit-Remaining": Math.max(0, remaining).toString(),
          "X-RateLimit-Reset": updatedRateLimit.resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Error parsing subscription with AI:", error);
    return NextResponse.json(
      {
        error: "Failed to parse subscription",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
