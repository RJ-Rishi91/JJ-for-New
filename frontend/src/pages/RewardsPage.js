import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rewards as rewardsApi, badges as badgesApi } from '../lib/api';
import { Trophy, Award, Star, Shield, Crown, Zap, BookOpen, Feather, PenTool, Calendar, Gift, ShoppingBag } from 'lucide-react';

const badgeIcons = {
  'pen-tool': <PenTool size={24} />, 'book-open': <BookOpen size={24} />, 'feather': <Feather size={24} />,
  'calendar': <Calendar size={24} />, 'award': <Award size={24} />, 'star': <Star size={24} />,
  'zap': <Zap size={24} />, 'crown': <Crown size={24} />, 'shield': <Shield size={24} />,
};

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState('');

  useEffect(() => {
    Promise.all([badgesApi.list(), rewardsApi.list()])
      .then(([b, r]) => { setBadges(b.data); setRewards(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    try {
      await rewardsApi.redeem(rewardId);
      await refreshUser();
    } catch {}
    setRedeeming('');
  };

  const userBadges = user?.badges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="rewards-page">
      <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="rewards-title">Rewards & Recognition</h1>
      <p className="text-[#A0A0AB] mb-8">Earn points, unlock badges, and redeem rewards for your contributions</p>

      {/* Points Overview */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12" data-testid="points-overview">
          <div className="glass rounded-2xl p-5 text-center card-interactive">
            <Trophy size={24} className="text-[#00FFA3] mx-auto mb-2" />
            <div className="font-heading text-2xl font-bold font-mono">{user.lifetime_xp || 0}</div>
            <div className="text-xs text-[#A0A0AB]">Lifetime XP</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center card-interactive">
            <Star size={24} className="text-[#FFD600] mx-auto mb-2" />
            <div className="font-heading text-2xl font-bold font-mono">{user.redeemable_points || 0}</div>
            <div className="text-xs text-[#A0A0AB]">Redeemable Points</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center card-interactive">
            <Award size={24} className="text-[#2962FF] mx-auto mb-2" />
            <div className="font-heading text-2xl font-bold font-mono">{userBadges.length}</div>
            <div className="text-xs text-[#A0A0AB]">Badges Earned</div>
          </div>
          <div className="glass rounded-2xl p-5 text-center card-interactive">
            <Shield size={24} className="text-[#E17055] mx-auto mb-2" />
            <div className="font-heading text-2xl font-bold font-mono">{user.role_tags?.length || 0}</div>
            <div className="text-xs text-[#A0A0AB]">Active Roles</div>
          </div>
        </div>
      )}

      {/* Badges */}
      <section className="mb-12" data-testid="badges-section">
        <h2 className="font-heading text-2xl font-bold mb-6">Badges</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-pulse h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((b, i) => {
              const earned = userBadges.includes(b.id);
              return (
                <div key={b.id}
                  className={`glass rounded-2xl p-5 text-center transition-all animate-fade-in-up ${earned ? 'border-[#00FFA3]/30 bg-[#00FFA3]/5' : 'opacity-50'}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  data-testid={`badge-${b.id}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${earned ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'bg-white/5 text-[#52525B]'}`}>
                    {badgeIcons[b.icon] || <Award size={24} />}
                  </div>
                  <h4 className="font-heading text-xs font-semibold mb-1">{b.name}</h4>
                  <p className="text-[10px] text-[#A0A0AB]">{b.description}</p>
                  {earned && <span className="inline-block mt-2 text-[9px] px-2 py-0.5 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] font-bold">EARNED</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Redeem Store */}
      <section data-testid="redeem-section">
        <h2 className="font-heading text-2xl font-bold mb-6">Redeem Center</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-pulse h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((r, i) => (
              <div key={r.id} className="glass rounded-2xl p-6 card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }} data-testid={`reward-${r.id}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center">
                    {r.type === 'trophy' ? <Trophy size={20} className="text-[#FFD600]" /> :
                     r.type === 'merch' ? <ShoppingBag size={20} className="text-[#00FFA3]" /> :
                     r.type === 'scholarship' ? <Crown size={20} className="text-[#2962FF]" /> :
                     <Gift size={20} className="text-[#E17055]" />}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-semibold">{r.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.type === 'trophy' ? 'bg-[#FFD600]/10 text-[#FFD600]' : r.type === 'scholarship' ? 'bg-[#2962FF]/10 text-[#2962FF]' : 'bg-white/5 text-[#A0A0AB]'}`}>{r.type}</span>
                  </div>
                </div>
                <p className="text-xs text-[#A0A0AB] mb-4">{r.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#00FFA3]">{r.points_cost} pts</span>
                  {user ? (
                    <button onClick={() => handleRedeem(r.id)} disabled={redeeming === r.id || (user.redeemable_points || 0) < r.points_cost}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${(user.redeemable_points || 0) >= r.points_cost ? 'btn-primary' : 'bg-white/5 text-[#52525B] cursor-not-allowed'}`}
                      data-testid={`redeem-btn-${r.id}`}>
                      {redeeming === r.id ? 'Redeeming...' : 'Redeem'}
                    </button>
                  ) : (
                    <span className="text-xs text-[#52525B]">Sign in to redeem</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
