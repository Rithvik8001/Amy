"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="px-6 pt-20 pb-24 md:pt-32 md:pb-32 border-b relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-foreground border rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-3 h-3 text-primary" />
            </motion.div>
            AI powered
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            All your subscriptions
            <br />
            <span className="text-muted-foreground">in one place</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            Track spending, set budgets, sync calendars, and never be surprised by a charge again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="text-base px-8 group shadow-lg hover:shadow-xl transition-all" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Hero Visual - Enhanced Dashboard Representation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl blur-xl opacity-50" />
          
          <div className="relative bg-gradient-to-br from-muted/40 via-muted/30 to-muted/20 border rounded-xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subscription Card 1 - Netflix */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-background border rounded-lg p-4 space-y-3 shadow-md hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center border border-red-500/20 group-hover:border-red-500/40 transition-colors">
                    <Play className="w-5 h-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-foreground/80 rounded w-20 mb-1.5 font-medium" />
                    <div className="h-2 bg-muted-foreground/30 rounded w-16" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Monthly</span>
                  <span className="text-sm font-semibold">$15.99</span>
                </div>
              </motion.div>

              {/* Subscription Card 2 - Spotify */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-background border rounded-lg p-4 space-y-3 shadow-md hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/40 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-green-600 dark:bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3.5 bg-foreground/80 rounded w-24 mb-1.5 font-medium" />
                    <div className="h-2 bg-muted-foreground/30 rounded w-20" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Monthly</span>
                  <span className="text-sm font-semibold">$9.99</span>
                </div>
              </motion.div>

              {/* Budget Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-background to-muted/30 border rounded-lg p-4 space-y-3 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div className="h-3 bg-foreground/60 rounded w-20 font-medium" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Spent</span>
                    <span>$450 / $600</span>
                  </div>
                  <div className="h-2.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">Remaining</span>
                    <span className="text-xs font-semibold text-primary">$150</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Additional detail - Calendar indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>3 renewals coming up this week</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

