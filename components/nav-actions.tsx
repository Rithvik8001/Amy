"use client";

import dynamic from "next/dynamic";
import { ModeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/settings/currency-selector";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

interface NavActionsProps {
  userName: string;
}

export function NavActions({ userName }: NavActionsProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
        {userName}
      </span>
      <CurrencySelector />
      <ModeToggle />
      <UserButton />
    </div>
  );
}
