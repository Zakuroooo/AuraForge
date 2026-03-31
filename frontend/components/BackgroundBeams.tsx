"use client";

import { motion } from "framer-motion";

type BeamConfig = {
  delay: number;
  duration: number;
  top: string;
  hue: string;
};

const beams: BeamConfig[] = [
  {
    delay: 0,
    duration: 14,
    top: "20%",
    hue: "from-[#6c63ff]/80 to-transparent",
  },
  {
    delay: 2,
    duration: 18,
    top: "50%",
    hue: "from-[#7f5cff]/70 to-transparent",
  },
  {
    delay: 4,
    duration: 16,
    top: "75%",
    hue: "from-[#00f5ff]/60 to-transparent",
  },
];

export default function BackgroundBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(108,99,255,0.2),_transparent_65%)]" />
      {beams.map((beam) => (
        <motion.span
          key={beam.top}
          initial={{ x: "-40%", opacity: 0.3 }}
          animate={{ x: "120%", opacity: 0.75 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            duration: beam.duration,
            delay: beam.delay,
          }}
          className={`absolute ${beam.hue} h-[35rem] w-52 -translate-y-1/2 rounded-full bg-gradient-to-b blur-3xl opacity-70 mix-blend-screen`}
          style={{ top: beam.top as string }}
        />
      ))}
      <motion.div
        className="absolute inset-x-0 bottom-[-30%] h-[60%] w-full bg-[radial-gradient(circle,_rgba(0,255,214,0.15),_transparent_65%)]"
        animate={{ scale: [0.9, 1.1, 0.95] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
      />
    </div>
  );
}
