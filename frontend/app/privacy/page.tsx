"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicy() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 font-mono text-xs text-white/40 hover:text-cyan-400 transition-colors duration-200 min-h-[44px] py-2 lg:py-0"
        >
          <span>←</span>
          <span>[ BACK ]</span>
        </button>
        <h1 className="text-3xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
          Privacy Policy
        </h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed text-gray-400">
          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              01 // Data Collection
            </strong>
            <br />
            AuraForge Studio collects essential transmission data to power our AI
            generation engine. This includes email addresses, encrypted access
            tokens, and the raw text prompts used to forge assets.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              02 // Asset Ownership
            </strong>
            <br />
            All visions forged on this platform remain the intellectual property
            of the Creator. AuraForge claims no rights over the generated imagery
            stored in your personal Vault.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              03 // Security Protocols
            </strong>
            <br />
            We utilize enterprise-grade encryption to protect your identity and
            secure your creative signal. We do not sell your personal data to
            third-party data brokers.
          </p>

          <p className="pt-8 border-t border-white/10 font-mono text-xs text-gray-500">
            LAST_UPDATED: MARCH 2026 // END_OF_TRANSMISSION
          </p>
        </div>
      </div>
    </div>
  );
}
