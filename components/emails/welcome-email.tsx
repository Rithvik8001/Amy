import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
}

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
      >
        Welcome to Amy, {firstName}! 👋
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "16px",
        }}
      >
        Thanks for signing up! We&apos;re excited to help you keep track of all
        your subscriptions in one place.
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "24px",
        }}
      >
        Get started by adding your first subscription to see how much
        you&apos;re spending and when your next renewals are due.
      </p>
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
        Go to Dashboard
      </a>
    </div>
  );
}
