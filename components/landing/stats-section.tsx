"use client";

import { motion } from "motion/react";
import Stats from "./stats";
import { AlertTriangle } from "lucide-react";

const statsData = [
  { value: "$273", label: "Average monthly spend" },
  { value: "12", label: "Active subscriptions" },
  { value: "42%", label: "Forgot they exist" },
  { value: "$1,200", label: "Wasted per year" },
];

export default function StatsSection() {
  return (
    <section className="px-6 py-20 border-y relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>
      
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20"
          >
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">The problem is real</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Most people lose track
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Don&apos;t be one of them. Take control of your subscriptions today.
          </p>
        </motion.div>

        <Stats stats={statsData} />
      </div>
    </section>
  );
}

