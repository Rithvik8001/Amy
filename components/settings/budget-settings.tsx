"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sparkles, Loader2, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency-utils";
import type { BudgetRecommendations } from "@/lib/validations/budget-recommendations";

type BudgetSettings = {
  currency: string;
  monthlyBudget: number | null;
  yearlyBudget: number | null;
  budgetAlertThreshold: number;
};

export function BudgetSettings({
  open,
  onOpenChange,
  onSave,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: () => void;
}) {
  const [settings, setSettings] = useState<BudgetSettings>({
    currency: "USD",
    monthlyBudget: null,
    yearlyBudget: null,
    budgetAlertThreshold: 80,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState("");
  const [yearlyBudgetInput, setYearlyBudgetInput] = useState("");
  const [recommendations, setRecommendations] =
    useState<BudgetRecommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setMonthlyBudgetInput(
            data.monthlyBudget ? data.monthlyBudget.toString() : ""
          );
          setYearlyBudgetInput(
            data.yearlyBudget ? data.yearlyBudget.toString() : ""
          );
        }
      } catch (error) {
        console.error("Error fetching budget settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const monthlyBudget =
        monthlyBudgetInput.trim() === ""
          ? null
          : parseFloat(monthlyBudgetInput);
      const yearlyBudget =
        yearlyBudgetInput.trim() === "" ? null : parseFloat(yearlyBudgetInput);

      if (
        monthlyBudgetInput.trim() !== "" &&
        (isNaN(monthlyBudget!) || monthlyBudget! <= 0)
      ) {
        toast.error("Monthly budget must be a positive number");
        setSaving(false);
        return;
      }

      if (
        yearlyBudgetInput.trim() !== "" &&
        (isNaN(yearlyBudget!) || yearlyBudget! <= 0)
      ) {
        toast.error("Yearly budget must be a positive number");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyBudget,
          yearlyBudget,
          budgetAlertThreshold: settings.budgetAlertThreshold,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update budget settings");
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      toast.success("Budget settings updated successfully");

      if (onSave) {
        onSave();
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Failed to update budget settings");
      console.error("Error updating budget settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGetRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setShowRecommendations(false);

      const response = await fetch("/api/ai/budget-recommendations", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle rate limit errors specifically
        if (response.status === 429) {
          const retryAfter = error.retryAfter || 3600;
          const minutes = Math.ceil(retryAfter / 60);
          toast.error(
            `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
            {
              duration: 5000,
            }
          );
          return;
        }
        
        throw new Error(error.message || error.error || "Failed to get recommendations");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRecommendations(data.data);
        setShowRecommendations(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error getting budget recommendations:", error);
      if (error instanceof Error && error.message.includes("Too many requests")) {
        // Already handled above
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to get AI recommendations. Please try again."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleApplyRecommendations = () => {
    if (!recommendations) return;

    setMonthlyBudgetInput(recommendations.suggestedMonthlyBudget.toString());
    setYearlyBudgetInput(recommendations.suggestedYearlyBudget.toString());
    setShowRecommendations(false);
    toast.success("Recommendations applied! Review and save when ready.");
  };

  const handleDismissRecommendations = () => {
    setShowRecommendations(false);
  };

  const handleClear = async () => {
    try {
      setSaving(true);

      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyBudget: null,
          yearlyBudget: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to clear budget settings");
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setMonthlyBudgetInput("");
      setYearlyBudgetInput("");
      setShowDeleteDialog(false);
      toast.success("Budget deleted successfully");

      // Close dialog first
      if (onOpenChange) {
        onOpenChange(false);
      }

      // Small delay to ensure API call completes and toast shows
      setTimeout(() => {
        // Trigger refresh via onSave callback (which reloads the page)
        if (onSave) {
          onSave();
        } else {
          // Fallback: force hard reload to clear any cached data
          window.location.href = window.location.href;
        }
      }, 300);
    } catch (error) {
      toast.error("Failed to clear budget settings");
      console.error("Error clearing budget settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="py-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Budget Settings</DialogTitle>
          <DialogDescription>
            Set monthly and yearly spending limits to track your subscription
            budget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Recommendations Section */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetRecommendations}
                disabled={loadingRecommendations}
                className="w-full"
              >
                {loadingRecommendations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {settings.monthlyBudget || settings.yearlyBudget
                      ? "Review & Adjust Budget"
                      : "Get AI Recommendation"}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground px-1">
                {settings.monthlyBudget || settings.yearlyBudget
                  ? "AI will analyze your current spending and suggest adjustments to your existing budget"
                  : "AI will analyze your spending patterns and suggest personalized budget amounts"}
              </p>
            </div>

            {showRecommendations && recommendations && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        AI Budget Recommendations
                      </CardTitle>
                      <CardDescription>
                        Based on your spending patterns
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        recommendations.confidence === "high"
                          ? "default"
                          : recommendations.confidence === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="ml-2"
                    >
                      {recommendations.confidence} confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Suggested Monthly Budget:
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          recommendations.suggestedMonthlyBudget,
                          settings.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Suggested Yearly Budget:
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          recommendations.suggestedYearlyBudget,
                          settings.currency
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {recommendations.reasoning}
                    </p>
                  </div>

                  {recommendations.insights.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Insights:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {recommendations.insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyRecommendations}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Apply Recommendations
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleDismissRecommendations}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly-budget">Monthly Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {settings.currency === "USD" ? "$" : ""}
              </span>
              <Input
                id="monthly-budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={monthlyBudgetInput}
                onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a monthly spending limit (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearly-budget">Yearly Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {settings.currency === "USD" ? "$" : ""}
              </span>
              <Input
                id="yearly-budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={yearlyBudgetInput}
                onChange={(e) => setYearlyBudgetInput(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a yearly spending limit (optional)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-threshold">
              Alert Threshold: {settings.budgetAlertThreshold}%
            </Label>
            <Input
              id="alert-threshold"
              type="range"
              min="50"
              max="100"
              step="5"
              value={settings.budgetAlertThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  budgetAlertThreshold: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Get alerts when you reach this percentage of your budget
            </p>
          </div>
          {(settings.monthlyBudget || settings.yearlyBudget) && (
            <div className="pt-2 border-t">
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Budget
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Budget?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your monthly and yearly
                      budget settings. You can set new budgets anytime. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Budget
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-4">
            <div className="flex-1" />
            <div className="flex gap-2">
              {onOpenChange && (
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
