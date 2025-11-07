import SolutionItem from "./solution-item";

const solutions = [
  {
    title: "One dashboard",
    description:
      "See everything. Netflix, Spotify, that VPN you forgot about, the productivity app you used once. All in one place. No more hunting through emails or bank statements.",
    alignRight: false,
  },
  {
    title: "Smart alerts",
    description:
      "We&apos;ll tell you before renewals happen. Before prices go up. Before you forget. No surprises. Just peace of mind.",
    alignRight: true,
  },
  {
    title: "Find the leaks",
    description:
      "See exactly where your money goes. Identify subscriptions you don&apos;t use, and decide what to keep or cancel.",
    alignRight: false,
  },
];

export default function Solution() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-16">
        {solutions.map((solution, index) => (
          <SolutionItem
            key={index}
            title={solution.title}
            description={solution.description}
            alignRight={solution.alignRight}
          />
        ))}
      </div>
    </section>
  );
}
