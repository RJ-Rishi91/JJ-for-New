import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28" data-testid="privacy-page">
      {/* Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#7B829A] hover:text-white transition mb-6 font-mono"
      >
        <ArrowLeft size={14} /> Back to Newsroom Home
      </Link>

      {/* Header Banner */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2d55]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-mono mb-4">
            <Shield size={13} /> Official Newsroom Legal Protocol
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Privacy Policy &amp; Student Safety
          </h1>
          <p className="text-[#CBD0DC] text-sm sm:text-base leading-relaxed max-w-2xl">
            How Junior Journalist and the Young Gazette ecosystem collect, protect, and handle data for student reporters, high school contributors, and global readers.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#7B829A] mt-6 pt-4 border-t border-white/10">
            <span>Effective Date: {lastUpdated}</span>
            <span>•</span>
            <span>Jurisdiction: Global Youth Media</span>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-sm text-[#CBD0DC] leading-relaxed">
        {/* Section 1 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Lock size={18} className="text-[#ff758c]" /> 1. Commitment to Student &amp; Youth Privacy
          </h2>
          <p className="mb-3">
            Junior Journalist (operated under the Young Gazette youth media collective and powered by StudioRavya) is built from the ground up to protect student journalists, minor contributors, and educational communities.
          </p>
          <p>
            We believe youth journalism thrives when young reporters feel safe, protected from unwarranted surveillance, and empowered with complete authority over their public creative works. We do not sell, monetize, or rent student personal information to commercial data brokers or advertisers.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <FileText size={18} className="text-[#00FFA3]" /> 2. Information We Collect
          </h2>
          <ul className="space-y-3 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[#00FFA3] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Account Information:</strong> When registering as a student reporter or editor, we collect your full name, student or personal email address, city, and school/college affiliation.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[#00FFA3] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Editorial Submissions &amp; Media:</strong> Story drafts, headlines, opinion articles, photo essays, and media files uploaded to the submission desk.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[#00FFA3] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Reader Inquiries &amp; Newsletter:</strong> Email addresses provided via the newsletter subscription box or communications sent to the editorial desk.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-[#00FFA3] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Telemetry &amp; Gamification:</strong> Points, badges, reading history, and article reactions (fire, heart, insightful) stored to calculate leaderboard ranks.
              </div>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Eye size={18} className="text-[#00f2fe]" /> 3. Safeguards for Minors (COPPA &amp; Student Data Compliance)
          </h2>
          <p className="mb-3">
            Because a substantial portion of our newsroom collective consists of high-school journalists and underage students, we enforce special protective measures:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-1 text-[#00f2fe]">Pseudonym &amp; Byline Protection</h4>
              <p className="text-xs text-[#7B829A]">Student reporters investigating sensitive campus or municipal matters may request pen names or pseudonymous bylines to shield their identity from retaliation.</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-1 text-[#00f2fe]">No Targeted Behavioral Ads</h4>
              <p className="text-xs text-[#7B829A]">Our platform does not run behavioral cross-site trackers, third-party advertising cookies, or programmatic behavioral auctions.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3">
            4. Data Processors &amp; Infrastructure
          </h2>
          <p className="mb-2">
            Junior Journalist uses secure cloud infrastructure to host database collections, user profiles, and image assets:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#7B829A]">
            <li><strong className="text-white">Database:</strong> MongoDB Atlas (AWS Mumbai region) with end-to-end TLS 1.3 encryption and IP-restricted firewalls.</li>
            <li><strong className="text-white">Hosting:</strong> GitHub Pages (Frontend static delivery) and Render (Backend API services with automatic SSL termination).</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3">
            5. Your Rights &amp; Data Deletion
          </h2>
          <p className="mb-3">
            At any time, student contributors and readers have the unconditional right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Request a full export of all published works, draft articles, and account activity.</li>
            <li>Request permanent deletion of your student reporter account and erasure of identifying profile details.</li>
            <li>Unsubscribe from the Young Gazette weekly digest with a single click.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-[#ff2d55]/20 bg-[#ff2d55]/5">
          <h2 className="font-heading text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Mail size={18} className="text-[#ff758c]" /> 6. Privacy &amp; Data Officer Contact
          </h2>
          <p className="text-xs text-[#CBD0DC] mb-4">
            If you have questions regarding student data protection, byline retractions, or wish to execute your data rights, reach out directly to our editorial and compliance team:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <a
              href="mailto:editorial@juniorjournalist.org"
              className="text-[#ff758c] hover:underline"
            >
              editorial@juniorjournalist.org
            </a>
            <span className="text-white/20">•</span>
            <a
              href="mailto:privacy@onerishi.in"
              className="text-[#ff758c] hover:underline"
            >
              privacy@onerishi.in
            </a>
            <span className="text-white/20">•</span>
            <Link to="/contact/" className="text-white hover:underline">
              Submit Inquiry via Contact Desk &rarr;
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
