import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const headerPayload = await headers();
    const signature = headerPayload.get("resend-signature");

    if (!signature) {
      console.error("Missing Resend signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!process.env.RESEND_WEBHOOK_SECRET) {
      console.error("RESEND_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    const body = await req.text();
    const payload = JSON.parse(body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RESEND_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    const signatureParts = signature.split(",");
    const signatureHash = signatureParts
      .find((part) => part.startsWith("v1="))
      ?.split("=")[1];

    if (signatureHash !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = payload.type;
    console.log("Resend webhook event:", eventType, payload);

    const emailId = payload.data?.email_id || payload.email_id;

    if (!emailId) {
      console.warn("No email ID found in webhook payload");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    switch (eventType) {
      case "email.sent":
        console.log(`Email ${emailId} sent successfully`);
        break;

      case "email.delivered":
        console.log(`Email ${emailId} delivered`);
        break;

      case "email.bounced":
      case "email.complained":
        console.warn(`Email ${emailId} ${eventType}`);
        break;

      case "email.opened":
        console.log(`Email ${emailId} opened`);
        break;

      case "email.clicked":
        console.log(`Email ${emailId} link clicked`);
        break;

      default:
        console.log(`Unhandled Resend event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Resend webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
