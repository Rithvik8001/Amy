import { NextResponse } from "next/server";
import { resend } from "@/lib/email";
import { WelcomeEmail } from "@/components/emails/welcome-email";
import { RenewalReminderEmail } from "@/components/emails/renewal-reminder-email";

// Send welcome email
export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: [email],
      subject: "Welcome to Amy!",
      react: WelcomeEmail({ firstName }),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}

// Send renewal reminder email
export async function sendRenewalReminderEmail(
  email: string,
  firstName: string,
  subscriptions: Array<{
    name: string;
    cost: string;
    nextBillingDate: string;
    billingCycle: string;
  }>,
  daysUntil: number
) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Amy <noreply@amy.bz>",
      to: [email],
      subject: `Upcoming Renewals - ${subscriptions.length} subscription${
        subscriptions.length !== 1 ? "s" : ""
      } renewing soon`,
      react: RenewalReminderEmail({ firstName, subscriptions, daysUntil }),
    });

    if (error) {
      console.error("Error sending renewal reminder:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending renewal reminder:", error);
    return { success: false, error };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, email, firstName, subscriptions, daysUntil } = body;

    if (type === "welcome") {
      const result = await sendWelcomeEmail(email, firstName);
      return NextResponse.json(result);
    }

    if (type === "renewal") {
      if (!subscriptions || !daysUntil) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      const result = await sendRenewalReminderEmail(
        email,
        firstName,
        subscriptions,
        daysUntil
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
  } catch (error) {
    console.error("Error in email API route:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
