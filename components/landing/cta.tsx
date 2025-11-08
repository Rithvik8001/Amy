import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-6 py-32 border-t">
      <div className="max-w-xl mx-auto text-center space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to eliminate surprises?
        </h2>
        <p className="text-lg text-muted-foreground">
          Join thousands who&apos;ve taken control of their subscriptions.
        </p>
        <Button size="lg" className="text-base px-8 group" asChild>
          <Link href="/sign-up">
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
