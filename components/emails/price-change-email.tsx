export function getPriceChangeEmailHtml(
  firstName: string | null,
  subscriptionName: string,
  oldCost: string,
  newCost: string,
  billingCycle: string,
  dashboardUrl: string
): string {
  const displayName = firstName || "there";
  const formattedOldCost = `$${parseFloat(oldCost).toFixed(2)}`;
  const formattedNewCost = `$${parseFloat(newCost).toFixed(2)}`;
  const costDifference = parseFloat(newCost) - parseFloat(oldCost);
  const isIncrease = costDifference > 0;
  const formattedDifference = `$${Math.abs(costDifference).toFixed(2)}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Change Alert - Amy</title>
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
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">Price Change Alert</h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #000000;">
                We noticed that the price for your subscription <strong>${subscriptionName}</strong> has changed.
              </p>
              
              <!-- Price Comparison -->
              <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <strong style="font-size: 18px; color: #000000;">${subscriptionName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 14px; color: #707070; width: 50%;">Previous Price:</td>
                          <td style="font-size: 16px; color: #000000; text-align: right;"><strong>${formattedOldCost}</strong> / ${billingCycle}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 12px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 14px; color: #707070; width: 50%;">New Price:</td>
                          <td style="font-size: 16px; color: #000000; text-align: right;"><strong>${formattedNewCost}</strong> / ${billingCycle}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px; border-top: 1px solid #e0e0e0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size: 14px; color: #707070; width: 50%;">Change:</td>
                          <td style="font-size: 16px; color: ${
                            isIncrease ? "#d32f2f" : "#2e7d32"
                          }; text-align: right;">
                            <strong>${
                              isIncrease ? "+" : "-"
                            }${formattedDifference}</strong> / ${billingCycle}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">View Subscription</a>
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
