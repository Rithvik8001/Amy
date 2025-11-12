"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import EditSubscriptionDialog from "./edit-subscription-dialog";
import DeleteSubscriptionDialog from "./delete-subscription-dialog";
import SubscriptionFilters from "./subscription-filters";
import { motion, AnimatePresence } from "motion/react";
import { SubscriptionIcon } from "./subscription-icon";
import { parseLocalDate } from "@/lib/date-utils";
import { useAppBadge } from "@/hooks/use-app-badge";
import { formatCurrency } from "@/lib/currency-utils";

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

type SortOption = "name" | "cost-asc" | "cost-desc" | "date-asc" | "date-desc";

type FilterValues = {
  search: string;
  status: "all" | "active" | "cancelled" | "paused";
  category: string;
  billingCycle: "all" | "monthly" | "yearly";
  sort: SortOption;
};

export default function SubscriptionsList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    category: "all",
    billingCycle: "all",
    sort: "name",
  });

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

  // Fetch user currency preference
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setCurrency(data.currency || "USD");
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };

    fetchCurrency();
  }, []);

  // Update app badge with overdue and upcoming subscription counts
  useAppBadge(subscriptions);

  // Get unique categories from subscriptions
  const categories = useMemo(() => {
    const cats = subscriptions
      .map((sub) => sub.category)
      .filter((cat): cat is string => cat !== null && cat !== "");
    return Array.from(new Set(cats)).sort();
  }, [subscriptions]);

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = [...subscriptions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((sub) =>
        sub.name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((sub) => sub.status === filters.status);
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((sub) => sub.category === filters.category);
    }

    // Billing cycle filter
    if (filters.billingCycle !== "all") {
      filtered = filtered.filter(
        (sub) => sub.billingCycle === filters.billingCycle
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "cost-asc":
          return parseFloat(a.cost) - parseFloat(b.cost);
        case "cost-desc":
          return parseFloat(b.cost) - parseFloat(a.cost);
        case "date-asc":
          return (
            new Date(a.nextBillingDate).getTime() -
            new Date(b.nextBillingDate).getTime()
          );
        case "date-desc":
          return (
            new Date(b.nextBillingDate).getTime() -
            new Date(a.nextBillingDate).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [subscriptions, filters]);

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

  // Check if subscription is overdue
  const isOverdue = (subscription: Subscription): boolean => {
    if (subscription.status !== "active") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billingDate = parseLocalDate(subscription.nextBillingDate);
    return billingDate < today;
  };

  // Calculate days overdue
  const getDaysOverdue = (subscription: Subscription): number => {
    if (!isOverdue(subscription)) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billingDate = parseLocalDate(subscription.nextBillingDate);
    return differenceInDays(today, billingDate);
  };

  return (
    <>
      <SubscriptionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {filteredAndSortedSubscriptions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground text-lg mb-1">
            No subscriptions match your filters
          </p>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedSubscriptions.map((subscription, index) => {
              const overdue = isOverdue(subscription);
              const daysOverdue = getDaysOverdue(subscription);

              return (
                <motion.div
                  key={subscription.id}
                  className={`group py-4 hover:bg-muted/20 transition-colors rounded-lg px-2 -mx-2 cursor-pointer ${
                    overdue ? "border-l-2 border-destructive" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                    layout: { duration: 0.2 },
                  }}
                  layout
                  whileHover={{ x: 4, scale: 1.01 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <SubscriptionIcon
                          iconId={subscription.icon}
                          name={subscription.name}
                          size={20}
                          className="shrink-0"
                        />
                        <h3 className="text-base sm:text-lg font-semibold truncate">
                          {subscription.name}
                        </h3>
                        <Badge
                          variant={getStatusColor(subscription.status)}
                          className="text-xs shrink-0"
                        >
                          {subscription.status}
                        </Badge>
                        {overdue && (
                          <Badge
                            variant="destructive"
                            className="text-xs shrink-0 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {daysOverdue === 1
                              ? "1 day overdue"
                              : `${daysOverdue} days overdue`}
                          </Badge>
                        )}
                        {subscription.category && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {subscription.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
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
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-lg sm:text-xl font-semibold">
                          {formatCurrency(
                            parseFloat(subscription.cost),
                            currency
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{subscription.billingCycle}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
