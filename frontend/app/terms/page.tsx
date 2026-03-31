export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a16] text-gray-300 pt-32 pb-24 px-6 relative z-10">
      <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/[0.02] border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-8">
          Terms of Service
        </h1>
        <div className="space-y-6 font-sans text-sm leading-relaxed text-gray-400">
          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              01 // Usage Guidelines
            </strong>
            <br />
            AuraForge Studio grants Creators access to the generation console.
            You agree to use the service for lawful, respectful, and authorized
            creative work. You are responsible for the prompts and outputs you
            generate.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              02 // Creator Responsibilities
            </strong>
            <br />
            You retain ownership of your generated assets, but you must not
            upload or forge content that infringes on third-party rights or
            violates applicable laws.
          </p>

          <p>
            <strong className="text-cyan-400 font-mono tracking-widest uppercase text-xs">
              03 // Service Conduct
            </strong>
            <br />
            We may throttle or suspend access for abuse, security threats, or
            violations of these protocols. Service availability is provided as-is
            and may change during scheduled maintenance windows.
          </p>

          <p className="pt-8 border-t border-white/10 font-mono text-xs text-gray-500">
            LAST_UPDATED: MARCH 2026 // END_OF_TRANSMISSION
          </p>
        </div>
      </div>
    </div>
  );
}
