import * as React from "react";
import { format } from "date-fns";

interface RenewalReminderEmailProps {
  firstName: string;
  subscriptions: Array<{
    name: string;
    cost: string;
    nextBillingDate: string;
    billingCycle: string;
  }>;
  daysUntil: number;
}

export function RenewalReminderEmail({
  firstName,
  subscriptions,
  daysUntil,
}: RenewalReminderEmailProps) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Upcoming Renewals Reminder
      </h1>
      <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#333", marginBottom: "24px" }}>
        Hi {firstName}, you have {subscriptions.length} subscription{subscriptions.length !== 1 ? "s" : ""} renewing in the next {daysUntil} day{daysUntil !== 1 ? "s" : ""}:
      </p>
      <div style={{ marginBottom: "24px" }}>
        {subscriptions.map((sub, index) => (
          <div
            key={index}
            style={{
              padding: "16px",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "18px", marginBottom: "8px" }}>
              {sub.name}
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginBottom: "4px" }}>
              ${parseFloat(sub.cost).toFixed(2)} / {sub.billingCycle}
            </div>
            <div style={{ color: "#666", fontSize: "14px" }}>
              Renews: {format(new Date(sub.nextBillingDate), "MMM dd, yyyy")}
            </div>
          </div>
        ))}
      </div>
      <a
        href="https://amy.app/dashboard"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#9d6b3a",
          color: "white",
          textDecoration: "none",
          borderRadius: "6px",
          fontWeight: "500",
        }}
      >
        View Dashboard
      </a>
    </div>
  );
}

