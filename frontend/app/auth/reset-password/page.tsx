"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { LockKeyhole } from "lucide-react";

import BackgroundBeams from "@/components/BackgroundBeams";

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const resetEndpoint = "http://localhost:8001/auth/reset-password-confirm";
const successMessage = "Password Changed!";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params.get("token") ?? "").trim();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage("Reset link missing or invalid. Request a new one.");
      return;
    }

    const trimmedNewPassword = form.newPassword.trim();
    const trimmedConfirmPassword = form.confirmPassword.trim();

    if (trimmedNewPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (trimmedNewPassword !== trimmedConfirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(resetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: trimmedNewPassword }),
      });

      if (response.status === 410) {
        setStatus("error");
        setMessage("Link Expired. Please request a new one.");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail ?? "Unable to reset password right now.");
      }

      setStatus("success");
      setMessage(successMessage);
      window.setTimeout(() => {
        router.push(
          `/auth/login?message=${encodeURIComponent(successMessage)}`,
        );
      }, 600);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to reset password right now.",
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
          Set a new password
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Choose a strong password to secure your AuraForge account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="group flex flex-col gap-2 text-sm">
            <span
              className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
            >
              New password
            </span>
            <div className="relative">
              <input
                required
                type="password"
                value={form.newPassword}
                onChange={updateField("newPassword")}
                placeholder="Create a strong password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
              />
              <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            </div>
          </label>

          <label className="group flex flex-col gap-2 text-sm">
            <span
              className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
            >
              Confirm password
            </span>
            <div className="relative">
              <input
                required
                type="password"
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
                placeholder="Repeat the new password"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
              />
              <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${spaceGrotesk.className} w-full mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 py-3.5 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <LockKeyhole className="h-5 w-5" />
            {isSubmitting ? "Updating" : "Update Password"}
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
          Need a fresh link?{" "}
          <Link
            href="/auth/forgot-password"
            className={`${jetbrainsMono.className} text-[10px] uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors duration-300`}
          >
            Request a new reset
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
