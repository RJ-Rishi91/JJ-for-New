import React, { useState, useEffect } from 'react';
import { opportunities as oppApi } from '../lib/api';
import { Briefcase, GraduationCap, Trophy, Users, Clock, ExternalLink } from 'lucide-react';

const types = ['all', 'internship', 'scholarship', 'contest', 'fellowship'];
const typeStyles = {
  internship: { icon: <Briefcase size={20} />, color: '#2962FF', bg: 'rgba(41,98,255,0.1)', border: 'rgba(41,98,255,0.3)' },
  scholarship: { icon: <GraduationCap size={20} />, color: '#FFD600', bg: 'rgba(255,214,0,0.1)', border: 'rgba(255,214,0,0.3)' },
  contest: { icon: <Trophy size={20} />, color: '#00FFA3', bg: 'rgba(0,255,163,0.1)', border: 'rgba(0,255,163,0.3)' },
  fellowship: { icon: <Users size={20} />, color: '#E17055', bg: 'rgba(225,112,85,0.1)', border: 'rgba(225,112,85,0.3)' },
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const params = {};
    if (activeType !== 'all') params.type = activeType;
    oppApi.list(params).then(r => { setOpps(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [activeType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="opportunities-page">
      <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="opportunities-title">Opportunities</h1>
      <p className="text-[#A0A0AB] mb-8">Internships, scholarships, contests, and fellowships for young journalists</p>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-2" data-testid="opp-filters">
        {types.map(t => (
          <button key={t} onClick={() => { setActiveType(t); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeType === t ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'glass text-[#A0A0AB] hover:text-white'}`}
            data-testid={`opp-filter-${t}`}>
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-pulse h-48 rounded-2xl" />)}
        </div>
      ) : opps.length === 0 ? (
        <div className="text-center py-20 text-[#A0A0AB]" data-testid="opp-empty">
          <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-heading text-lg mb-2">No opportunities yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="opp-grid">
          {opps.map((opp, i) => {
            const style = typeStyles[opp.type] || typeStyles.internship;
            return (
              <div key={opp.id} className="glass rounded-2xl p-6 card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }} data-testid={`opp-item-${i}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: style.bg, color: style.color }}>
                    {style.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>{opp.type}</span>
                    </div>
                    <h3 className="font-heading text-base font-semibold mb-1">{opp.title}</h3>
                    <p className="text-sm text-[#A0A0AB] mb-3">{opp.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#52525B]">
                        {opp.organization && <span>{opp.organization}</span>}
                        {opp.deadline && (
                          <span className="flex items-center gap-1 text-[#FFD600]">
                            <Clock size={12} /> {new Date(opp.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
