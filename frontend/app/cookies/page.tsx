export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
          Cookie Policy
        </h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed text-gray-400">
          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              01 // Signal Cookies
            </strong>
            <br />
            AuraForge Studio uses minimal session cookies to maintain secure
            access, remember preferences, and keep your creative signal stable
            between missions.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              02 // Analytics Beacons
            </strong>
            <br />
            We collect anonymized telemetry to monitor performance, detect
            anomalies, and optimize the generation pipeline. No personal data is
            sold or shared.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              03 // Control Surface
            </strong>
            <br />
            You can disable non-essential cookies in your browser settings, but
            core authentication and vault access require secure session tokens.
          </p>

          <p className="pt-8 border-t border-white/10 font-mono text-xs text-gray-500">
            LAST_UPDATED: MARCH 2026 // END_OF_TRANSMISSION
          </p>
        </div>
      </div>
    </div>
  );
}
