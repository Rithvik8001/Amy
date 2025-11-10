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

type SubscriptionStats = {
  totalMonthly: number;
  totalYearly: number;
  totalActiveSubscriptions: number;
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

export default function FinancialOverview() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

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
      stats.categoryBreakdown.forEach((item, index) => {
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: DollarSign,
            label: "Monthly",
            value: formatCurrency(stats.totalMonthly),
          },
          {
            icon: TrendingUp,
            label: "Yearly",
            value: formatCurrency(stats.totalYearly),
          },
          {
            icon: Package,
            label: "Active",
            value: stats.totalActiveSubscriptions,
          },
        ].map((card, index) => (
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
            <div className="text-2xl font-semibold">{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Renewals */}
      {stats.upcomingRenewals.items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Renewals</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{stats.upcomingRenewals.next7Days} in next 7 days</span>
              <span>{stats.upcomingRenewals.next30Days} in next 30 days</span>
            </div>
          </div>
          <div className="space-y-3">
            {stats.upcomingRenewals.items.map((item, index) => (
              <motion.div
                key={item.id}
                className="py-3 px-4 hover:bg-muted/20 transition-colors rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{item.name}</span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(parseFloat(item.cost))}
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
                  className="h-[300px] w-full"
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
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
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
                          {formatCurrency(item.monthlySpending)}
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
