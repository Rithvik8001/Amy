import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col max-w-5xl w-full mx-auto border-l border-r border-gray-200 dark:border-gray-900">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-4xl font-lavishly-yours cursor-pointer">Amy</h1>
          </Link>
          <div className="flex items-center gap-3">
            <UserButton />
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
          </h2>
          <p className="text-muted-foreground">
            Manage all your subscriptions in one place
          </p>
        </div>

        <div className="space-y-6">
          {/* Placeholder for subscriptions list */}
          <div className="border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">
              Your subscriptions will appear here
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
