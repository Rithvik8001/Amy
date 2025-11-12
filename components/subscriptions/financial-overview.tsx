"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, DollarSign, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { SubscriptionIcon } from "./subscription-icon";
import { useAppBadge } from "@/hooks/use-app-badge";
import { formatCurrency } from "@/lib/currency-utils";
import { BudgetCard } from "./budget-card";

type SubscriptionStats = {
  totalMonthly: number;
  totalYearly: number;
  totalActiveSubscriptions: number;
  currency?: string;
  budget?: {
    monthlyBudget: number | null;
    yearlyBudget: number | null;
    monthlySpent: number;
    yearlySpent: number;
    monthlyRemaining: number | null;
    yearlyRemaining: number | null;
    monthlyPercentage: number | null;
    yearlyPercentage: number | null;
    monthlyStatus: "under" | "approaching" | "exceeded" | null;
    yearlyStatus: "under" | "approaching" | "exceeded" | null;
    projectedMonthlySpending: number;
    projectedYearlySpending: number;
  };
  upcomingRenewals: {
    next7Days: number;
    next30Days: number;
    items: Array<{
      id: number;
      name: string;
      cost: string;
      billingCycle: "monthly" | "yearly";
      nextBillingDate: string;
      category: string | null;
      icon: string | null;
    }>;
  };
  categoryBreakdown: Array<{
    category: string;
    monthlySpending: number;
  }>;
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

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

export default function FinancialOverview() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [categoryColors, setCategoryColors] = useState<string[]>([]);

  // Get computed RGB colors from CSS variables (for SVG compatibility)
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const colorKeys = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];
    const colors: string[] = [];

    colorKeys.forEach((colorKey) => {
      // Create a temporary element to get computed color
      const tempEl = document.createElement("div");
      tempEl.style.color = `hsl(var(--${colorKey}))`;
      tempEl.style.position = "absolute";
      tempEl.style.visibility = "hidden";
      tempEl.style.width = "1px";
      tempEl.style.height = "1px";
      document.body.appendChild(tempEl);

      const computedColor = getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);

      colors.push(computedColor || "#8884d8");
    });

    setCategoryColors(colors);
  }, [mounted, resolvedTheme]);

  // Get color for a category by index
  const getCategoryColor = (index: number) => {
    if (categoryColors.length === 0) return "#8884d8";
    return categoryColors[index % categoryColors.length];
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscriptions/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
      // Update currency from stats if available
      if (data.currency) {
        setCurrency(data.currency);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      }
    } catch (err) {
      // Silently fail - badge is optional
      console.error("Failed to fetch subscriptions for badge:", err);
    }
  };

  useEffect(() => {
    fetchStats();
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

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted/30 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchStats} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground text-lg mb-1">
          No subscription data available
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Add your first subscription to see financial insights
        </p>
        <Link href="/dashboard/subscriptions">
          <Button>Add Subscription</Button>
        </Link>
      </div>
    );
  }

  // Prepare chart data for stacked area chart - show next 3 months
  const prepareAreaChartData = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() + i);
      const monthName = format(monthDate, "MMM");

      const monthData: Record<string, string | number> = {
        month: monthName,
      };

      // Add each category's spending for this month
      stats.categoryBreakdown.forEach((item) => {
        monthData[item.category] = item.monthlySpending;
      });

      months.push(monthData);
    }

    return months;
  };

  const areaChartData = stats ? prepareAreaChartData() : [];

  // Build chart config for each category with theme-aware colors
  const chartConfig: Record<
    string,
    { label: string; theme?: Record<string, string> }
  > = {
    month: { label: "Month" },
  };

  stats?.categoryBreakdown.forEach((item, index) => {
    // Use theme-aware colors that work in both light and dark mode
    const colorKeys = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];
    const colorKey = colorKeys[index % colorKeys.length];

    chartConfig[item.category] = {
      label: item.category,
      theme: {
        light: `hsl(var(--${colorKey}))`,
        dark: `hsl(var(--${colorKey}))`,
      },
    };
  });

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Budget Card */}
      {stats.budget && <BudgetCard budget={stats.budget} currency={currency} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            icon: DollarSign,
            label: "Monthly",
            value: formatCurrency(stats.totalMonthly, currency),
          },
          {
            icon: TrendingUp,
            label: "Yearly",
            value: formatCurrency(stats.totalYearly, currency),
          },
          {
            icon: Package,
            label: "Active",
            value: stats.totalActiveSubscriptions,
          },
        ].map((card, index) => {
          // Add budget context to monthly/yearly cards if budget is set
          let displayValue: React.ReactNode = card.value;
          if (stats.budget) {
            if (card.label === "Monthly" && stats.budget.monthlyBudget) {
              const percentage = stats.budget.monthlyPercentage;
              const status = stats.budget.monthlyStatus;
              displayValue = (
                <div>
                  <div>{formatCurrency(stats.totalMonthly, currency)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    / {formatCurrency(stats.budget.monthlyBudget, currency)} (
                    {percentage?.toFixed(1)}%)
                  </div>
                  {status === "approaching" && (
                    <Badge variant="default" className="mt-1 text-xs">
                      Approaching
                    </Badge>
                  )}
                  {status === "exceeded" && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Exceeded
                    </Badge>
                  )}
                </div>
              );
            } else if (card.label === "Yearly" && stats.budget.yearlyBudget) {
              const percentage = stats.budget.yearlyPercentage;
              const status = stats.budget.yearlyStatus;
              displayValue = (
                <div>
                  <div>{formatCurrency(stats.totalYearly, currency)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    / {formatCurrency(stats.budget.yearlyBudget, currency)} (
                    {percentage?.toFixed(1)}%)
                  </div>
                  {status === "approaching" && (
                    <Badge variant="default" className="mt-1 text-xs">
                      Approaching
                    </Badge>
                  )}
                  {status === "exceeded" && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Exceeded
                    </Badge>
                  )}
                </div>
              );
            }
          }

          return (
            <motion.div
              key={card.label}
              className="py-6 px-4 hover:bg-muted/20 transition-colors rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <div className="text-2xl font-semibold">{displayValue}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Upcoming Renewals */}
      {stats.upcomingRenewals.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold">
              Upcoming Renewals
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>{stats.upcomingRenewals.next7Days} in next 7 days</span>
              <span className="hidden sm:inline">
                {stats.upcomingRenewals.next30Days} in next 30 days
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {stats.upcomingRenewals.items.map((item, index) => (
              <motion.div
                key={item.id}
                className="py-3 px-3 sm:px-4 hover:bg-muted/20 transition-colors rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    <SubscriptionIcon
                      iconId={item.icon}
                      name={item.name}
                      size={18}
                      className="shrink-0"
                    />
                    <span className="font-medium text-sm sm:text-base">
                      {item.name}
                    </span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-semibold text-sm sm:text-base">
                      {formatCurrency(parseFloat(item.cost), currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(item.nextBillingDate), "MMM dd, yyyy")}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Spending by Category</h3>
            <p className="text-sm text-muted-foreground">
              Monthly spending for the next 3 months
            </p>
          </div>
          {areaChartData.length > 0 ? (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <ChartContainer
                  config={chartConfig}
                  className="h-[200px] sm:h-[250px] md:h-[300px] w-full"
                >
                  <AreaChart
                    data={areaChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      {stats.categoryBreakdown.map((item, index) => {
                        const color = getCategoryColor(index);
                        return (
                          <linearGradient
                            key={item.category}
                            id={`color${index}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={color}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor={color}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        resolvedTheme === "dark"
                          ? "hsl(var(--muted))"
                          : "hsl(var(--border))"
                      }
                      opacity={resolvedTheme === "dark" ? 0.3 : 0.5}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{
                        fill:
                          resolvedTheme === "dark"
                            ? "hsl(var(--muted-foreground))"
                            : "hsl(var(--foreground) / 0.7)",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => formatCurrency(value, currency)}
                      tick={{
                        fill:
                          resolvedTheme === "dark"
                            ? "hsl(var(--muted-foreground))"
                            : "hsl(var(--foreground) / 0.7)",
                        fontSize: 12,
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            formatCurrency(Number(value), currency)
                          }
                        />
                      }
                    />
                    {stats.categoryBreakdown.map((item, index) => (
                      <Area
                        key={item.category}
                        type="monotone"
                        dataKey={item.category}
                        stackId="1"
                        stroke={getCategoryColor(index)}
                        fill={`url(#color${index})`}
                      />
                    ))}
                  </AreaChart>
                </ChartContainer>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">
                        Monthly Spending
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.categoryBreakdown.map((item, index) => (
                      <motion.tr
                        key={item.category}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        whileHover={{
                          backgroundColor: "hsl(var(--muted) / 0.3)",
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span>{item.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.monthlySpending, currency)}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No category data available
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {stats.totalActiveSubscriptions === 0 && (
        <motion.div
          className="py-16 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-lg mb-1">
            No active subscriptions
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Add subscriptions to see your financial overview
          </p>
          <Link href="/dashboard/subscriptions">
            <Button>View All Subscriptions</Button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
