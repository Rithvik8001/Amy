import { formatCurrency } from "@/lib/currency-utils";

export function getBudgetAlertEmailHtml(
  firstName: string | null,
  budgetType: "monthly" | "yearly",
  spent: number,
  budget: number,
  percentage: number,
  status: "approaching" | "exceeded" | "projected_exceed",
  currency: string = "USD",
  dashboardUrl: string,
  projectedSpending?: number
): string {
  const displayName = firstName || "there";
  const formattedSpent = formatCurrency(spent, currency);
  const formattedBudget = formatCurrency(budget, currency);
  const formattedPercentage = percentage.toFixed(1);
  const periodText = budgetType === "monthly" ? "month" : "year";

  let subjectText = "";
  let statusText = "";
  let messageText = "";
  let progressBarColor = "#f59e0b";

  if (status === "exceeded") {
    subjectText = "Budget Exceeded";
    statusText = "You've exceeded your budget";
    messageText = `You've spent ${formattedSpent} of your ${periodText}ly budget of ${formattedBudget} (${formattedPercentage}%).`;
    progressBarColor = "#ef4444";
  } else if (status === "approaching") {
    subjectText = "Budget Alert";
    statusText = "You're approaching your budget";
    messageText = `You've spent ${formattedSpent} of your ${periodText}ly budget of ${formattedBudget} (${formattedPercentage}%).`;
    progressBarColor = "#f59e0b";
  } else if (status === "projected_exceed" && projectedSpending) {
    const formattedProjected = formatCurrency(projectedSpending, currency);
    subjectText = "Projected Budget Alert";
    statusText = "You're on track to exceed your budget";
    messageText = `Based on your current spending rate, you're projected to spend ${formattedProjected} this ${periodText}, which exceeds your budget of ${formattedBudget}.`;
    progressBarColor = "#f59e0b";
  }

  const progressWidth = Math.min(percentage, 100);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectText} - Amy</title>
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
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">${subjectText}</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                ${messageText}
              </p>
              
              <!-- Budget Progress Bar -->
              <div style="margin: 24px 0; background-color: #f3f4f6; border-radius: 8px; height: 24px; overflow: hidden; position: relative;">
                <div style="background-color: ${progressBarColor}; height: 100%; width: ${progressWidth}%; transition: width 0.3s ease;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 12px; font-weight: 600; color: ${
                  percentage > 50 ? "#ffffff" : "#000000"
                };">
                  ${formattedPercentage}%
                </div>
              </div>
              
              <!-- Budget Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                    <span style="font-size: 14px; color: #666666;">Spent:</span>
                    <span style="font-size: 16px; font-weight: 600; color: #000000; float: right;">${formattedSpent}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
                    <span style="font-size: 14px; color: #666666;">Budget:</span>
                    <span style="font-size: 16px; font-weight: 600; color: #000000; float: right;">${formattedBudget}</span>
                  </td>
                </tr>
                ${
                  status === "exceeded"
                    ? `
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="font-size: 14px; color: #666666;">Over Budget:</span>
                    <span style="font-size: 16px; font-weight: 600; color: #ef4444; float: right;">${formatCurrency(
                      spent - budget,
                      currency
                    )}</span>
                  </td>
                </tr>
                `
                    : `
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="font-size: 14px; color: #666666;">Remaining:</span>
                    <span style="font-size: 16px; font-weight: 600; color: #000000; float: right;">${formatCurrency(
                      budget - spent,
                      currency
                    )}</span>
                  </td>
                </tr>
                `
                }
              </table>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Review your subscriptions and spending in your dashboard to stay on track.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 0 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">
                      View Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #e8e8e8;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This is an automated alert from Amy. You can manage your budget settings in your dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
