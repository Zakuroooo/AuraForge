"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const tiltSpringConfig = { damping: 15, stiffness: 150, mass: 0.1 };
const springConfig = { damping: 20, stiffness: 250, mass: 0.2 };

const headingContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const headingWord = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 140, damping: 14 },
  },
};

type ArtCard = {
  title: string;
  label: string;
  image: string;
  className: string;
  rotate: number;
  depth: number;
  delay: number;
};

const artCards: ArtCard[] = [
  {
    title: "Neon Cyberpunk City",
    label: "Electric Metropolis",
    image:
      "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=80",
    className: "left-0 top-10",
    rotate: -8,
    depth: 60,
    delay: 0,
  },
  {
    title: "Mystic Forest Sanctum",
    label: "Emerald Aura",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    className: "right-0 top-0",
    rotate: 7,
    depth: 40,
    delay: 0.4,
  },
  {
    title: "Futuristic Portrait",
    label: "Synthetic Soul",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    className: "left-12 bottom-0",
    rotate: 2,
    depth: 20,
    delay: 0.8,
  },
];

const valueProps = [
  {
    title: "Enhance Prompt",
    description: "AI refines your raw ideas into cinematic prompts.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-400"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    title: "Forge in Seconds",
    description: "Sub-second generation powered by state-of-the-art models.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-400"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "Own Your History",
    description: "Secure, encrypted, and completely private gallery.",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-400"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const artHallRowOne = [
  {
    src: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=80",
    alt: "Cyberpunk city skyline",
  },
  {
    src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
    alt: "Neon alley portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    alt: "Futuristic city street",
  },
  {
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    alt: "Futuristic portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    alt: "Futuristic car glow",
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    alt: "Neon city lights",
  },
];

const artHallRowTwo = [
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    alt: "Mystical forest canopy",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    alt: "Ethereal forest trail",
  },
  {
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=900&q=80",
    alt: "Mystic waterfall",
  },
  {
    src: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=900&q=80",
    alt: "Futuristic roadster",
  },
  {
    src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80",
    alt: "Neon portrait close-up",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    alt: "Cyberpunk skyline mist",
  },
];

type MagneticLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

function MagneticLink({ href, children, className }: MagneticLinkProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.2 });
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.2 });
  const linkRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMove = (event: globalThis.MouseEvent) => {
      const node = linkRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const threshold = Math.max(rect.width, rect.height) / 2 + 20;

      if (distance < threshold) {
        x.set(dx * 0.18);
        y.set(dy * 0.18);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="inline-flex"
      ref={linkRef}
    >
      <Link
        href={href}
        className={
          className ??
          "group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-300 via-cyan-200 to-purple-300 px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_18px_45px_rgba(76,201,240,0.35)] transition hover:shadow-[0_24px_60px_rgba(124,92,255,0.5)]"
        }
      >
        {children}
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });
  const rotateXRaw = useTransform(pointerY, [0, viewport.height], [15, -15]);
  const rotateYRaw = useTransform(pointerX, [0, viewport.width], [-15, 15]);
  const rotateX = useSpring(rotateXRaw, tiltSpringConfig);
  const rotateY = useSpring(rotateYRaw, tiltSpringConfig);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const handleMove = (event: globalThis.MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  const handleHeroMove = (event: MouseEvent<HTMLDivElement>) => {
    const node = heroRef.current;
    if (!node) return;
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
  };

  const handleHeroLeave = () => {
    pointerX.set(viewport.width / 2);
    pointerY.set(viewport.height / 2);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#05050a] to-[#0a0a16] px-4 py-24 text-white sm:px-10 lg:px-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(115,255,223,0.18), transparent 45%), radial-gradient(circle at 80% 20%, rgba(157,141,255,0.22), transparent 48%), radial-gradient(circle at 50% 80%, rgba(72,144,255,0.16), transparent 46%)",
            backgroundSize: "140% 140%, 160% 160%, 180% 180%",
            filter: "blur(40px)",
          }}
          animate={{
            backgroundPosition: [
              "0% 0%, 100% 0%, 50% 50%",
              "100% 100%, 0% 100%, 40% 60%",
              "0% 0%, 100% 0%, 50% 50%",
            ],
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-[42%] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-70 blur-3xl"
          style={{
            backgroundImage:
              "conic-gradient(from 90deg, rgba(115,255,223,0.15), rgba(157,141,255,0.45), rgba(72,144,255,0.2), rgba(115,255,223,0.15))",
            maskImage:
              "radial-gradient(circle, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 58%, transparent 72%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 140, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-[42%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 opacity-70 blur-2xl mix-blend-screen"
          style={{
            backgroundImage:
              "radial-gradient(rgba(115,255,223,0.5) 1px, transparent 1px), radial-gradient(rgba(157,141,255,0.55) 1px, transparent 1px)",
            backgroundSize: "110px 110px, 160px 160px",
            backgroundPosition: "0 0, 60px 80px",
            maskImage:
              "radial-gradient(circle, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 75%)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        className="fixed left-0 top-0 z-50 h-96 w-96 rounded-full bg-cyan-500/15 blur-[100px] mix-blend-screen pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        aria-hidden="true"
      />

      <div
        ref={heroRef}
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative z-20 mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="hidden lg:flex order-1 w-full justify-center lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative h-[440px] w-[320px] sm:h-[520px] sm:w-[420px]"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              <div className="absolute inset-0 rounded-[48px] bg-white/5 blur-3xl" />
              {artCards.map((card) => (
                <motion.div
                  key={card.title}
                  className={`absolute ${card.className} w-[240px] sm:w-[280px]`}
                  style={{
                    rotate: card.rotate,
                    rotateX,
                    rotateY,
                    translateZ: card.depth,
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: [0, -12, 0] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: card.delay,
                  }}
                >
                  <div className="rounded-3xl border border-white/15 bg-white/10 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                    <div className="relative h-40 overflow-hidden rounded-2xl sm:h-48">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 640px) 240px, 280px"
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="px-3 py-3 sm:px-4">
                      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/60">
                        {card.label}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold text-white">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="order-2 text-center lg:text-left lg:order-1">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative inline-flex items-center"
          >
            <span className="absolute inset-0 rounded-full bg-[#7f5cff]/20 blur-md opacity-60 animate-[pulse_7s_ease-in-out_infinite]" />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-[#9d8dff]" />
              AURAFORGE PRO
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={headingContainer}
            className={`${inter.className} mt-6 text-4xl font-semibold leading-tight tracking-[0.04em] sm:text-5xl lg:text-6xl`}
          >
            {["Forge", "Your", "Imagination."].map((word) => (
              <motion.span
                key={word}
                variants={headingWord}
                className={`block ${
                  word === "Imagination." ? "text-transparent" : "text-white"
                }`}
                style={
                  word === "Imagination."
                    ? {
                        backgroundImage:
                          "linear-gradient(90deg, rgba(115,255,223,1) 0%, rgba(157,141,255,1) 100%)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      }
                    : undefined
                }
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            variants={fadeUp}
            className="mt-6 max-w-xl text-base text-white/70 sm:text-lg"
          >
            An AI creation studio built for cinematic prompts, luminous worlds,
            and product-ready visuals. Guide the model, refine every detail, and
            deliver instantly.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start"
          >
            <MagneticLink href="/auth/login">
              Get Started
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </MagneticLink>
            <MagneticLink
              href="/auth/login"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
            >
              Login
            </MagneticLink>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 lg:bottom-[-140px] left-1/2 z-0 h-72 w-[120%] -translate-x-1/2 opacity-45">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(115,255,223,0.35) 1px, transparent 1px), linear-gradient(to top, rgba(157,141,255,0.25) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.9) 70%, transparent 100%)",
            transform: "translateY(30%) perspective(900px) rotateX(70deg)",
          }}
        />
      </div>

      <section className="relative z-20 mt-24">
        <div className="mx-auto grid w-full max-w-[1600px] gap-6 md:grid-cols-3">
          {valueProps.map((item) => {
            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative z-20 mt-20 overflow-hidden">
        <div
          className="mx-auto w-full max-w-[1600px]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div className="flex w-max flex-row gap-6 animate-marquee hover:[animation-play-state:paused]">
            {[...artHallRowOne, ...artHallRowOne].map((image, index) => (
              <img
                key={`${image.src}-${index}`}
                src={image.src}
                alt={image.alt}
                className="relative h-64 w-auto rounded-xl object-cover brightness-75 transition-all duration-500 ease-out hover:scale-105 hover:brightness-125 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:z-20 cursor-pointer"
                loading="lazy"
              />
            ))}
          </div>
          <div className="mt-6" style={{ transform: "scaleX(-1)" }}>
            <div className="flex w-max flex-row gap-6 animate-marquee hover:[animation-play-state:paused]">
              {[...artHallRowTwo, ...artHallRowTwo].map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  style={{ transform: "scaleX(-1)" }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="relative h-64 w-auto rounded-xl object-cover brightness-75 transition-all duration-500 ease-out hover:scale-105 hover:brightness-125 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:z-20 cursor-pointer"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
