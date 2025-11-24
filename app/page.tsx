import Home from "@/components/landing/home";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="min-h-screen flex flex-col max-w-5xl w-full mx-auto relative">
        {/* Outer left border with diagonal pattern */}
        <div className="absolute left-0 top-0 bottom-0 w-px -ml-px border-l border-gray-200 dark:border-gray-900">
          <div 
            className="absolute inset-0 opacity-30 dark:opacity-20 text-gray-400 dark:text-gray-600"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 11px
              )`,
            }}
          />
        </div>
        {/* Outer right border with diagonal pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-px -mr-px border-r border-gray-200 dark:border-gray-900">
          <div 
            className="absolute inset-0 opacity-30 dark:opacity-20 text-gray-400 dark:text-gray-600"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                currentColor 10px,
                currentColor 11px
              )`,
            }}
          />
        </div>
        {/* Inner container with borders */}
        <div className="border-l border-r border-gray-200 dark:border-gray-900">
          <Home />
        </div>
      </div>
    </>
  );
}
