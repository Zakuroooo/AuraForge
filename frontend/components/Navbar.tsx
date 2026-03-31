"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/" || pathname?.includes("/auth");
  const isAssetForgeActive =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/gallery");
  const isCreatorDossierActive = pathname?.startsWith("/profile");

  const handleLogout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/");
  };

  return (
    <header className="relative w-full fixed top-0 left-0 z-[60] border-b border-white/[0.05] backdrop-blur-xl bg-[#0a0a16]/80 h-16 flex items-center justify-between px-8 shadow-2xl">
      <Link
        href="/"
        className="flex items-center gap-3 text-white transition hover:opacity-90"
        aria-label="AuraForge home"
      >
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_12px_35px_rgba(124,92,255,0.45)]" />
          <span className="absolute right-1 top-1 h-7 w-7 rounded-full bg-[#05050a]" />
          <motion.span
            className="absolute inset-0 rounded-full border border-cyan-200/40"
            animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />
        </span>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 font-bold tracking-widest text-[11px] uppercase">
          AuraForge Studio
        </span>
      </Link>
      <motion.span
        className="pointer-events-none absolute left-16 top-1/2 h-px w-[60%] -translate-y-1/2 bg-gradient-to-r from-cyan-300/0 via-cyan-300/60 to-purple-400/0"
        animate={{ x: [0, 120], opacity: [0, 0.7, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {!isAuthPage ? (
        <nav className="flex items-center gap-4">
          <Link
            href="/gallery"
            className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
              isAssetForgeActive
                ? "text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                : "text-gray-500 hover:text-cyan-300"
            }`}
          >
            // ASSET_FORGE
          </Link>
          <Link
            href="/profile"
            className={`font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
              isCreatorDossierActive
                ? "text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                : "text-gray-500 hover:text-cyan-400"
            }`}
          >
            // DOSSIER
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500/70 hover:text-red-400 border border-red-500/20 px-4 py-1.5 rounded-sm bg-red-500/5 hover:bg-red-500/10 transition-all"
          >
            [ END_SESSION ]
          </button>
        </nav>
      ) : (
        <div className="h-10" />
      )}
    </header>
  );
}
