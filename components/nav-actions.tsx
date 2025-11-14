"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/settings/currency-selector";
import { BudgetSettings } from "@/components/settings/budget-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

interface NavActionsProps {
  userName: string;
}

export function NavActions({ userName }: NavActionsProps) {
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
          {userName}
        </span>
        <CurrencySelector />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="w-4 h-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowBudgetSettings(true)}>
              Budget Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModeToggle />
        <UserButton />
      </div>

      <BudgetSettings
        open={showBudgetSettings}
        onOpenChange={setShowBudgetSettings}
        onSave={() => {
          setShowBudgetSettings(false);
          // Force hard reload to ensure fresh data
          window.location.href = window.location.href;
        }}
      />
    </>
  );
}
