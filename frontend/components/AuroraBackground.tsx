"use client";

import { motion } from "framer-motion";

const gradients = [
  {
    id: "aurora-1",
    duration: 28,
    delay: 0,
    colors: "from-[#7f5cff]/50 via-transparent to-transparent",
    style: { top: "10%", left: "-15%", width: "55vw", height: "55vw" },
  },
  {
    id: "aurora-2",
    duration: 32,
    delay: 4,
    colors: "from-[#73ffdf]/40 via-transparent to-transparent",
    style: { bottom: "-10%", right: "-10%", width: "60vw", height: "60vw" },
  },
  {
    id: "aurora-3",
    duration: 36,
    delay: 2,
    colors: "from-[#ff6ad5]/45 via-transparent to-transparent",
    style: { top: "20%", right: "-20%", width: "50vw", height: "50vw" },
  },
];

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#04040a]" />
      {gradients.map((gradient) => (
        <motion.div
          key={gradient.id}
          initial={{ opacity: 0.3, scale: 0.95 }}
          animate={{ opacity: 0.8, scale: 1.15 }}
          transition={{
            duration: gradient.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: gradient.delay,
          }}
          style={gradient.style}
          className={`absolute rounded-full bg-gradient-to-r blur-3xl ${gradient.colors}`}
        />
      ))}
    </div>
  );
}
