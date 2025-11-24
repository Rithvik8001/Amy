import Nav from "@/components/landing/nav";
import Hero from "@/components/landing/hero";
import StatsSection from "@/components/landing/stats-section";
import Solution from "@/components/landing/solution";
import CTA from "@/components/landing/cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <StatsSection />
        <Solution />
        <CTA />
      </main>
    </>
  );
}
