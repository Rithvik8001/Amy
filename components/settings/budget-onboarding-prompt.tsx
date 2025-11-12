"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetSettings } from "./budget-settings";

const STORAGE_KEY = "budgetPromptDismissed";

export function BudgetOnboardingPrompt() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      setHasChecked(true);
      return;
    }

    const checkBudget = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          if (!data.monthlyBudget && !data.yearlyBudget) {
            setOpen(true);
          }
        }
      } catch (error) {
        console.error("Error checking budget:", error);
      } finally {
        setHasChecked(true);
      }
    };

    checkBudget();
  }, []);

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleSetBudget = () => {
    setOpen(false);
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    const checkBudget = async () => {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          if (data.monthlyBudget || data.yearlyBudget) {
            localStorage.setItem(STORAGE_KEY, "true");
          }
        }
      } catch (error) {
        console.error("Error checking budget:", error);
      }
    };
    checkBudget();
  };

  if (!hasChecked) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set a spending limit?</DialogTitle>
            <DialogDescription>
              Track your subscription spending and get alerts when you are
              approaching or exceeding your budget.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-6">
              Setting a budget helps you stay on top of your subscription
              spending and avoid surprises.
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
              <Button onClick={handleSetBudget}>Set Budget</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BudgetSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={handleSettingsClose}
      />
    </>
  );
}
