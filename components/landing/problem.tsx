import { AlertCircle } from "lucide-react";
import Stats from "./stats";

const statsData = [
  { value: "$273", label: "Average monthly spend" },
  { value: "12", label: "Active subscriptions" },
  { value: "42%", label: "Forgot they exist" },
  { value: "$1,200", label: "Wasted per year" },
];

export default function Problem() {
  return (
    <section className="px-6 py-20 border-y">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-4 mb-12">
          <div className="mt-1 shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              That moment when you check your bank statement
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You see a charge. You don&apos;t recognize it. You think it&apos;s
              fraud. Then you remember—you signed up for that free trial three
              months ago. It auto-renewed. Surprise.
            </p>
          </div>
        </div>

        <Stats stats={statsData} />
      </div>
    </section>
  );
}

