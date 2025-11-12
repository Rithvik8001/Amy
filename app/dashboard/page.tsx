import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FinancialOverview from "@/components/subscriptions/financial-overview";
import { DashboardHeader } from "@/components/dashboard-header";
import { Logo } from "@/components/logo";
import { NavActions } from "@/components/nav-actions";
import OfflineIndicator from "@/components/pwa/offline-indicator";
import InstallPrompt from "@/components/pwa/install-prompt";
import { BudgetOnboardingPrompt } from "@/components/settings/budget-onboarding-prompt";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userName = user.firstName || user.username || "User";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
            >
              <Logo size={24} />
              <h1 className="text-2xl sm:text-3xl font-lavishly-yours cursor-pointer">
                Amy
              </h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <NavActions userName={userName} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <OfflineIndicator />
        <InstallPrompt />
        <BudgetOnboardingPrompt />
        <DashboardHeader firstName={user.firstName} />

        <FinancialOverview />
      </main>
    </div>
  );
}
