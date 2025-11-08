"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, CreditCard } from "lucide-react";

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

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-center">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              No subscriptions yet
            </p>
            <p className="text-muted-foreground text-sm">
              Add your first subscription to get started
            </p>
          </div>
        </CardContent>
      </Card>
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
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {subscription.name}
                </CardTitle>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant={getStatusColor(subscription.status)}>
                    {subscription.status}
                  </Badge>
                  {subscription.category && (
                    <Badge variant="outline">{subscription.category}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {formatCurrency(subscription.cost)}
                </div>
                <div className="text-sm text-muted-foreground">
                  /{subscription.billingCycle}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Next billing:{" "}
                  {format(
                    new Date(subscription.nextBillingDate),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
              {subscription.paymentMethod && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>{subscription.paymentMethod}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
