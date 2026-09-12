import React, { useState, useEffect } from 'react';
import { resources as resApi } from '../lib/api';
import { BookOpen, Video, FileText, Lightbulb, Search } from 'lucide-react';

const typeIcons = { guide: <BookOpen size={20} />, webinar: <Video size={20} />, template: <FileText size={20} />, prompt: <Lightbulb size={20} /> };
const types = ['all', 'guide', 'webinar', 'template', 'prompt'];
const cats = ['all', 'writing', 'photography', 'tools', 'journalism'];

export default function LearnPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    const params = {};
    if (activeType !== 'all') params.type = activeType;
    if (activeCat !== 'all') params.category = activeCat;
    resApi.list(params).then(r => { setResources(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [activeType, activeCat]);

  const writingPrompts = [
    "Write about a local hero in your community who deserves recognition.",
    "Describe a day in the life of a student journalist in 2026.",
    "What would you change about your school if you were principal for a day?",
    "Interview an elder in your family about how technology has changed their life.",
    "Cover an imaginary event: 'The Great Campus Book Fair'.",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="learn-page">
      <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="learn-title">Learn Hub</h1>
      <p className="text-[#A0A0AB] mb-8">Resources, guides, and prompts to sharpen your journalism skills</p>

      {/* Writing Prompts */}
      <section className="mb-12" data-testid="prompts-section">
        <div className="overline mb-4">Daily Writing Prompts</div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {writingPrompts.map((p, i) => (
            <div key={i} className="glass rounded-2xl p-5 min-w-[280px] max-w-[320px] card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }} data-testid={`prompt-${i}`}>
              <Lightbulb size={18} className="text-[#FFD600] mb-3" />
              <p className="text-sm">{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2" data-testid="learn-type-filters">
        {types.map(t => (
          <button key={t} onClick={() => { setActiveType(t); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeType === t ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'glass text-[#A0A0AB] hover:text-white'}`}
            data-testid={`learn-filter-${t}`}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2" data-testid="learn-cat-filters">
        {cats.map(c => (
          <button key={c} onClick={() => { setActiveCat(c); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCat === c ? 'bg-[#2962FF]/10 text-[#2962FF] border border-[#2962FF]/30' : 'text-[#52525B] hover:text-[#A0A0AB]'}`}
            data-testid={`learn-cat-${c}`}>
            {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="skeleton-pulse h-40 rounded-2xl" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-20 text-[#A0A0AB]" data-testid="learn-empty">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-heading text-lg mb-2">No resources yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="resources-grid">
          {resources.map((r, i) => (
            <div key={r.id} className="glass rounded-2xl p-6 card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }} data-testid={`resource-${i}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2962FF]/10 flex items-center justify-center text-[#2962FF]">
                  {typeIcons[r.type] || <BookOpen size={20} />}
                </div>
                <div>
                  <span className="badge-pill">{r.type}</span>
                </div>
              </div>
              <h3 className="font-heading text-sm font-semibold mb-2">{r.title}</h3>
              <p className="text-xs text-[#A0A0AB]">{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
