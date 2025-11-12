import { formatCurrency } from "./currency-utils";

type Subscription = {
  id: number;
  userId: string;
  name: string;
  cost: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  category: string | null;
  status: "active" | "cancelled" | "paused";
  paymentMethod: string | null;
  icon: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};


export function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}


function formatDate(date: Date | string): string {
  if (!date) return "";

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function formatCost(cost: string, currency: string): string {
  try {
    const costNum = parseFloat(cost);
    if (isNaN(costNum)) return "";
    return formatCurrency(costNum, currency);
  } catch {
    return cost;
  }
}


export function formatSubscriptionCsv(
  subscriptions: Subscription[],
  currency: string = "USD"
): string {
  const headers = [
    "Name",
    "Cost",
    "Billing Cycle",
    "Next Billing Date",
    "Category",
    "Status",
    "Payment Method",
    "Created At",
    "Updated At",
  ];

  const headerRow = headers.map(escapeCsvField).join(",");

  const dataRows = subscriptions.map((sub) => {
    const row = [
      escapeCsvField(sub.name),
      escapeCsvField(formatCost(sub.cost, currency)),
      escapeCsvField(capitalize(sub.billingCycle)),
      escapeCsvField(formatDate(sub.nextBillingDate)),
      escapeCsvField(sub.category || ""),
      escapeCsvField(capitalize(sub.status)),
      escapeCsvField(sub.paymentMethod || ""),
      escapeCsvField(formatDate(sub.createdAt)),
      escapeCsvField(formatDate(sub.updatedAt)),
    ];
    return row.join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}
