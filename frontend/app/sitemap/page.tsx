export default function SiteMap() {
  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
          Site Map
        </h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed text-gray-400">
          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              01 // Core Routes
            </strong>
            <br />
            Landing, Studio, Creator Dossier, Vault, and system authentication
            flows live here to anchor your AuraForge operations.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              02 // Legal Protocols
            </strong>
            <br />
            Privacy Policy, Cookie Policy, and Terms of Service provide the
            compliance layer for every transmission.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              03 // Support Channels
            </strong>
            <br />
            Use the comms channel in the global footer to reach the AuraForge
            team for enterprise, security, or partnership requests.
          </p>

          <p className="pt-8 border-t border-white/10 font-mono text-xs text-gray-500">
            LAST_UPDATED: MARCH 2026 // END_OF_TRANSMISSION
          </p>
        </div>
      </div>
    </div>
  );
}
