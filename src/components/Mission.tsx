import { useFadeUp } from "@/hooks/useFadeUp";

const STATS = [
  { number: "3+", label: "Years of experience" },
  { number: "10+", label: "Projects shipped" },
  { number: "15+", label: "Happy clients" },
];

export default function Mission() {
  const textRef = useFadeUp<HTMLDivElement>();
  const statsRef = useFadeUp<HTMLDivElement>();

  return (
    <section id="mission">
      <div className="mission-inner">
        <div className="mission-text fade-up" ref={textRef}>
          <div className="section-label">My Mission</div>
          <h2 className="section-title">
            Help you optimize
            <br /> & Save Time
          </h2>
          <p className="mission-body">
            My mission is to help businesses{" "}
            <strong>
              save time, optimize their operations, and establish a strong
              digital footprint{" "}
            </strong>
            by combining automated systems with{" "}
            <strong>high performing websites </strong>. Through{" "}
            <strong>
              smart automation, thoughtful design, and strategic functionality
            </strong>
            , I create digital experiences that work efficiently behind the
            scenes allowing brands to reach more people, showcase their
            value, and scale with confidence.
          </p>
        </div>

        <div className="mission-stats fade-up" ref={statsRef}>
          {STATS.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
