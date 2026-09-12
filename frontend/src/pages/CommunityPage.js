import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users as usersApi } from '../lib/api';
import { Trophy, Medal, Crown, Star, ArrowUp } from 'lucide-react';

export default function CommunityPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.leaderboard(30).then(r => { setLeaders(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const rankIcon = (i) => {
    if (i === 0) return <Crown size={20} className="text-[#FFD600]" />;
    if (i === 1) return <Medal size={20} className="text-[#C0C0C0]" />;
    if (i === 2) return <Medal size={20} className="text-[#CD7F32]" />;
    return <span className="text-sm font-mono text-[#52525B]">#{i + 1}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="community-page">
      <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="community-title">Community</h1>
      <p className="text-[#A0A0AB] mb-8">Leaderboard, top contributors, and the wall of fame</p>

      {/* Top 3 Podium */}
      {!loading && leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-12" data-testid="podium">
          {[1, 0, 2].map((idx) => {
            const u = leaders[idx];
            const height = idx === 0 ? 'h-40' : idx === 1 ? 'h-32' : 'h-24';
            const colors = idx === 0 ? 'from-[#FFD600]/20 to-[#FFD600]/5 border-[#FFD600]/30' : idx === 1 ? 'from-[#C0C0C0]/20 to-[#C0C0C0]/5 border-[#C0C0C0]/30' : 'from-[#CD7F32]/20 to-[#CD7F32]/5 border-[#CD7F32]/30';
            return (
              <Link key={u.id} to={`/profile/${u.id}`} className={`glass rounded-2xl p-5 text-center card-interactive w-40 ${height} bg-gradient-to-b ${colors}`} data-testid={`podium-${idx}`}>
                <div className="mb-2">{rankIcon(idx)}</div>
                <div className="w-12 h-12 rounded-full bg-[#00FFA3]/20 flex items-center justify-center mx-auto mb-2">
                  <span className="font-heading text-lg font-bold text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                </div>
                <h4 className="font-heading text-xs font-semibold truncate">{u.name}</h4>
                <div className="font-mono text-sm text-[#00FFA3] font-bold">{u.lifetime_xp} XP</div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="glass rounded-2xl overflow-hidden" data-testid="leaderboard">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
            <Trophy size={20} className="text-[#00FFA3]" /> Leaderboard
          </h3>
        </div>
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-pulse h-16 rounded-xl" />)}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaders.map((u, i) => (
              <Link key={u.id} to={`/profile/${u.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition"
                data-testid={`leaderboard-row-${i}`}>
                <div className="w-8 text-center">{rankIcon(i)}</div>
                <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{u.name}</h4>
                  <div className="flex items-center gap-2">
                    {(u.role_tags || []).slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#A0A0AB]">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-[#00FFA3]">{u.lifetime_xp} XP</div>
                  <div className="text-[10px] text-[#A0A0AB]">{u.badges?.length || 0} badges</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
