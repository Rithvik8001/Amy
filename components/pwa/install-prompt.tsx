"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    if (isStandalone) {
      return;
    }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
      } else {
        localStorage.setItem("pwa-install-dismissed", "true");
        setIsDismissed(true);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error("Error showing install prompt:", error);
      localStorage.setItem("pwa-install-dismissed", "true");
      setIsDismissed(true);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setIsDismissed(true);
    setDeferredPrompt(null);
  };

  if (!mounted) return null;

  if (isInstalled) return null;

  if (!deferredPrompt || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="sticky top-[73px] sm:top-[81px] z-40 px-4 sm:px-6 mb-4 sm:mb-6"
      >
        <Alert className="max-w-2xl mx-auto border-primary/50 bg-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <AlertDescription className="text-sm sm:text-base">
                Install Amy to access your subscriptions faster and get
                notifications about upcoming renewals.
              </AlertDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={handleInstall}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
