import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Cpu, FileQuestion, Sparkles, Scale, AlertCircle, ArrowLeft } from 'lucide-react';

export default function EditorialStandardsPage() {
  const lastUpdated = "September 20, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28" data-testid="editorial-standards-page">
      {/* Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#7B829A] hover:text-white transition mb-6 font-mono"
      >
        <ArrowLeft size={14} /> Back to Newsroom Home
      </Link>

      {/* Header Banner */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3] text-xs font-mono mb-4">
            <Scale size={13} /> Young Gazette Editorial Charter
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Editorial Standards &amp; Code of Ethics
          </h1>
          <p className="text-[#CBD0DC] text-sm sm:text-base leading-relaxed max-w-2xl">
            The reporting principles, verification protocols, AI transparency standards, and correction policies upheld across the Junior Journalist newsroom.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#7B829A] mt-6 pt-4 border-t border-white/10">
            <span>Charter Version: 2026.2</span>
            <span>•</span>
            <span>Managing Editor: Rushal Sharma</span>
          </div>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="space-y-8 text-sm text-[#CBD0DC] leading-relaxed">
        {/* Section 1: Verification */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#00FFA3]" /> 1. Accuracy &amp; The 3-Source Verification Standard
          </h2>
          <p className="mb-3">
            Student journalists are held to professional standards of factual verification. Before any investigative dispatch, campus accountability report, or statistical claim is published:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li><strong>Multiple Sourcing:</strong> Any controversial factual allegation must be verified by at least two independent human witnesses or official public records.</li>
            <li><strong>Right of Reply:</strong> When an article reports on allegations against an individual, student council, or school administration, the subject must be contacted and granted a fair window to respond prior to publication.</li>
            <li><strong>Primary Documentation:</strong> Whenever reporting on budgets, municipal policies, or test data, reporters are encouraged to link directly to official documentation.</li>
          </ul>
        </section>

        {/* Section 2: AI Policy */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Cpu size={18} className="text-[#00f2fe]" /> 2. Artificial Intelligence Policy (Transparency &amp; Authenticity)
          </h2>
          <p className="mb-4">
            In an era where generative AI tools are pervasive in student education, Junior Journalist establishes a clear, progressive boundary between AI-assisted productivity and fraudulent journalism:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#00FFA3]/5 border border-[#00FFA3]/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={14} /> Permitted AI Assistance
              </h4>
              <ul className="text-xs space-y-1.5 text-[#CBD0DC] list-disc pl-4">
                <li>Grammar and syntax polishing.</li>
                <li>Brainstorming alternative angles or headline structures.</li>
                <li>Summarizing large public filings or datasets.</li>
                <li>Translation assistance with human review.</li>
              </ul>
            </div>
            <div className="bg-[#ff2d55]/5 border border-[#ff2d55]/20 rounded-xl p-4">
              <h4 className="text-xs font-bold text-[#ff758c] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} /> Strictly Prohibited
              </h4>
              <ul className="text-xs space-y-1.5 text-[#CBD0DC] list-disc pl-4">
                <li>Synthetic quote fabrication (inventing comments from real or fictional people).</li>
                <li>AI hallucination of sources, studies, or incidents.</li>
                <li>Submitting raw, unedited AI output under a human byline.</li>
                <li>AI-generated photorealistic images presented as documentary truth.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Corrections Policy */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
          <h2 className="font-heading text-xl font-bold text-white mb-3 flex items-center gap-2">
            <FileQuestion size={18} className="text-[#FFA028]" /> 3. Transparent Corrections &amp; Retractions
          </h2>
          <p className="mb-3">
            We acknowledge our mistakes promptly and openly. When an article contains a factual error:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>A prominent italicized correction note is appended at the top or bottom of the article detailing what was incorrect and when it was amended.</li>
            <li>We do not secretly "stealth-edit" substantive factual errors.</li>
            <li>If a story is found to be fatally flawed or based on fabricated evidence, it is formally retracted with an explanatory editorial statement.</li>
          </ul>
        </section>

        {/* Section 4: Report an Error CTA */}
        <section className="glass rounded-2xl p-6 sm:p-8 border border-white/10 bg-gradient-to-r from-white/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-base font-bold text-white mb-1">Spot an error in a dispatch?</h3>
            <p className="text-xs text-[#7B829A]">Our editorial desk reviews every correction lead and reader query within 24 hours.</p>
          </div>
          <Link to="/contact/" className="btn-primary text-xs py-2.5 px-5 whitespace-nowrap shrink-0">
            Submit Correction Tip &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
