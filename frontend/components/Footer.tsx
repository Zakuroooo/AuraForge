import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#05050A] border-t border-white/[0.05] relative z-50">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-40 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Image
                src="/auraforge-logo.png"
                alt="AuraForge Neural Core"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              AuraForge Studio
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 leading-loose uppercase tracking-widest">
            <p>{"\u00A9"} 2026 AURAFORGE STUDIO</p>
            <p className="mt-1">// DESIGN & COPYRIGHT PATENTS</p>
            <p className="mt-1">// ALL RIGHTS RESERVED</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-white uppercase tracking-[0.2em] mb-2">
            Legal_Protocols
          </h4>
          <nav className="flex flex-col gap-4 font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors w-fit">
              Privacy Policy
            </Link>
            <Link href="/cookies" className="hover:text-cyan-400 transition-colors w-fit">
              Cookie Policy
            </Link>
            <Link href="/terms" className="hover:text-cyan-400 transition-colors w-fit">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="hover:text-cyan-400 transition-colors w-fit">
              Site Map
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-mono text-xs text-white uppercase tracking-[0.2em] mb-2">
            Comms_Channel
          </h4>
          <p className="font-sans text-sm text-gray-400 mb-2">
            Open a direct channel for collaborations, bug reports, or enterprise
            API access.
          </p>
          <a
            href="mailto:teamauraforge.studio@gmail.com?subject=AuraForge%20Network%20Inquiry"
            className="inline-flex items-center gap-2 font-mono text-xs text-cyan-400 border border-cyan-500/30 bg-cyan-500/5 px-4 py-2.5 rounded-sm hover:bg-cyan-500/15 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all w-fit uppercase tracking-widest"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            [ INITIATE_TRANSMISSION ]
          </a>
        </div>
      </div>
    </footer>
  );
}
