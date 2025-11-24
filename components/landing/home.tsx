import Nav from "@/components/landing/nav";
import Hero from "@/components/landing/hero";
import StatsSection from "@/components/landing/stats-section";
import Solution from "@/components/landing/solution";
import CTA from "@/components/landing/cta";
import SectionDivider from "@/components/landing/section-divider";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <SectionDivider />
        <StatsSection />
        <SectionDivider />
        <Solution />
        <SectionDivider />
        <CTA />
      </main>
    </>
  );
}
