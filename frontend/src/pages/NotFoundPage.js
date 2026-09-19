import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, Briefcase, Mail, Search, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center" data-testid="not-found-page">
      {/* Glow Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff2d55]/15 border border-[#ff2d55]/30 text-[#ff758c] text-xs font-mono mb-6 uppercase tracking-wider shadow-[0_0_20px_rgba(255,45,85,0.2)]">
        <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse" />
        Error 404 • Lost Transmission
      </div>

      {/* Massive Graphic Heading */}
      <h1 className="font-heading text-7xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d55] via-[#ff758c] to-[#00f2fe] mb-4">
        404
      </h1>

      <h2 className="font-heading text-2xl sm:text-4xl font-bold text-white mb-4">
        Dispatched Into The Void
      </h2>

      <p className="text-[#CBD0DC] text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
        The story, frequency, or newsroom desk you are seeking has either moved, was retracted, or never existed in the Young Gazette archives.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12 relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B829A]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stories, topics, or authors..."
          className="input-dark pl-11 pr-28 w-full text-xs sm:text-sm py-3 rounded-2xl"
          data-testid="not-found-search-input"
        />
        <button
          type="submit"
          className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 text-xs py-2 px-4 rounded-xl font-semibold"
        >
          Search
        </button>
      </form>

      {/* Quick Access Desk Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
        <Link
          to="/"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-[#ff2d55]/40 hover:bg-white/5 transition-all group card-interactive"
        >
          <div className="w-8 h-8 rounded-xl bg-[#ff2d55]/20 text-[#ff758c] flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Home size={16} />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
            Newsroom Home
            <ArrowRight size={13} className="text-[#7B829A] group-hover:text-white transition" />
          </h4>
          <p className="text-[11px] text-[#7B829A]">Front-page dispatches &amp; live metrics</p>
        </Link>

        <Link
          to="/explore/"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-[#00FFA3]/40 hover:bg-white/5 transition-all group card-interactive"
        >
          <div className="w-8 h-8 rounded-xl bg-[#00FFA3]/20 text-[#00FFA3] flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Compass size={16} />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
            Explore Stories
            <ArrowRight size={13} className="text-[#7B829A] group-hover:text-white transition" />
          </h4>
          <p className="text-[11px] text-[#7B829A]">Investigative reports &amp; magazines</p>
        </Link>

        <Link
          to="/opportunities/"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-[#7000ff]/40 hover:bg-white/5 transition-all group card-interactive"
        >
          <div className="w-8 h-8 rounded-xl bg-[#7000ff]/20 text-[#00f2fe] flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Briefcase size={16} />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
            Opportunities
            <ArrowRight size={13} className="text-[#7B829A] group-hover:text-white transition" />
          </h4>
          <p className="text-[11px] text-[#7B829A]">Fellowships, grants &amp; internships</p>
        </Link>

        <Link
          to="/contact/"
          className="glass rounded-2xl p-4 border border-white/10 hover:border-[#FFA028]/40 hover:bg-white/5 transition-all group card-interactive"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFA028]/20 text-[#FFA028] flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <Mail size={16} />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
            Contact Desk
            <ArrowRight size={13} className="text-[#7B829A] group-hover:text-white transition" />
          </h4>
          <p className="text-[11px] text-[#7B829A]">Pitch leads or report a broken link</p>
        </Link>
      </div>
    </div>
  );
}
