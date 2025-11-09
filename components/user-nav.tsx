"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

export function UserNav() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <UserButton />;
  }

  const displayName = user?.firstName || "User";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:block">
        {displayName}
      </span>
      <UserButton />
    </div>
  );
}
