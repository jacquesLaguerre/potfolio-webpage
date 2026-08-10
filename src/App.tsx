import Nav from "@/components/Nav";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import About from "@/components/About";
import ToolsIUse from "@/components/ToolsIUse";
import Work from "@/components/Work";
import Mission from "@/components/Mission";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  return (
    <>
      <Nav />

      <LiquidMetalHero
        title="Work Smarter Save Time Grow"
        subtitle="If you need to optimize your business or need your digital footprint for exposure you've come to the right place."
        primaryCtaLabel="View My Work"
        secondaryCtaLabel="Let's Talk"
        onPrimaryCtaClick={() => scrollTo("work")}
        onSecondaryCtaClick={() => scrollTo("contact")}
      />

      <About />
      <ToolsIUse />
      <Work />
      <Mission />
      <Contact />
      <Footer />
    </>
  );
}
