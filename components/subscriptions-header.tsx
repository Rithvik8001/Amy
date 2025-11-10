"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SubscriptionsHeaderProps {
  children: React.ReactNode;
}

export function SubscriptionsHeader({ children }: SubscriptionsHeaderProps) {
  return (
    <motion.div 
      className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

