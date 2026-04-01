"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { MailCheck } from "lucide-react";

import BackgroundBeams from "@/components/BackgroundBeams";

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" as const } },
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim();
      const response = await fetch(`${apiBase}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data?.detail ??
            "We couldn't send the recovery email. Please try again.",
        );
      }

      setStatus("success");
      setMessage("Recovery email sent! Check your inbox.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a16] px-6 py-16 text-white">
      <BackgroundBeams />
      <div className="pointer-events-none absolute left-[-10%] top-12 h-64 w-64 rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-72 w-72 rounded-full bg-purple-500/20 blur-[160px]" />

      <motion.section
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl"
      >
        <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent inline-block font-bold tracking-widest text-[10px] uppercase mb-6">
          AuraForge STUDIO
        </span>
        <h1
          className={`${spaceGrotesk.className} text-2xl font-bold text-white tracking-tighter mb-2`}
        >
          Forgot password?
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          We'll send a secure reset link so you can get back to forging in
          minutes.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="group flex flex-col gap-2 text-sm">
            <span
              className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
            >
              Account email
            </span>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@studio.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
              />
              <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${spaceGrotesk.className} w-full mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 py-3.5 min-h-[44px] lg:min-h-0 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <MailCheck className="h-5 w-5" />
            {isSubmitting ? "Sending" : "Send Reset Link"}
          </button>
        </form>

        {status !== "idle" ? (
          <div
            role="status"
            className={
              status === "success"
                ? "mt-6 rounded-2xl border border-[#73ffdf]/40 bg-[#73ffdf]/10 px-4 py-3 text-sm text-[#73ffdf] backdrop-blur-md"
                : "mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs uppercase tracking-wider text-red-400 backdrop-blur-md"
            }
          >
            {message}
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-white/50">
          Remembered your password?{" "}
          <Link
            href="/auth/login"
            className={`${jetbrainsMono.className} text-[10px] uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors duration-300`}
          >
            Return to login
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
