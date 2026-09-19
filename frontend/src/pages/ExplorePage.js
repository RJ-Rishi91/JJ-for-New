import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { submissions as subApi, archives as archiveApi } from '../lib/api';
import { Eye, Heart, Flame, Search, Filter, BookOpen, Download, FileText } from 'lucide-react';

const types = ['all', 'article', 'photo_essay', 'field_report', 'video'];
const categories = ['all', 'opinion', 'campus_voices', 'reviews', 'creative_writing', 'field_reports'];

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [subs, setSubs] = useState([]);
  const [magazineIssues, setMagazineIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('stories'); // 'stories' | 'magazine'
  const [activeType, setActiveType] = useState('all');
  const [activeCat, setActiveCat] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    params.status = 'published';
    if (activeType !== 'all') params.type = activeType;
    if (activeCat !== 'all') params.category = activeCat;
    
    setLoading(true);
    Promise.all([
      subApi.list(params).then(r => setSubs(r.data || [])).catch(() => {}),
      archiveApi.list().then(r => setMagazineIssues(r.data || [])).catch(() => {})
    ]).finally(() => setLoading(false));
  }, [activeType, activeCat]);

  const filtered = subs.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.author_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="explore-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="explore-title">Explore</h1>
          <p className="text-[#A0A0AB]">Discover stories, photo essays, field reports, and seasonal digital magazines</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 glass p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('stories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              viewMode === 'stories' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-sm' : 'text-[#A0A0AB] hover:text-white'
            }`}
          >
            Articles & Stories ({subs.length})
          </button>
          <button
            onClick={() => setViewMode('magazine')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'magazine' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-sm' : 'text-[#A0A0AB] hover:text-white'
            }`}
          >
            <BookOpen size={14} /> Young Gazette Issues ({magazineIssues.length})
          </button>
        </div>
      </div>

      {viewMode === 'stories' ? (
        <>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
            <input className="input-dark pl-11 w-full" placeholder="Search stories, authors..." value={search} onChange={(e) => setSearch(e.target.value)} data-testid="explore-search" />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2" data-testid="type-filters">
            {types.map(t => (
              <button key={t} onClick={() => setActiveType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeType === t ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'glass text-[#A0A0AB] hover:text-white'}`}
                data-testid={`filter-type-${t}`}>
                {t === 'all' ? 'All' : t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2" data-testid="category-filters">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCat === c ? 'bg-[#2962FF]/10 text-[#2962FF] border border-[#2962FF]/30' : 'text-[#52525B] hover:text-[#A0A0AB]'}`}
                data-testid={`filter-cat-${c}`}>
                {c === 'all' ? 'All Topics' : c.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-pulse h-56 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[#A0A0AB]" data-testid="explore-empty">
              <p className="font-heading text-lg mb-2">No stories yet</p>
              <p className="text-sm">Be the first to submit!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="stories-grid">
              {filtered.map((s, i) => (
                <Link key={s.id} to={`/submissions/${s.id}/`}
                  className="glass rounded-2xl overflow-hidden card-interactive animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                  data-testid={`story-card-${i}`}>
                  <div className="h-44 w-full bg-black/40 overflow-hidden relative">
                    {(s.thumbnail_url || s.cover_image) ? (
                      <img src={s.thumbnail_url || s.cover_image} alt={s.title} className="w-full h-full object-cover transition duration-300 hover:scale-105" />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                        <span className="text-4xl opacity-30">{s.type === 'photo_essay' ? '📸' : s.type === 'video' ? '🎬' : s.type === 'field_report' ? '📍' : '✍️'}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex gap-2 mb-2">
                      <span className="badge-pill">{s.type?.replace('_', ' ')}</span>
                    </div>
                    <h3 className="font-heading text-sm font-semibold mb-2 line-clamp-2 text-white">{s.title}</h3>
                    <div className="flex items-center justify-between text-xs text-[#A0A0AB]">
                      <span>by {s.author_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye size={12} />{s.views}</span>
                        <span className="flex items-center gap-1"><Flame size={12} />{s.reactions?.fire || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        /* DIGITAL MAGAZINE ISSUES */
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 mb-8">
            <div className="max-w-2xl">
              <span className="badge-pill uppercase text-[10px] text-[#00FFA3] font-bold mb-2">
                Official Anthologies
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                Young Gazette Digital Magazine
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A0AB] leading-relaxed">
                Curated quarterly editions featuring top-rated student journalism, campus investigations, creative writing showcases, and photo essays.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {magazineIssues.map(issue => (
              <div key={issue.id} className="glass rounded-2xl overflow-hidden border border-white/10 card-interactive flex flex-col justify-between">
                <div>
                  <div className="h-52 w-full bg-black/40 overflow-hidden relative">
                    {issue.cover_image ? (
                      <img src={issue.cover_image} alt={issue.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-5xl">📰</div>
                    )}
                    <span className="absolute top-3 right-3 badge-pill bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#00FFA3]">
                      Issue #{issue.issue_number}
                    </span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-[#FFD600] font-mono font-bold block mb-1">{issue.season}</span>
                    <h3 className="font-heading text-base font-bold text-white mb-2">{issue.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#71717A] mb-4">
                      <span>{issue.pages || 28} Pages</span>
                      <span>•</span>
                      <span>{issue.articles_count || 10} Curated Works</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <a
                    href={issue.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Read & Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
