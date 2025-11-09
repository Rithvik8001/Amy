import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  console.log("Webhook received");

  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  console.log("Webhook headers:", {
    hasSvixId: !!svix_id,
    hasSvixTimestamp: !!svix_timestamp,
    hasSvixSignature: !!svix_signature,
    hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
  });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers");
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return new Response("Error occurred -- webhook secret not configured", {
      status: 500,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    console.log("Webhook verified successfully. Event type:", evt.type);
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log("Processing event:", eventType);

  if (eventType === "user.created") {
    const { email_addresses, first_name, last_name, id } = evt.data;

    // Get the primary email address
    const primaryEmail = email_addresses?.[0]?.email_address;
    const firstName = first_name || last_name || "User";

    console.log("User created event:", {
      userId: id,
      email: primaryEmail,
      firstName,
    });

    // User created successfully - Clerk handles email verification
    // No additional email sending needed
  }

  return new Response("", { status: 200 });
}
