"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Eye, EyeOff } from "lucide-react";
import Cookies from "js-cookie";
import BackgroundBeams from "@/components/BackgroundBeams";
import api from "@/lib/api";

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

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const resetMessage = params.get("message");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedUsername = credentials.username.trim();
    const trimmedPassword = credentials.password.trim();
    const formBody = new URLSearchParams();
    formBody.append("username", trimmedUsername);
    formBody.append("password", trimmedPassword);

    try {
      const response = await api.post("/auth/login", formBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      Cookies.set("token", response.data.access_token, { expires: 7 });
      localStorage.setItem("token", response.data.access_token);
      router.push("/gallery");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ?? "Unable to log in. Please verify your credentials.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof typeof credentials) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setCredentials((prev) => ({ ...prev, [field]: event.target.value }));

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
          Access your studio
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Continue crafting legendary AI visuals across every screen.
        </p>

        {resetMessage ? (
          <div className="mt-6 rounded-2xl border border-[#73ffdf]/40 bg-[#73ffdf]/10 px-4 py-3 text-sm text-[#73ffdf]">
            {resetMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="group flex flex-col gap-2 text-sm">
            <span
              className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
            >
              Username or Email
            </span>
            <div className="relative">
              <input
                required
                type="text"
                value={credentials.username}
                onChange={handleChange("username")}
                placeholder="aurora.creator"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
              />
              <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            </div>
          </label>

          <label className="group flex flex-col gap-2 text-sm">
            <span
              className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
            >
              Password
            </span>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-10 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            </div>
            <div className="text-right text-xs text-white/50">
              <Link
                href="/auth/forgot-password"
                className={`${jetbrainsMono.className} text-[10px] uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors duration-300`}
              >
                Forgot Password?
              </Link>
            </div>
          </label>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs uppercase tracking-wider text-red-400 backdrop-blur-md">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${spaceGrotesk.className} w-full mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 py-3.5 min-h-[44px] lg:min-h-0 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSubmitting ? "Connecting" : "Initialize Session"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/50">
          Need an invite?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className={`${jetbrainsMono.className} text-[10px] uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors duration-300`}
          >
            Create an account
          </button>
        </p>
      </motion.section>
    </main>
  );
}
