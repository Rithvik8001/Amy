import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SubscriptionsList from "@/components/subscriptions/subscriptions-list";
import AddSubscriptionButton from "@/components/subscriptions/add-subscription-button";
import { SubscriptionsHeader } from "@/components/subscriptions-header";
import { Logo } from "@/components/logo";

export default async function SubscriptionsPage() {
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
            <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
              <Logo size={24} />
              <h1 className="text-2xl sm:text-3xl font-lavishly-yours cursor-pointer">
                Amy
              </h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                {userName}
              </span>
              <ModeToggle />
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <SubscriptionsHeader>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-1">
              Your Subscriptions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage all your subscriptions in one place
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link href="/dashboard">
              <Button variant="outline" className="text-xs sm:text-sm">Overview</Button>
            </Link>
            <AddSubscriptionButton />
          </div>
        </SubscriptionsHeader>

        <SubscriptionsList />
      </main>
    </div>
  );
}

