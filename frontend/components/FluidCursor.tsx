"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function FluidCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.2 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 20);
      y.set(event.clientY - 20);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      style={{ translateX: springX, translateY: springY }}
      className="pointer-events-none fixed z-50 h-10 w-10 rounded-full bg-gradient-to-br from-[#7f5cff]/40 to-[#73ffdf]/30 blur-2xl"
    />
  );
}
