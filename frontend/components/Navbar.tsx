"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage =
    pathname === "/" ||
    pathname?.includes("/auth") ||
    ["/privacy", "/terms", "/cookies", "/sitemap"].includes(pathname ?? "");
  const isAssetForgeActive =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/gallery");
  const isCreatorDossierActive = pathname?.startsWith("/profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navAvatarUrl, setNavAvatarUrl] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fromStorage = localStorage.getItem("token");
    const fromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (fromStorage || fromCookie) {
      setIsLoggedIn(true);
      // Sync: if cookie exists but localStorage doesn't, fix it
      if (fromCookie && !fromStorage) {
        localStorage.setItem("token", fromCookie);
      }
      const avatar = localStorage.getItem("avatarUrl");
      if (avatar) setNavAvatarUrl(avatar);
    } else {
      setIsLoggedIn(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("avatarUrl");
    }
    setIsLoggedIn(false);
    router.push("/");
  };

  return (
    <>
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
        {!isAuthPage && isLoggedIn ? (
          <>
            {/* Desktop nav — hidden below lg */}
            <nav className="hidden lg:flex items-center gap-4">
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
                className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all ${
                  isCreatorDossierActive
                    ? "text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    : "text-gray-500 hover:text-cyan-400"
                }`}
              >
                {navAvatarUrl ? (
                  <img
                    src={navAvatarUrl}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-400/50 shrink-0"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500/40 to-purple-500/40 border border-cyan-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                    A
                  </span>
                )}
                <span className="hidden lg:inline">// DOSSIER</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500/70 hover:text-red-400 border border-red-500/20 px-4 py-1.5 rounded-sm bg-red-500/5 hover:bg-red-500/10 transition-all"
              >
                [ END_SESSION ]
              </button>
            </nav>

            {/* Hamburger button — visible only below lg */}
            <button
              type="button"
              aria-label="Toggle mobile menu"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-9 h-9 rounded-sm border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <span
                className={`block h-px w-5 bg-cyan-400 transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[6px]" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-cyan-400 transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px w-5 bg-cyan-400 transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}
              />
            </button>
          </>
        ) : (
          <div className="h-10" />
        )}
      </header>

      {/* Mobile dropdown menu */}
      {!isAuthPage && isLoggedIn && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              key="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="lg:hidden fixed top-16 left-0 right-0 z-[59] border-b border-white/[0.05] bg-[#0a0a16]/95 backdrop-blur-xl px-8 py-4 flex flex-col gap-4 shadow-2xl"
            >
              <Link
                href="/gallery"
                onClick={() => setMobileOpen(false)}
                className={`font-mono text-xs uppercase tracking-[0.2em] py-2 border-b border-white/[0.05] transition-all ${
                  isAssetForgeActive
                    ? "text-cyan-400"
                    : "text-gray-500 hover:text-cyan-300"
                }`}
              >
                // ASSET_FORGE
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={`inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] py-2 border-b border-white/[0.05] transition-all ${
                  isCreatorDossierActive
                    ? "text-cyan-400"
                    : "text-gray-500 hover:text-cyan-400"
                }`}
              >
                {navAvatarUrl ? (
                  <img
                    src={navAvatarUrl}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-cyan-400/50 shrink-0"
                  />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-500/40 to-purple-500/40 border border-cyan-500/30 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                    A
                  </span>
                )}
                // DOSSIER
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="font-mono text-xs uppercase tracking-[0.2em] text-red-500/70 hover:text-red-400 border border-red-500/20 px-4 py-2.5 rounded-sm bg-red-500/5 hover:bg-red-500/10 transition-all text-left"
              >
                [ END_SESSION ]
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
