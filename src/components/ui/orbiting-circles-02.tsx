import React from "react";
import { cn } from "@/lib/utils";
import ParticleSphereAnimation from "@/components/ui/orbiting-circles-02-utils/particalsphear";

interface OrbitIcon {
  src: string;
  alt: string;
  angle: number;
  /** True for logos that are solid black/near-black artwork — invisible
      against the dark theme's dark badge background unless inverted. */
  invertInDark?: boolean;
}

const orbits: { size: string; duration: number; icons: OrbitIcon[] }[] = [
  {
    size: "w-[440px] h-[440px] md:w-[720px] md:h-[720px]",
    duration: 18,
    icons: [
      { src: "/toolsLogos/typescript_logo.png", alt: "TypeScript", angle: -60 },
      { src: "/toolsLogos/javascript_logo.png", alt: "JavaScript", angle: 0 },
      { src: "/toolsLogos/css_logo.png", alt: "CSS", angle: 60 },
    ],
  },
  {
    size: "w-[600px] h-[600px] md:w-[880px] md:h-[880px]",
    duration: 24,
    icons: [
      { src: "/toolsLogos/react_logo.png", alt: "React", angle: -75 },
      { src: "/toolsLogos/nodejs_logo.png", alt: "Node.js", angle: -25 },
      {
        src: "/toolsLogos/nextjs_logo.png",
        alt: "Next.js",
        angle: 25,
        invertInDark: true,
      },
      { src: "/toolsLogos/vs_code.png", alt: "VS Code", angle: 75 },
    ],
  },
  {
    size: "w-[720px] h-[720px] md:w-[1060px] md:h-[1060px]",
    duration: 30,
    icons: [
      { src: "/toolsLogos/python_logo.png", alt: "Python", angle: -75 },
      { src: "/toolsLogos/Postgresql_elephant.svg.png", alt: "PostgreSQL", angle: -25 },
      { src: "/toolsLogos/supabase_logo.png", alt: "Supabase", angle: 25 },
      { src: "/toolsLogos/dockerLogo.png", alt: "Docker", angle: 75 },
    ],
  },
];

export default function OrbitingCirclesGlobe() {
  return (
    <div className="relative w-full h-[440px] md:h-[640px] overflow-hidden flex justify-center">
      <style>{`
        @keyframes orbit-cw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) + 360deg)) }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(var(--start-angle)) }
          to   { transform: rotate(calc(var(--start-angle) - 360deg)) }
        }
        @keyframes counter-cw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) - 360deg)) }
        }
        @keyframes counter-ccw {
          from { transform: rotate(var(--counter-offset, 0deg)) }
          to   { transform: rotate(calc(var(--counter-offset, 0deg) + 360deg)) }
        }
      `}</style>

      {/* Center particle globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 aspect-square pointer-events-none w-[300px] md:w-[580px] z-10">
        <ParticleSphereAnimation />
      </div>

      {/* Orbiting rings */}
      {orbits.map((orbit, index) => {
        const isCW = index % 2 === 0;
        const orbitAnim = isCW ? "orbit-cw" : "orbit-ccw";
        const counterAnim = isCW ? "counter-cw" : "counter-ccw";

        const allIcons = [
          ...orbit.icons,
          ...orbit.icons.map((ic) => ({
            ...ic,
            angle: ic.angle + 180,
            alt: `${ic.alt}-mirror`,
          })),
        ];

        return (
          <div
            key={index}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full border border-border ${orbit.size}`}
          >
            {allIcons.map((iconData, iconIndex) => (
              <div
                key={iconIndex}
                className="absolute top-0 left-1/2 h-1/2 -ml-8 origin-bottom flex flex-col justify-start items-center"
                style={
                  {
                    "--start-angle": `${iconData.angle}deg`,
                    animation: `${orbitAnim} ${orbit.duration}s linear infinite`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="p-3 sm:p-4 border border-border rounded-full bg-background -mt-8 relative z-10"
                  style={
                    {
                      "--counter-offset": `${-iconData.angle}deg`,
                      animation: `${counterAnim} ${orbit.duration}s linear infinite`,
                    } as React.CSSProperties
                  }
                >
                  <img
                    src={iconData.src}
                    alt={iconData.alt}
                    width={32}
                    height={32}
                    className={cn(
                      "w-6 h-6 md:w-8 md:h-8 object-contain",
                      iconData.invertInDark && "dark-invert",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
