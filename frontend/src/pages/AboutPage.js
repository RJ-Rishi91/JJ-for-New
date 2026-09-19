import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Users, Award, ExternalLink, Globe, Sparkles, ArrowRight, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28" data-testid="about-page">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff2d55]/15 border border-[#ff2d55]/30 text-[#ff758c] text-xs font-mono mb-6 uppercase tracking-wider shadow-[0_0_25px_rgba(255,45,85,0.25)]">
          <Sparkles size={13} /> The Youth-Led Media Movement
        </div>
        <h1 className="font-heading text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
          By Youth, For Truth.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d55] via-[#ff7a00] to-[#00f2fe]">
            The New Era of Student Media.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-[#CBD0DC] leading-relaxed max-w-2xl mx-auto">
          Junior Journalist is an independent, non-profit digital newsroom ecosystem empowering high-school and college reporters to investigate, collaborate, and publish verified stories with fearless editorial authority.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#ff2d55]/20 text-[#ff758c] flex items-center justify-center mb-6">
            <Shield size={24} />
          </div>
          <h3 className="font-heading text-xl font-bold text-white mb-3">100% Student-First</h3>
          <p className="text-xs sm:text-sm text-[#CBD0DC] leading-relaxed">
            Our newsroom is operated by students, peer-reviewed by youth editors, and free from administrative school censorship. Student reporters retain full ownership of their work.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#00FFA3]/20 text-[#00FFA3] flex items-center justify-center mb-6">
            <Newspaper size={24} />
          </div>
          <h3 className="font-heading text-xl font-bold text-white mb-3">Anthology Publishing</h3>
          <p className="text-xs sm:text-sm text-[#CBD0DC] leading-relaxed">
            Top-rated investigative reporting, photo essays, and creative writing are curated into the official quarterly <em>Young Gazette</em> digital magazines distributed globally.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-[#7000ff]/20 text-[#00f2fe] flex items-center justify-center mb-6">
            <Globe size={24} />
          </div>
          <h3 className="font-heading text-xl font-bold text-white mb-3">Campus Chapter Network</h3>
          <p className="text-xs sm:text-sm text-[#CBD0DC] leading-relaxed">
            From Delhi to Mumbai, Bengaluru to Rajasthan, our distributed chapters unite young writers, providing training bootcamps, press passes, and reporting micro-grants.
          </p>
        </div>
      </div>

      {/* Leadership & StudioRavya Partnership */}
      <div className="glass rounded-3xl p-8 sm:p-12 border border-white/10 mb-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ff7a00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#FFA028] font-bold block mb-2">
              Editorial Direction &amp; Technology
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-4">
              Cultivated Under Young Gazette &amp; Engineered by StudioRavya
            </h2>
            <p className="text-xs sm:text-sm text-[#CBD0DC] leading-relaxed mb-4">
              Junior Journalist was architected to bridge the gap between amateur classroom newsletters and professional multimedia journalism. Led by Managing Editor <strong>Rushal Sharma</strong> and student desk leaders, the collective maintains uncompromising editorial freedom.
            </p>
            <p className="text-xs sm:text-sm text-[#CBD0DC] leading-relaxed mb-6">
              The digital platform, real-time newsroom infrastructure, and design systems are built and stewarded by <strong>StudioRavya</strong>, establishing a secure, modern home for young voices.
            </p>

            <a
              href="https://studioravya.onerishi.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFA028]/15 border border-[#FFA028]/40 text-[#FFA028] hover:bg-[#FFA028]/25 transition font-semibold text-xs"
            >
              Learn more about StudioRavya <ExternalLink size={13} />
            </a>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Platform Metrics at a Glance</h4>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-3xl font-heading font-black text-white block">100%</span>
                <span className="text-[11px] text-[#7B829A]">Student-authored stories</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-3xl font-heading font-black text-[#00FFA3] block">9+</span>
                <span className="text-[11px] text-[#7B829A]">Active campus chapters</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-3xl font-heading font-black text-[#ff758c] block">3</span>
                <span className="text-[11px] text-[#7B829A]">Quarterly Anthologies published</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-3xl font-heading font-black text-[#00f2fe] block">24/7</span>
                <span className="text-[11px] text-[#7B829A]">Collaborative Newsroom Chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="text-center glass rounded-3xl p-10 border border-white/10 bg-gradient-to-r from-[#ff2d55]/10 via-[#7000ff]/10 to-transparent">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
          Ready to publish your first investigation?
        </h2>
        <p className="text-xs sm:text-sm text-[#CBD0DC] max-w-md mx-auto mb-6">
          Join our collective of student reporters, get assigned an editor mentor, and publish work that sparks real-world conversation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/explore/" className="btn-ghost text-xs py-3 px-6">
            Explore Published Stories
          </Link>
          <Link to="/contact/" className="btn-primary text-xs py-3 px-6 flex items-center gap-2">
            Get in Touch With Desk <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
