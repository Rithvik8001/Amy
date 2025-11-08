import Home from "@/components/landing/home";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await currentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="min-h-screen flex flex-col max-w-5xl w-full mx-auto border-l border-r border-gray-200 dark:border-gray-900">
        <Home />
      </div>
    </>
  );
}
