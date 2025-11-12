"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency-utils";
import { formatBudgetStatus } from "@/lib/budget-utils";
import { BudgetSettings } from "@/components/settings/budget-settings";
import { useState } from "react";
import { Settings } from "lucide-react";

type BudgetData = {
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

type BudgetCardProps = {
  budget: BudgetData;
  currency: string;
};

export function BudgetCard({ budget, currency }: BudgetCardProps) {
  const [showSettings, setShowSettings] = useState(false);

  if (!budget.monthlyBudget && !budget.yearlyBudget) {
    return (
      <>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Set a Budget</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Track your subscription spending and get alerts when you are
              approaching or exceeding your budget.
            </p>
            <Button onClick={() => setShowSettings(true)}>Set Budget</Button>
          </div>
        </div>

        <BudgetSettings
          open={showSettings}
          onOpenChange={setShowSettings}
          onSave={() => {
            setShowSettings(false);
            window.location.reload();
          }}
        />
      </>
    );
  }

  const hasMonthlyBudget = budget.monthlyBudget !== null;
  const hasYearlyBudget = budget.yearlyBudget !== null;

  const getStatusColor = (
    status: "under" | "approaching" | "exceeded" | null
  ) => {
    switch (status) {
      case "exceeded":
        return "destructive";
      case "approaching":
        return "default";
      default:
        return "secondary";
    }
  };

  const getProgressColor = (
    status: "under" | "approaching" | "exceeded" | null,
    percentage: number | null
  ) => {
    if (!percentage) return "bg-muted";
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {hasMonthlyBudget && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Monthly</span>
              <Badge variant={getStatusColor(budget.monthlyStatus)}>
                {formatBudgetStatus(budget.monthlyStatus)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(budget.monthlySpent, currency)} /{" "}
                  {formatCurrency(budget.monthlyBudget!, currency)}
                </span>
                <span className="font-medium">
                  {budget.monthlyPercentage?.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${getProgressColor(
                    budget.monthlyStatus,
                    budget.monthlyPercentage
                  )}`}
                  style={{
                    width: `${Math.min(budget.monthlyPercentage || 0, 100)}%`,
                  }}
                />
              </div>
              {budget.monthlyRemaining !== null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {budget.monthlyRemaining >= 0
                      ? `${formatCurrency(
                          budget.monthlyRemaining,
                          currency
                        )} remaining`
                      : `${formatCurrency(
                          Math.abs(budget.monthlyRemaining),
                          currency
                        )} over budget`}
                  </span>
                  {budget.projectedMonthlySpending > budget.monthlyBudget! && (
                    <span className="text-yellow-600 dark:text-yellow-500">
                      Projected:{" "}
                      {formatCurrency(
                        budget.projectedMonthlySpending,
                        currency
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {hasYearlyBudget && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Yearly</span>
              <Badge variant={getStatusColor(budget.yearlyStatus)}>
                {formatBudgetStatus(budget.yearlyStatus)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(budget.yearlySpent, currency)} /{" "}
                  {formatCurrency(budget.yearlyBudget!, currency)}
                </span>
                <span className="font-medium">
                  {budget.yearlyPercentage?.toFixed(1)}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${getProgressColor(
                    budget.yearlyStatus,
                    budget.yearlyPercentage
                  )}`}
                  style={{
                    width: `${Math.min(budget.yearlyPercentage || 0, 100)}%`,
                  }}
                />
              </div>
              {budget.yearlyRemaining !== null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {budget.yearlyRemaining >= 0
                      ? `${formatCurrency(
                          budget.yearlyRemaining,
                          currency
                        )} remaining`
                      : `${formatCurrency(
                          Math.abs(budget.yearlyRemaining),
                          currency
                        )} over budget`}
                  </span>
                  {budget.projectedYearlySpending > budget.yearlyBudget! && (
                    <span className="text-yellow-600 dark:text-yellow-500">
                      Projected:{" "}
                      {formatCurrency(budget.projectedYearlySpending, currency)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BudgetSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={() => {
          setShowSettings(false);
          window.location.reload();
        }}
      />
    </>
  );
}
