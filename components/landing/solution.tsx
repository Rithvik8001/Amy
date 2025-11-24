"use client";

import { motion } from "motion/react";
import { Sparkles, TrendingUp, Calendar, Globe, Smartphone } from "lucide-react";

const features = [
  {
    title: "AI Magic Import",
    description: "Describe your subscription in plain text. Our AI extracts all the details automatically—no forms to fill.",
    icon: Sparkles,
    visual: "ai",
  },
  {
    title: "Smart Budgets",
    description: "Set spending limits and get alerts before you exceed them. AI-powered recommendations help you find the right budget.",
    icon: TrendingUp,
    visual: "budget",
  },
  {
    title: "Calendar Sync",
    description: "Add renewal dates to your calendar with one click. Never miss a billing cycle again.",
    icon: Calendar,
    visual: "calendar",
  },
  {
    title: "Multi-Currency",
    description: "Support for 18 currencies with automatic formatting. Works seamlessly wherever you are.",
    icon: Globe,
    visual: "currency",
  },
  {
    title: "Works Offline",
    description: "Install as a PWA and access your subscriptions anywhere. Badge notifications keep you informed.",
    icon: Smartphone,
    visual: "pwa",
  },
];

function FeatureVisual({ type }: { type: string }) {
  switch (type) {
    case "ai":
      return (
        <div className="relative h-28 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border p-4 flex items-center justify-center overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 bg-[length:200%_100%]"
          />
          <div className="relative z-10 w-full flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs text-foreground/70 font-mono bg-background/80 px-3 py-1.5 rounded border"
            >
              &quot;Netflix $15.99...&quot;
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center shadow-sm"
            >
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-primary" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      );
    case "budget":
      return (
        <div className="relative h-28 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border p-4 flex flex-col justify-center space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground/70">Monthly Budget</span>
            <span className="text-xs text-muted-foreground">$600</span>
          </div>
          <div className="relative h-3 bg-muted-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "65%" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-full shadow-sm"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">$450</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded"
            >
              Safe
            </motion.span>
          </div>
        </div>
      );
    case "calendar":
      return (
        <div className="relative h-28 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border p-4 flex items-center justify-center">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * i }}
                whileHover={{ scale: 1.1 }}
                className={`w-7 h-7 rounded-md text-xs font-medium flex items-center justify-center transition-all ${
                  i === 3
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                    : "bg-background border hover:bg-muted/50"
                }`}
              >
                {i + 1}
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground"
          >
            Renewal date
          </motion.div>
        </div>
      );
    case "currency":
      return (
        <div className="relative h-28 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border p-4 flex items-center justify-center gap-4">
          {["$", "€", "£", "¥"].map((symbol, i) => (
            <motion.div
              key={symbol}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              whileHover={{ scale: 1.2, y: -2 }}
              className="text-2xl font-bold text-foreground/80 bg-background px-3 py-2 rounded-lg border shadow-sm"
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      );
    case "pwa":
      return (
        <div className="relative h-28 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border p-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-background to-muted/50 border-2 shadow-lg flex items-center justify-center"
          >
            <Smartphone className="w-7 h-7 text-foreground/70" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg"
          >
            3
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20"
          />
        </div>
      );
    default:
      return null;
  }
}

export default function Solution() {
  return (
    <section className="px-6 py-20 border-y">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features that make subscription management effortless
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group border rounded-xl p-6 bg-background hover:bg-muted/30 transition-all shadow-sm hover:shadow-lg relative overflow-hidden"
              >
                
                <div className="mb-4 relative">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm"
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </motion.div>
                  <FeatureVisual type={feature.visual} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
