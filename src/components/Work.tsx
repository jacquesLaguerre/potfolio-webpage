import { ArrowUpRight } from "lucide-react";
import { useFadeUp } from "@/hooks/useFadeUp";
import {
  CoverflowCarousel,
  type CoverflowSlide,
} from "@/components/ui/coverflow-carousel";

const SLIDES: CoverflowSlide[] = [
  {
    src: "/projectsLogos/securetax-logo.PNG",
    alt: "Secure Tax logo",
    title: "Secure Tax",
    subtitle: "Tax Consulting",
    tagline:
      "A nationwide front door that turned a local tax office into a seven-figure business.",
    href: "https://www.securetax.co/",
    fit: "contain",
  },
  {
    src: "/projectsLogos/evotax-logo.png",
    alt: "EVOTAX logo",
    title: "EVOTAX",
    subtitle: "Tax Services",
    tagline:
      "A true growth engine — took EVOTAX to six figures in under a year.",
    href: "https://evotax.us/",
    fit: "contain",
  },
  {
    src: "/projectsLogos/aetizay-logo.png",
    alt: "Ætizay logo",
    title: "Ætizay",
    subtitle: "Creative Collective",
    tagline:
      "A curated home base connecting independent artists with events, venues, and collaborators across every medium.",
    href: "https://xn--tizay-rra.com/",
    fit: "contain",
  },
  {
    src: "/projectsLogos/kcleanse-favicon.png",
    alt: "KCleanse logo",
    title: "KCleanse",
    subtitle: "K-Beauty Skincare",
    tagline:
      "A clean-beauty storefront built on ingredient transparency, turning skincare-conscious shoppers into loyal customers.",
    href: "https://kcleanse.net/",
    fit: "contain",
  },
];

export default function Work() {
  const titleRef = useFadeUp<HTMLHeadingElement>();
  const carouselRef = useFadeUp<HTMLDivElement>();

  return (
    <section id="work">
      <div className="section-inner">
        <div className="section-label">Selected Work</div>
        <h2 className="section-title fade-up" ref={titleRef}>
          Projects that
          <br />
          speak for themselves
        </h2>

        <div className="fade-up" ref={carouselRef} style={{ marginTop: 56 }}>
          <CoverflowCarousel
            slides={SLIDES}
            cardWidth="clamp(180px, 26vw, 340px)"
            showNavigation
            showPagination
            label="Selected work"
          />
          <p
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: "0.8rem",
              color: "var(--text2)",
            }}
          >
            Click a project to visit it — double-click to flip for details.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <a
            href="https://calendar.app.google/JYdbwCmvMPgJodQEA"
            target="_blank"
            rel="noreferrer"
            className="contact-btn-small"
          >
            <span>Book Your Consultation</span>
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}
