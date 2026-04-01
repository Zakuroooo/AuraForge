"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import BackgroundBeams from "@/components/BackgroundBeams";
import api from "@/lib/api";

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

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (pwd: string): number => {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/\d/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthMeta = [
    { label: "WEAK",    color: "bg-red-500" },
    { label: "FAIR",    color: "bg-orange-400" },
    { label: "STRONG",  color: "bg-yellow-400" },
    { label: "MAXIMUM", color: "bg-emerald-400" },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      };
      await api.post("/auth/register", payload);
      router.push("/auth/login");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data
          ?.detail ??
        "We couldn't complete your registration. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

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
          Create your AuraForge ID
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          Unlock premium AI workflows and sync your galleries across every
          device.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {(
            [
              {
                label: "Username",
                type: "text",
                field: "username",
                placeholder: "astrovision",
              },
              {
                label: "Email",
                type: "email",
                field: "email",
                placeholder: "you@auraforge.studio",
              },
            ] as const
          ).map(({ label, type, field, placeholder }) => (
            <label key={field} className="group flex flex-col gap-2 text-sm">
              <span
                className={`${jetbrainsMono.className} block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide`}
              >
                {label}
              </span>
              <div className="relative">
                <input
                  required
                  type={type}
                  value={form[field]}
                  onChange={handleChange(field)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus:bg-black/80"
                />
                <span className="pointer-events-none absolute inset-0 rounded-xl border border-white/5 opacity-0 blur-xl transition group-focus-within:opacity-100" />
              </div>
            </label>
          ))}

          {/* Password field with show/hide toggle + strength meter */}
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
                value={form.password}
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
            {/* Strength meter */}
            {form.password.length > 0 && (() => {
              const score = getPasswordStrength(form.password);
              const meta = strengthMeta[score - 1];
              return (
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          bar <= score ? meta.color : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-widest ${
                      score === 1 ? "text-red-500" :
                      score === 2 ? "text-orange-400" :
                      score === 3 ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}
                  >
                    {meta?.label}
                  </span>
                </div>
              );
            })()}
          </label>

          {error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs uppercase tracking-wider text-red-400 backdrop-blur-md">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${spaceGrotesk.className} group w-full mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 py-3.5 min-h-[44px] lg:min-h-0 text-white text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSubmitting ? "Creating" : "Create Account"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/50">
          Already joined?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className={`${jetbrainsMono.className} text-[10px] uppercase tracking-widest text-gray-400 hover:text-cyan-400 transition-colors duration-300`}
          >
            Log in
          </button>
        </p>
      </motion.section>
    </main>
  );
}
