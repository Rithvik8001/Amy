"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, CreditCard } from "lucide-react";
import EditSubscriptionDialog from "./edit-subscription-dialog";
import DeleteSubscriptionDialog from "./delete-subscription-dialog";

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
  createdAt: Date | string;
  updatedAt: Date | string;
};

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }
      const data = await response.json();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-muted/30 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-lg mb-1">
          No subscriptions yet
        </p>
        <p className="text-muted-foreground text-sm">
          Add your first subscription to get started
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "cancelled":
        return "destructive";
      case "paused":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="group py-4 hover:bg-muted/20 transition-colors rounded-lg px-2 -mx-2 cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold truncate">
                  {subscription.name}
                </h3>
                <Badge
                  variant={getStatusColor(subscription.status)}
                  className="text-xs shrink-0"
                >
                  {subscription.status}
                </Badge>
                {subscription.category && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {subscription.category}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {format(
                      new Date(subscription.nextBillingDate),
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
                {subscription.paymentMethod && (
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{subscription.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xl font-semibold">
                  {formatCurrency(subscription.cost)}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{subscription.billingCycle}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditSubscriptionDialog
                  subscription={subscription}
                  onSuccess={fetchSubscriptions}
                />
                <DeleteSubscriptionDialog
                  subscription={subscription}
                  onSuccess={fetchSubscriptions}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
