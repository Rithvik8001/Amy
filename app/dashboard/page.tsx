import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import SubscriptionsList from "@/components/subscriptions/subscriptions-list";
import AddSubscriptionButton from "@/components/subscriptions/add-subscription-button";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userName = user.firstName || user.username || "User";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <h1 className="text-3xl font-lavishly-yours cursor-pointer">
                Amy
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {userName}
              </span>
              <ModeToggle />
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage all your subscriptions in one place
            </p>
          </div>
          <AddSubscriptionButton />
        </div>

        <SubscriptionsList />
      </main>
    </div>
  );
}
