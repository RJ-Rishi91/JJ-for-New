import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { submissions as subApi } from '../lib/api';
import { Eye, Heart, Flame, Search, Filter } from 'lucide-react';

const types = ['all', 'article', 'photo_essay', 'field_report', 'video'];
const categories = ['all', 'opinion', 'campus_voices', 'reviews', 'creative_writing', 'field_reports'];

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeCat, setActiveCat] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    params.status = 'published';
    if (activeType !== 'all') params.type = activeType;
    if (activeCat !== 'all') params.category = activeCat;
    subApi.list(params).then(r => { setSubs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [activeType, activeCat]);

  const filtered = subs.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.author_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="explore-page">
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="explore-title">Explore</h1>
        <p className="text-[#A0A0AB]">Discover stories, photo essays, and field reports from young journalists</p>
      </div>

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
            <Link key={s.id} to={`/submissions/${s.id}`}
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
    </div>
  );
}
