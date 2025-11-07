import { CheckCircle2 } from "lucide-react";

interface SolutionItemProps {
  title: string;
  description: string;
  alignRight?: boolean;
}

export default function SolutionItem({
  title,
  description,
  alignRight = false,
}: SolutionItemProps) {
  return (
    <div
      className={`flex items-start gap-4 ${
        alignRight ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className={`mt-1 shrink-0 ${alignRight ? "md:order-2" : ""}`}>
        <CheckCircle2 className="w-6 h-6 text-primary" />
      </div>
      <div className={`flex-1 ${alignRight ? "md:order-1" : ""}`}>
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
