"use client";

import { useEffect } from "react";
import { updateAppBadge } from "@/lib/pwa-badge";
import { parseLocalDate } from "@/lib/date-utils";

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

export function useAppBadge(subscriptions: Subscription[] | null) {
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      updateAppBadge(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = subscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate < today;
    }).length;

    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    const upcomingCount = subscriptions.filter((sub) => {
      if (sub.status !== "active") return false;
      const billingDate = parseLocalDate(sub.nextBillingDate);
      return billingDate >= today && billingDate <= next7Days;
    }).length;

    const totalCount = overdueCount + upcomingCount;
    updateAppBadge(totalCount);
  }, [subscriptions]);
}
