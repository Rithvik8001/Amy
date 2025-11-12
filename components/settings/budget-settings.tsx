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
import { toast } from "sonner";

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
      toast.success("Budget settings cleared");

      if (onSave) {
        onSave();
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
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
          <div className="flex items-center justify-between gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={
                saving || (!settings.monthlyBudget && !settings.yearlyBudget)
              }
            >
              Clear Budgets
            </Button>
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
