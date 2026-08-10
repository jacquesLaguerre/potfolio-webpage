import { useFadeUp } from "@/hooks/useFadeUp";
import OrbitingCirclesGlobe from "@/components/ui/orbiting-circles-02";

export default function ToolsIUse() {
  const titleRef = useFadeUp<HTMLHeadingElement>();

  return (
    <section id="tools" style={{ paddingBottom: 0 }}>
      <div className="section-inner" style={{ textAlign: "center" }}>
        <div className="section-label" style={{ justifyContent: "center" }}>
          What I Work With
        </div>
        <h2
          className="section-title fade-up"
          ref={titleRef}
          style={{ margin: "0 auto", maxWidth: "none" }}
        >
          Tools I Use
        </h2>
      </div>

      <OrbitingCirclesGlobe />
    </section>
  );
}
