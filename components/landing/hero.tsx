import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-6 pt-20 pb-32 md:pt-32 md:pb-40">
      <div className="max-w-2xl">
        <div className="inline-block mb-8 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground border rounded-full">
          Stop the surprises
        </div>
        <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
          All your subscriptions
          <br />
          <span className="text-muted-foreground">in one place</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-10">
          Because you&apos;re tired of surprises.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="text-base px-8 group" asChild>
            <Link href="/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
