import React from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, Award, AlertTriangle, Scale, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28" data-testid="terms-page">
      {/* Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#7B829A] hover:text-white transition mb-6 font-mono"
      >
        <ArrowLeft size={14} /> Back to Newsroom Home
      </Link>

      {/* Header Banner */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7000ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7000ff]/20 border border-[#7000ff]/40 text-[#00f2fe] text-xs font-mono mb-4">
            <Scale size={13} /> Contributor &amp; Reader Agreement
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Terms of Service &amp; Contributor Rights
          </h1>
          <p className="text-[#CBD0DC] text-sm sm:text-base leading-relaxed max-w-2xl">
            Guidelines governing creative contributions, copyright ownership, ethical obligations, and newsroom conduct on the Junior Journalist platform.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#7B829A] mt-6 pt-4 border-t border-white/10">
            <span>Last Updated: {lastUpdated}</span>
            <span>•</span>
            <span>Young Gazette Editorial Collective</span>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-[#CBD0DC] leading-relaxed">
        {/* Section 1 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <FileCheck size={18} className="text-[#00FFA3]" /> 1. Contributor Eligibility &amp; Accounts
          </h2>
          <p className="mb-3">
            Junior Journalist invites youth writers, student photographers, video reporters, and school journalists worldwide to participate. By creating an account, you affirm that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>You will provide genuine credentials (name, valid email, and educational affiliation).</li>
            <li>You will safeguard your account password and notify the desk immediately of unauthorized access.</li>
            <li>You respect our community mission to cultivate truthful, independent student journalism.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Award size={18} className="text-[#FFA028]" /> 2. You Own Your Stories (Copyright &amp; Licensing)
          </h2>
          <p className="mb-3">
            Unlike commercial publishers that strip student journalists of their creative intellectual property, Junior Journalist upholds a creator-first policy:
          </p>
          <div className="bg-black/30 rounded-xl p-5 border border-white/5 my-3 text-xs leading-relaxed space-y-2">
            <p className="text-white font-medium">
              &bull; <strong>Retained Ownership:</strong> You retain 100% intellectual copyright over all text, reporting, audio, and photography you submit.
            </p>
            <p className="text-[#CBD0DC]">
              &bull; <strong>Non-Exclusive License:</strong> You grant Junior Journalist a non-exclusive, worldwide, royalty-free license to display, archive, and include your work in official digital anthologies (such as <em>Young Gazette Quarterly</em>) and promotional newsroom highlights, with proper byline attribution to you.
            </p>
            <p className="text-[#CBD0DC]">
              &bull; <strong>Cross-Publishing:</strong> Because your license to us is non-exclusive, you remain free to republish your story in your high-school paper, personal blog, or portfolio.
            </p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#ff2d55]" /> 3. Plagiarism &amp; Fabrication (Zero Tolerance)
          </h2>
          <p className="mb-3">
            Journalism relies on truth. Submissions found to contain copied text without citation, manufactured sources, faked interviews, or stolen media will be immediately rejected. Repeat violations will lead to permanent revocation of student reporter clearances.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#00f2fe]" /> 4. Newsroom Chat &amp; Community Conduct
          </h2>
          <p className="mb-3">
            On newsroom channels, discussion forums, and collaborative campaign workspaces, all participants must practice collegiality. Harassment, hate speech, bullying, doxxing, or malicious disruption will result in immediate suspension.
          </p>
        </section>

        {/* Section 5 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3">
            5. Editorial Board Discretion
          </h2>
          <p>
            The Junior Journalist Editorial Board reserves the right to review, request factual revisions, add context, or decline any submission that violates our code of ethics, contains libelous content, or fails verification protocols.
          </p>
        </section>
      </div>
    </div>
  );
}
