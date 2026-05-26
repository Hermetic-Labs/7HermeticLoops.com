import { Link } from 'react-router-dom';
import { Award, CheckCircle, ExternalLink, BookOpen, Code, Rocket, Shield, Users } from 'lucide-react';

export function CertificationsPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            HIDE Certification
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            <span className="text-amber-400 font-semibold">Hermetic Independent Development Environment</span>
            {' '}— Master the tools, publish your first package, and earn a verified certificate you can share on LinkedIn.
          </p>
        </div>

        {/* What You'll Learn */}
        <div className="cyber-panel p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" /> What You'll Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Code, title: 'Build EVE-OS Modules', desc: 'Create production-ready packages using the EVE-OS SDK and development framework.' },
              { icon: Shield, title: 'Quality & Compliance', desc: 'Meet Hermetic Labs quality standards for the Exchange marketplace.' },
              { icon: Rocket, title: 'Publish & Deploy', desc: 'Submit, review, and deploy packages to the Hermetic Labs Exchange.' },
              { icon: Users, title: 'Community & Support', desc: 'Engage with the developer community and build your brand as a verified seller.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/5">
                <Icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium mb-1">{title}</div>
                  <div className="text-gray-500 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="cyber-panel p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Your Certificate
          </h2>
          <div className="relative bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0a0f1a] border border-amber-500/30 rounded-lg p-8 text-center">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-500/40 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-500/40 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 rounded-br-lg" />

            <div className="flex items-center gap-2 justify-center mb-4">
              <img
                src={`${import.meta.env.BASE_URL}images/Hermetci Labs Exchange Logo.png`}
                alt="Hermetic Labs"
                className="w-8 h-8 object-contain"
              />
              <span className="text-amber-400 font-bold tracking-wider uppercase text-sm">Hermetic Labs</span>
            </div>
            <div className="text-gray-500 text-xs tracking-widest uppercase mb-4">Certificate of Completion</div>
            <Award className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
            <div className="text-gray-500 text-sm mb-2 uppercase">This certifies that</div>
            <div className="text-2xl font-bold text-white mb-2">Your Name Here</div>
            <div className="text-gray-500 text-sm mb-2 uppercase">has successfully completed</div>
            <div className="text-lg font-semibold text-amber-400 mb-4">HIDE: Hermetic Independent Development Environment</div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mx-auto mb-4" />
            <div className="flex items-center gap-6 justify-center text-xs text-gray-500">
              <div>
                <div className="uppercase tracking-wider mb-0.5">Certificate ID</div>
                <div className="text-gray-400 font-mono">HL-HIDE-XXXXXXXX</div>
              </div>
              <div>
                <div className="uppercase tracking-wider mb-0.5">Issuer</div>
                <div className="text-gray-400">Hermetic Labs</div>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4 text-center">
            Each certificate includes a unique verification link you can share on LinkedIn and include on your resume.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="cyber-panel p-6 text-center">
            <CheckCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <div className="text-white font-medium mb-1">Verifiable</div>
            <div className="text-gray-500 text-sm">Unique certificate ID with public verification URL</div>
          </div>
          <div className="cyber-panel p-6 text-center">
            <ExternalLink className="w-8 h-8 text-[#0077B5] mx-auto mb-3" />
            <div className="text-white font-medium mb-1">LinkedIn Ready</div>
            <div className="text-gray-500 text-sm">One-click add to your LinkedIn profile credentials</div>
          </div>
          <div className="cyber-panel p-6 text-center">
            <Award className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <div className="text-white font-medium mb-1">Printable</div>
            <div className="text-gray-500 text-sm">Clean print layout for physical certificates</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Course coming soon. Join the Exchange to be notified when enrollment opens.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
          >
            <Award className="w-4 h-4" /> Browse the Exchange
          </Link>
        </div>

      </div>
    </div>
  );
}
