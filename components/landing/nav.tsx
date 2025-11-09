import { ModeToggle } from "../theme-toggle";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserNav } from "@/components/user-nav";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <h1 className="text-4xl font-lavishly-yours cursor-pointer">Amy</h1>
        </Link>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <UserNav />
          </SignedIn>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
