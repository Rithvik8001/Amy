import Nav from "@/components/landing/nav";
import Hero from "@/components/landing/hero";
import Problem from "@/components/landing/problem";
import Solution from "@/components/landing/solution";
import CTA from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <CTA />
      </main>
    </>
  );
}
