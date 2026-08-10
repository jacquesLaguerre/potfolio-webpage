import { useEffect, useRef } from "react";

/** A slowly-rotating sphere of dots, drawn on canvas. Sized to fill its
    parent — the orbiting-circles globe only shows the top half, clipped by
    the section's overflow-hidden. */
export default function ParticleSphereAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const COUNT = 900;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const points = Array.from({ length: COUNT }, (_, i) => {
      const y = 1 - (i / (COUNT - 1)) * 2;
      return { phi: Math.acos(y), theta: goldenAngle * i };
    });

    let raf: number;
    let angle = 0;

    function resize() {
      const { width, height } = canvas!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) / 2;
      const isDark =
        document.documentElement.getAttribute("data-theme") !== "light";
      const rgb = isDark ? "125,150,255" : "70,95,220";

      angle += 0.0022;

      for (const p of points) {
        const y = Math.cos(p.phi);
        const x = Math.sin(p.phi) * Math.cos(p.theta + angle);
        const z = Math.sin(p.phi) * Math.sin(p.theta + angle);
        const depth = (z + 1) / 2;

        ctx!.globalAlpha = 0.15 + depth * 0.7;
        ctx!.fillStyle = `rgb(${rgb})`;
        ctx!.beginPath();
        ctx!.arc(
          cx + x * radius,
          cy - y * radius,
          0.5 + depth * 1.7,
          0,
          Math.PI * 2,
        );
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
