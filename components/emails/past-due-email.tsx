export function getPastDueEmailHtml(
  firstName: string | null,
  subscriptionName: string,
  cost: string,
  billingCycle: string,
  nextBillingDate: string,
  dashboardUrl: string
): string {
  const displayName = firstName || "there";

  // Parse date as local date to avoid timezone issues
  const [year, month, day] = nextBillingDate.split("-").map(Number);
  const billingDate = new Date(year, month - 1, day);
  billingDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formattedDate = billingDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedCost = `$${parseFloat(cost).toFixed(2)}`;

  // Calculate days past due correctly using local dates
  const daysPastDue = Math.floor(
    (today.getTime() - billingDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const displayDaysPastDue = Math.max(1, daysPastDue); // At least 1 day past due
  const daysText = displayDaysPastDue === 1 ? "day" : "days";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Past Due Notification - Amy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa; color: #000000;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 32px 40px; text-align: center; border-bottom: 1px solid #e8e8e8;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 400; font-family: Georgia, serif; color: #000000;">Amy</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">Past Due Subscription</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Your subscription <strong>${subscriptionName}</strong> was due on <strong>${formattedDate}</strong> and is now ${displayDaysPastDue} ${daysText} past due.
              </p>
              
              <!-- Subscription Details -->
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <strong style="font-size: 18px; color: #000000;">${subscriptionName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; font-size: 16px; color: #707070;">
                      Amount: <strong style="color: #000000;">${formattedCost}</strong> / ${billingCycle}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size: 16px; color: #707070;">
                      Due Date: <strong style="color: #d32f2f;">${formattedDate}</strong>
                    </td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Please update your subscription or cancel it if you no longer need it.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">Manage Subscription</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #707070;">
                All your subscriptions in one place—because you're tired of surprises.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #707070;">
                <a href="${dashboardUrl}" style="color: #707070; text-decoration: underline;">Manage Subscriptions</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #707070;">
                © ${new Date().getFullYear()} Amy. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
