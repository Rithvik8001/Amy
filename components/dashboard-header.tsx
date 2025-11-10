"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  firstName?: string | null;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <motion.div 
      className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your subscription financial overview
        </p>
      </div>
      <Link href="/dashboard/subscriptions" className="self-start sm:self-auto">
        <Button variant="outline" className="text-xs sm:text-sm">View All Subscriptions</Button>
      </Link>
    </motion.div>
  );
}

