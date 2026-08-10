import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

/** Tilts and scales its child into place as it scrolls into view — no extra
    wrapper box, just the card itself settling flat. */
export const ContainerScroll = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // 0 as the card's top enters the bottom 10% of the viewport, 1 once it
    // has scrolled 60% of the way up — settled well before it's centred.
    offset: ["start 90%", "start 40%"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [0.9, 1] : [0.94, 1],
  );
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <div
      ref={containerRef}
      className="flex w-full justify-center"
      style={{ perspective: "1000px" }}
    >
      <motion.div style={{ rotateX: rotate, scale, opacity }}>
        {children}
      </motion.div>
    </div>
  );
};
