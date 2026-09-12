import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { homepage as homepageApi, projects as projectApi } from '../lib/api';
import AuthModal from '../components/AuthModal';
import { PenTool, Calendar, Trophy, BookOpen, Users, ArrowRight, Flame, Heart, Eye, Clock, Target, Sparkles } from 'lucide-react';

function SkeletonCard() {
  return <div className="skeleton-pulse h-48 w-full rounded-2xl" />;
}

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
      return { days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000) };
    };
    setTimeLeft(calc());
    const i = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(i);
  }, [targetDate]);
  return (
    <div className="flex gap-2 font-mono text-sm" data-testid="countdown-timer">
      {Object.entries(timeLeft).map(([k, v]) => (
        <div key={k} className="glass rounded-lg px-2 py-1 text-center min-w-[48px]">
          <span className="text-[#00FFA3] font-bold text-lg block">{String(v).padStart(2, '0')}</span>
          <span className="text-[#52525B] text-[10px] uppercase">{k}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    homepageApi.get().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    projectApi.list().then(r => setProjectsList(r.data || [])).catch(() => {});
  }, []);

  const categories = [
    { label: 'Opinion', icon: '💬', color: '#FF6B6B' },
    { label: 'Campus Voices', icon: '🏫', color: '#4ECDC4' },
    { label: 'Reviews', icon: '📖', color: '#FFD93D' },
    { label: 'Creative Writing', icon: '✨', color: '#6C5CE7' },
    { label: 'Field Reports', icon: '📍', color: '#00B894' },
    { label: 'Photo Essays', icon: '📸', color: '#E17055' },
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00FFA3]/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#00FFA3]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2962FF]/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 relative">
          <div className="max-w-3xl">
            {user ? (
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4 animate-fade-in-up" data-testid="hero-greeting">
                Hey {user.name?.split(' ')[0]},<br /><span className="text-[#00FFA3] glow-text">ready to write?</span>
              </h1>
            ) : (
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-4 animate-fade-in-up" data-testid="hero-title">
                Your Voice.<br /><span className="text-[#00FFA3] glow-text">Your Story.</span>
              </h1>
            )}
            <p className="text-base sm:text-lg text-[#A0A0AB] mb-8 max-w-xl animate-fade-in-up delay-100" data-testid="hero-subtitle">
              The youth-led creative ecosystem where students write, lead, collaborate, and earn recognition.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-200">
              {user ? (
                <>
                  <Link to="/submit" className="btn-primary flex items-center gap-2" data-testid="hero-submit-btn">
                    <PenTool size={18} /> Start Writing
                  </Link>
                  <Link to="/events" className="btn-ghost flex items-center gap-2" data-testid="hero-events-btn">
                    <Calendar size={18} /> Browse Events
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthOpen(true)} className="btn-primary flex items-center gap-2" data-testid="hero-join-btn">
                    Join the Collective <ArrowRight size={18} />
                  </button>
                  <Link to="/explore" className="btn-ghost flex items-center gap-2" data-testid="hero-explore-btn">
                    Explore Stories
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {data?.stats && (
            <div className="grid grid-cols-3 gap-4 mt-16 max-w-lg animate-fade-in-up delay-300" data-testid="stats-bar">
              {[
                { label: 'Articles', value: data.stats.total_articles, icon: <PenTool size={16} /> },
                { label: 'Events', value: data.stats.total_events, icon: <Calendar size={16} /> },
                { label: 'Members', value: data.stats.total_members, icon: <Users size={16} /> },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 text-center card-interactive">
                  <div className="flex items-center justify-center gap-2 text-[#00FFA3] mb-1">{s.icon}</div>
                  <div className="font-heading text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-[#A0A0AB]">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="categories-section">
        <div className="overline mb-6">Explore by Topic</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <Link key={cat.label} to={`/explore?category=${cat.label.toLowerCase().replace(' ', '_')}`}
              className="glass rounded-2xl px-5 py-4 flex items-center gap-3 min-w-[180px] card-interactive whitespace-nowrap"
              data-testid={`category-${cat.label.toLowerCase().replace(' ', '-')}`}>
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="featured-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="overline mb-1">Editor's Pick</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Featured Stories</h2>
          </div>
          <Link to="/explore" className="text-[#00FFA3] text-sm font-semibold flex items-center gap-1 hover:underline" data-testid="see-all-stories">
            See All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data?.featured || []).slice(0, 3).map((s, i) => (
              <Link key={s.id} to={`/submissions/${s.id}`}
                className={`glass rounded-2xl overflow-hidden card-interactive animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
                data-testid={`featured-story-${i}`}>
                <div className="h-44 w-full bg-black/40 overflow-hidden relative">
                  {(s.thumbnail_url || s.cover_image) ? (
                    <img src={s.thumbnail_url || s.cover_image} alt={s.title} className="w-full h-full object-cover transition duration-300 hover:scale-105" />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-[#00FFA3]/10 to-[#2962FF]/10 flex items-center justify-center">
                      <PenTool size={32} className="text-[#00FFA3]/30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge-pill">{s.type}</span>
                    <span className="badge-pill" style={{ borderColor: 'rgba(41,98,255,0.3)', color: '#2962FF', background: 'rgba(41,98,255,0.1)' }}>{s.category}</span>
                  </div>
                  <h3 className="font-heading text-base font-semibold mb-2 line-clamp-2">{s.title}</h3>
                  <div className="flex items-center justify-between text-xs text-[#A0A0AB]">
                    <span>by {s.author_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye size={12} />{s.views}</span>
                      <span className="flex items-center gap-1"><Heart size={12} />{(s.reactions?.heart || 0) + (s.reactions?.fire || 0)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Active Campaigns & Collaborative Projects */}
      {projectsList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="campaigns-section">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="overline mb-1 flex items-center gap-1.5 text-[#00FFA3]">
                <Sparkles size={14} /> Collaborative Journalism
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">Active Campaigns & Reporting Drives</h2>
            </div>
            <Link to="/projects" className="text-[#00FFA3] text-sm font-semibold flex items-center gap-1 hover:underline" data-testid="see-all-campaigns">
              View All Drives <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsList.slice(0, 3).map((proj, i) => (
              <Link
                key={proj.id}
                to="/projects"
                className="glass rounded-2xl overflow-hidden card-interactive flex flex-col justify-between border border-white/10 hover:border-[#00FFA3]/30"
              >
                <div className="h-40 relative bg-black/40 overflow-hidden">
                  {proj.cover_image ? (
                    <img src={proj.cover_image} alt={proj.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00FFA3]/10 to-[#2962FF]/15 flex items-center justify-center">
                      <Target size={32} className="text-[#00FFA3]/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="badge-pill bg-black/70 backdrop-blur-md text-[#00FFA3] text-[10px] uppercase">
                      {proj.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
                    {proj.progress || 0}%
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white mb-2 line-clamp-2">{proj.title}</h3>
                    <p className="text-xs text-[#A0A0AB] mb-4 line-clamp-2">{proj.description}</p>
                  </div>

                  <div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-3">
                      <div
                        className="bg-gradient-to-r from-[#00FFA3] to-[#2962FF] h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, proj.progress || 0))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#A0A0AB]">
                      <span>{proj.team?.length || 1} team members</span>
                      <span className="text-[#00FFA3] font-semibold flex items-center gap-0.5">
                        Join Team <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="events-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="overline mb-1">Don't Miss Out</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Upcoming Events</h2>
          </div>
          <Link to="/events" className="text-[#00FFA3] text-sm font-semibold flex items-center gap-1 hover:underline" data-testid="see-all-events">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data?.upcoming_events || []).map((ev, i) => (
              <Link key={ev.id} to={`/events/${ev.id}`}
                className="glass rounded-2xl p-6 card-interactive animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
                data-testid={`event-card-${i}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="badge-pill mb-2">{ev.type}</span>
                    <h3 className="font-heading text-lg font-semibold mt-2">{ev.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#A0A0AB]">
                    <Users size={14} /> {ev.team_members?.length || 0}/{ev.max_team}
                  </div>
                </div>
                <p className="text-sm text-[#A0A0AB] mb-4 line-clamp-2">{ev.description}</p>
                {ev.end_date && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#FFD600]" />
                    <span className="text-xs text-[#A0A0AB]">Deadline:</span>
                    <CountdownTimer targetDate={ev.end_date} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="opportunities-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="overline mb-1">Grow Your Career</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Opportunities</h2>
          </div>
          <Link to="/opportunities" className="text-[#00FFA3] text-sm font-semibold flex items-center gap-1 hover:underline" data-testid="see-all-opps">
            Browse All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data?.opportunities || []).map((opp, i) => (
              <div key={opp.id} className="glass rounded-2xl p-5 card-interactive animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }} data-testid={`opp-card-${i}`}>
                <div className="badge-pill mb-3" style={{
                  borderColor: opp.type === 'internship' ? 'rgba(41,98,255,0.3)' : opp.type === 'scholarship' ? 'rgba(255,214,0,0.3)' : 'rgba(0,255,163,0.3)',
                  color: opp.type === 'internship' ? '#2962FF' : opp.type === 'scholarship' ? '#FFD600' : '#00FFA3',
                  background: opp.type === 'internship' ? 'rgba(41,98,255,0.1)' : opp.type === 'scholarship' ? 'rgba(255,214,0,0.1)' : 'rgba(0,255,163,0.1)',
                }}>{opp.type}</div>
                <h4 className="font-heading text-sm font-semibold mb-1">{opp.title}</h4>
                <p className="text-xs text-[#A0A0AB] mb-3">{opp.organization}</p>
                {opp.deadline && <p className="text-[10px] text-[#FFD600] font-mono">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Writers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24" data-testid="writers-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="overline mb-1">Wall of Fame</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">Top Contributors</h2>
          </div>
          <Link to="/community" className="text-[#00FFA3] text-sm font-semibold flex items-center gap-1 hover:underline" data-testid="see-leaderboard">
            Full Leaderboard <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {(data?.top_writers || []).map((w, i) => (
            <Link key={w.id} to={`/profile/${w.id}`}
              className="glass rounded-2xl p-5 min-w-[200px] text-center card-interactive animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
              data-testid={`top-writer-${i}`}>
              <div className="w-16 h-16 rounded-full bg-[#00FFA3]/20 border-2 border-[#00FFA3]/30 flex items-center justify-center mx-auto mb-3">
                <span className="font-heading text-xl font-bold text-[#00FFA3]">{w.name?.[0]?.toUpperCase()}</span>
              </div>
              <h4 className="font-heading text-sm font-semibold mb-1">{w.name}</h4>
              <div className="flex items-center justify-center gap-1 text-[#00FFA3] font-mono text-sm">
                <Trophy size={14} /> {w.lifetime_xp} XP
              </div>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {(w.role_tags || []).slice(0, 2).map(t => (
                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#A0A0AB]">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 pb-32" data-testid="cta-section">
          <div className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/5 to-[#2962FF]/5" />
            <div className="relative">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to Join the Movement?</h2>
              <p className="text-[#A0A0AB] mb-8 max-w-lg mx-auto">Write, lead, earn badges, and build your portfolio. Your journalism journey starts here.</p>
              <button onClick={() => setAuthOpen(true)} className="btn-primary text-lg px-8 py-4" data-testid="cta-join-btn">
                Get Started Free <ArrowRight size={20} className="inline ml-2" />
              </button>
            </div>
          </div>
        </section>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="register" />
    </div>
  );
}
