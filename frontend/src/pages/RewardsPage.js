import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rewards as rewardsApi, badges as badgesApi } from '../lib/api';
import { Trophy, Award, Star, Shield, Crown, Zap, BookOpen, Feather, PenTool, Calendar, Gift, ShoppingBag, CheckCircle, Package } from 'lucide-react';

const badgeIcons = {
  'pen-tool': <PenTool size={24} />, 'book-open': <BookOpen size={24} />, 'feather': <Feather size={24} />,
  'calendar': <Calendar size={24} />, 'award': <Award size={24} />, 'star': <Star size={24} />,
  'zap': <Zap size={24} />, 'crown': <Crown size={24} />, 'shield': <Shield size={24} />,
};

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState('');
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'badges', 'my_claims'
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    Promise.all([badgesApi.list(), rewardsApi.list()])
      .then(([b, r]) => {
        setBadges(b.data);
        setRewards(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (user) {
      rewardsApi.myRedemptions().then(r => setMyRedemptions(r.data)).catch(() => {});
    }
  }, [user]);

  const handleRedeem = async (rewardId) => {
    setRedeeming(rewardId);
    try {
      await rewardsApi.redeem(rewardId);
      await refreshUser();
      const updatedRedemptions = await rewardsApi.myRedemptions();
      setMyRedemptions(updatedRedemptions.data);
      alert('Congratulations! Reward redeemed successfully. Check "My Claims" tab for details.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Redemption failed. Check your point balance.');
    }
    setRedeeming('');
  };

  const userBadges = user?.badges || [];

  const filteredRewards = filterType === 'all'
    ? rewards
    : rewards.filter(r => r.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="rewards-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="rewards-title">
            Rewards & Recognition
          </h1>
          <p className="text-[#A0A0AB] text-sm">
            Earn points for contributing, lead events, collect YouTube-style trophies, and claim exclusive merch
          </p>
        </div>
      </div>

      {/* Points Overview */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="points-overview">
          <div className="glass rounded-3xl p-5 text-center card-interactive border border-white/10">
            <Trophy size={24} className="text-[#00FFA3] mx-auto mb-2" />
            <div className="font-heading text-3xl font-bold font-mono text-white">{user.lifetime_xp || 0}</div>
            <div className="text-xs text-[#A0A0AB] mt-1 uppercase tracking-wider font-semibold">Lifetime XP</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center card-interactive border border-white/10">
            <Star size={24} className="text-[#FFD600] mx-auto mb-2" />
            <div className="font-heading text-3xl font-bold font-mono text-[#FFD600]">{user.redeemable_points || 0}</div>
            <div className="text-xs text-[#A0A0AB] mt-1 uppercase tracking-wider font-semibold">Redeemable Points</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center card-interactive border border-white/10">
            <Award size={24} className="text-[#2962FF] mx-auto mb-2" />
            <div className="font-heading text-3xl font-bold font-mono text-white">{userBadges.length}</div>
            <div className="text-xs text-[#A0A0AB] mt-1 uppercase tracking-wider font-semibold">Badges Unlocked</div>
          </div>
          <div className="glass rounded-3xl p-5 text-center card-interactive border border-white/10">
            <Package size={24} className="text-[#E17055] mx-auto mb-2" />
            <div className="font-heading text-3xl font-bold font-mono text-white">{myRedemptions.length}</div>
            <div className="text-xs text-[#A0A0AB] mt-1 uppercase tracking-wider font-semibold">Claimed Rewards</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition shrink-0 ${activeTab === 'store' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
        >
          🎁 Rewards & Merch Store
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition shrink-0 ${activeTab === 'badges' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
        >
          🏆 Badges & Trophies Hall
        </button>
        {user && (
          <button
            onClick={() => setActiveTab('my_claims')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition shrink-0 ${activeTab === 'my_claims' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
          >
            📦 My Claims ({myRedemptions.length})
          </button>
        )}
      </div>

      {activeTab === 'store' && (
        <section data-testid="redeem-section">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'merch', 'trophy', 'scholarship', 'digital'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${filterType === type ? 'bg-white text-black font-bold' : 'glass text-[#A0A0AB] hover:text-white'}`}
              >
                {type === 'all' ? 'All Rewards' : type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-pulse h-52 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((r, i) => {
                const canAfford = (user?.redeemable_points || 0) >= r.points_cost;
                return (
                  <div key={r.id} className="glass rounded-3xl p-6 card-interactive flex flex-col justify-between border border-white/10 hover:border-[#00FFA3]/40 transition" data-testid={`reward-${r.id}`}>
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {r.type === 'trophy' ? <Trophy size={22} className="text-[#FFD600]" /> :
                           r.type === 'merch' ? <ShoppingBag size={22} className="text-[#00FFA3]" /> :
                           r.type === 'scholarship' ? <Crown size={22} className="text-[#2962FF]" /> :
                           <Gift size={22} className="text-[#E17055]" />}
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                          r.type === 'trophy' ? 'bg-[#FFD600]/10 text-[#FFD600]' :
                          r.type === 'scholarship' ? 'bg-[#2962FF]/10 text-[#2962FF]' :
                          'bg-white/5 text-[#A0A0AB]'
                        }`}>
                          {r.type}
                        </span>
                      </div>

                      <h4 className="font-heading text-base font-bold text-white mb-2">{r.name}</h4>
                      <p className="text-xs text-[#A0A0AB] leading-relaxed mb-4">{r.description}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#52525B] block uppercase tracking-wider font-semibold">Cost</span>
                        <span className="font-mono text-base font-bold text-[#00FFA3]">{r.points_cost} pts</span>
                      </div>
                      {user ? (
                        <button
                          onClick={() => handleRedeem(r.id)}
                          disabled={redeeming === r.id || !canAfford}
                          className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all ${
                            canAfford ? 'btn-primary' : 'bg-white/5 text-[#52525B] cursor-not-allowed'
                          }`}
                          data-testid={`redeem-btn-${r.id}`}
                        >
                          {redeeming === r.id ? 'Claiming...' : canAfford ? 'Claim Reward' : `Need ${r.points_cost - (user.redeemable_points || 0)} more`}
                        </button>
                      ) : (
                        <span className="text-xs text-[#52525B]">Sign in to claim</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'badges' && (
        <section data-testid="badges-section">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((b) => {
              const earned = userBadges.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`glass rounded-3xl p-5 text-center transition-all ${
                    earned ? 'border-[#00FFA3]/40 bg-[#00FFA3]/5 shadow-lg shadow-[#00FFA3]/5' : 'opacity-40 border-white/5'
                  }`}
                  data-testid={`badge-${b.id}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                    earned ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'bg-white/5 text-[#52525B]'
                  }`}>
                    {badgeIcons[b.icon] || <Award size={24} />}
                  </div>
                  <h4 className="font-heading text-xs font-bold text-white mb-1">{b.name}</h4>
                  <p className="text-[11px] text-[#A0A0AB] leading-tight mb-2">{b.description}</p>
                  {earned ? (
                    <span className="inline-block text-[9px] px-2.5 py-0.5 rounded-full bg-[#00FFA3]/20 text-[#00FFA3] font-mono font-bold">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#52525B] font-mono">
                      LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'my_claims' && user && (
        <section className="space-y-4">
          <h3 className="font-heading text-lg font-bold">My Claimed Rewards</h3>
          {myRedemptions.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center text-[#52525B] text-sm">
              You haven't claimed any rewards yet. Keep writing and earning points to unlock caps, t-shirts, and scholarships!
            </div>
          ) : (
            <div className="space-y-3">
              {myRedemptions.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-5 flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3]">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.reward_name}</h4>
                      <p className="text-xs text-[#A0A0AB]">Claimed on {new Date(item.created_at).toLocaleDateString()} • {item.points_spent} points</p>
                    </div>
                  </div>
                  <span className="badge-pill text-xs">Processed</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
