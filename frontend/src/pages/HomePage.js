import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { homepage as homepageApi, projects as projectApi } from '../lib/api';
import AuthModal from '../components/AuthModal';
import { PenTool, Calendar, Trophy, Users, ArrowRight, Heart, Eye, Clock, Target, Sparkles, Compass, Zap } from 'lucide-react';

function SkeletonCard() {
  return <div className="skeleton-pulse h-52 w-full rounded-3xl border border-white/10" />;
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
        <div key={k} className="glass rounded-xl px-2.5 py-1 text-center min-w-[50px] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <span className="text-[#ff758c] font-bold text-base block font-mono">{String(v).padStart(2, '0')}</span>
          <span className="text-[#7B829A] text-[9px] uppercase tracking-wider">{k}</span>
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
    { label: 'Creative Writing', icon: '✨', color: '#A55EEA' },
    { label: 'Field Reports', icon: '📍', color: '#00D2D3' },
    { label: 'Photo Essays', icon: '📸', color: '#FA8231' },
  ];

  return (
    <div className="min-h-screen text-white relative z-10" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            {/* Ambient Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/15 mb-6 animate-fade-in shadow-[0_0_20px_rgba(255,45,85,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse shadow-[0_0_8px_#ff2d55]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#CBD0DC] flex items-center gap-1.5 font-heading">
                Next-Gen Youth Media & Newsroom <Zap size={12} className="text-[#ff758c]" />
              </span>
            </div>

            {user ? (
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in-up" data-testid="hero-greeting">
                Hey {user.name?.split(' ')[0]},<br />
                <span className="text-gradient-neon glow-text">ready to broadcast?</span>
              </h1>
            ) : (
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in-up" data-testid="hero-title">
                Your Voice.<br />
                <span className="text-gradient-neon glow-text">Your Story.</span>
              </h1>
            )}

            <p className="text-lg sm:text-xl text-[#CBD0DC] mb-10 max-w-xl font-normal leading-relaxed animate-fade-in-up delay-100" data-testid="hero-subtitle">
              The youth-led creative ecosystem where student reporters write, investigate, collaborate, and build verified media authority.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-200">
              {user ? (
                <>
                  <Link to="/submit/" className="btn-primary flex items-center gap-2.5 text-base px-7 py-3.5" data-testid="hero-submit-btn">
                    <PenTool size={18} /> Start Writing
                  </Link>
                  <Link to="/events/" className="btn-ghost flex items-center gap-2.5 text-base px-7 py-3.5" data-testid="hero-events-btn">
                    <Calendar size={18} /> Browse Events
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthOpen(true)} className="btn-primary flex items-center gap-2.5 text-base px-7 py-3.5" data-testid="hero-join-btn">
                    Join the Collective <ArrowRight size={18} />
                  </button>
                  <Link to="/explore/" className="btn-ghost flex items-center gap-2.5 text-base px-7 py-3.5" data-testid="hero-explore-btn">
                    <Compass size={18} /> Explore Stories
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar in Frosted Glass */}
          {data?.stats && (
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-16 max-w-xl animate-fade-in-up delay-300" data-testid="stats-bar">
              {[
                { label: 'Articles Published', value: data.stats.total_articles, icon: <PenTool size={18} className="text-[#ff758c]" /> },
                { label: 'Active Events', value: data.stats.total_events, icon: <Calendar size={18} className="text-[#00f2fe]" /> },
                { label: 'Global Members', value: data.stats.total_members, icon: <Users size={18} className="text-[#ff8a00]" /> },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-2xl p-5 text-center card-interactive border border-white/12">
                  <div className="flex items-center justify-center mb-2">{s.icon}</div>
                  <div className="font-heading text-2xl sm:text-3xl font-black text-white">{s.value}</div>
                  <div className="text-[11px] text-[#7B829A] uppercase tracking-wider font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10" data-testid="categories-section">
        <div className="overline mb-4 flex items-center gap-2">
          <Sparkles size={13} /> Explore by Topic
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3">
          {categories.map((cat) => (
            <Link key={cat.label} to={`/explore/?category=${cat.label.toLowerCase().replace(' ', '_')}`}
              className="glass-card rounded-2xl px-6 py-4 flex items-center gap-3.5 min-w-[200px] card-interactive whitespace-nowrap border border-white/10"
              data-testid={`category-${cat.label.toLowerCase().replace(' ', '-')}`}>
              <span className="text-2xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">{cat.icon}</span>
              <span className="text-sm font-bold font-heading text-white">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" data-testid="featured-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="overline mb-1.5">Curated Highlights</div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">Featured Stories</h2>
          </div>
          <Link to="/explore/" className="text-[#ff758c] hover:text-white text-sm font-semibold flex items-center gap-1.5 transition" data-testid="see-all-stories">
            See All Stories <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data?.featured || []).slice(0, 3).map((s, i) => (
              <Link key={s.id} to={`/submissions/${s.id}/`}
                className="glass-card rounded-3xl overflow-hidden card-interactive animate-fade-in-up border border-white/12 flex flex-col justify-between"
                style={{ animationDelay: `${i * 120}ms` }}
                data-testid={`featured-story-${i}`}>
                <div className="h-48 w-full bg-black/40 overflow-hidden relative">
                  {(s.thumbnail_url || s.cover_image) ? (
                    <img src={s.thumbnail_url || s.cover_image} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-[#ff2d55]/20 to-[#7000ff]/20 flex items-center justify-center">
                      <PenTool size={36} className="text-[#ff758c]/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0618] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge-pill">{s.type}</span>
                      <span className="badge-pill" style={{ borderColor: 'rgba(0,242,254,0.3)', color: '#00f2fe', background: 'rgba(0,242,254,0.1)' }}>
                        {s.category}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-3 line-clamp-2 text-white group-hover:text-[#ff758c] transition">
                      {s.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#7B829A] pt-4 border-t border-white/10">
                    <span className="font-medium text-[#CBD0DC]">by {s.author_name}</span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="flex items-center gap-1"><Eye size={13} className="text-[#CBD0DC]" />{s.views}</span>
                      <span className="flex items-center gap-1"><Heart size={13} className="text-[#ff2d55]" />{(s.reactions?.heart || 0) + (s.reactions?.fire || 0)}</span>
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" data-testid="campaigns-section">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="overline mb-1.5 flex items-center gap-1.5">
                <Sparkles size={13} /> Investigative Drives
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">Active Campaigns &amp; Reporting Drives</h2>
            </div>
            <Link to="/projects/" className="text-[#ff758c] hover:text-white text-sm font-semibold flex items-center gap-1.5 transition" data-testid="see-all-campaigns">
              View All Drives <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsList.slice(0, 3).map((proj, i) => (
              <Link
                key={proj.id}
                to="/projects/"
                className="glass-card rounded-3xl overflow-hidden card-interactive flex flex-col justify-between border border-white/12 hover:border-[#ff2d55]/40"
              >
                <div className="h-44 relative bg-black/40 overflow-hidden">
                  {proj.cover_image ? (
                    <img src={proj.cover_image} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ff2d55]/20 to-[#00f2fe]/20 flex items-center justify-center">
                      <Target size={36} className="text-[#ff758c]/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0618] via-transparent to-transparent opacity-75" />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="badge-pill bg-black/60 backdrop-blur-md text-[#ff758c] text-[10px] uppercase">
                      {proj.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d55] animate-pulse" />
                    {proj.progress || 0}%
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white mb-2 line-clamp-2">{proj.title}</h3>
                    <p className="text-xs text-[#CBD0DC] mb-5 line-clamp-2 leading-relaxed">{proj.description}</p>
                  </div>

                  <div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3.5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#ff2d55] via-[#ff0844] to-[#ff8a00] h-2 rounded-full shadow-[0_0_10px_rgba(255,45,85,0.5)]"
                        style={{ width: `${Math.min(100, Math.max(5, proj.progress || 0))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#7B829A]">
                      <span>{proj.team?.length || 1} team contributors</span>
                      <span className="text-[#ff758c] font-bold flex items-center gap-1">
                        Join Drive <ArrowRight size={12} />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" data-testid="events-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="overline mb-1.5">Workshops & Sprints</div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">Upcoming Events</h2>
          </div>
          <Link to="/events/" className="text-[#ff758c] hover:text-white text-sm font-semibold flex items-center gap-1.5 transition" data-testid="see-all-events">
            View All Events <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data?.upcoming_events || []).map((ev, i) => (
              <Link key={ev.id} to={`/events/${ev.id}/`}
                className="glass-card rounded-3xl p-7 card-interactive animate-fade-in-up border border-white/12"
                style={{ animationDelay: `${i * 120}ms` }}
                data-testid={`event-card-${i}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="badge-pill mb-2.5">{ev.type}</span>
                    <h3 className="font-heading text-xl font-bold text-white mt-1">{ev.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#CBD0DC] glass px-3 py-1.5 rounded-full border border-white/10">
                    <Users size={14} className="text-[#00f2fe]" /> {ev.team_members?.length || 0}/{ev.max_team}
                  </div>
                </div>
                <p className="text-sm text-[#CBD0DC] mb-6 line-clamp-2 leading-relaxed">{ev.description}</p>
                {ev.end_date && (
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-[#7B829A]">
                      <Clock size={14} className="text-[#ff8a00]" />
                      <span>Registration Deadline:</span>
                    </div>
                    <CountdownTimer targetDate={ev.end_date} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14" data-testid="opportunities-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="overline mb-1.5">Career &amp; Fellowships</div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">Opportunities</h2>
          </div>
          <Link to="/opportunities/" className="text-[#ff758c] hover:text-white text-sm font-semibold flex items-center gap-1.5 transition" data-testid="see-all-opps">
            Browse All <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(data?.opportunities || []).map((opp, i) => (
              <div key={opp.id} className="glass-card rounded-2xl p-6 card-interactive animate-fade-in-up border border-white/10 flex flex-col justify-between" style={{ animationDelay: `${i * 100}ms` }} data-testid={`opp-card-${i}`}>
                <div>
                  <div className="badge-pill mb-3" style={{
                    borderColor: opp.type === 'internship' ? 'rgba(0,242,254,0.3)' : opp.type === 'scholarship' ? 'rgba(255,138,0,0.3)' : 'rgba(255,45,85,0.3)',
                    color: opp.type === 'internship' ? '#00f2fe' : opp.type === 'scholarship' ? '#ff8a00' : '#ff758c',
                    background: opp.type === 'internship' ? 'rgba(0,242,254,0.1)' : opp.type === 'scholarship' ? 'rgba(255,138,0,0.1)' : 'rgba(255,45,85,0.1)',
                  }}>{opp.type}</div>
                  <h4 className="font-heading text-base font-bold mb-1.5 text-white">{opp.title}</h4>
                  <p className="text-xs text-[#CBD0DC] mb-4">{opp.organization}</p>
                </div>
                {opp.deadline && (
                  <p className="text-[11px] text-[#ff8a00] font-mono pt-3 border-t border-white/10">
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Writers / Leaderboard Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 pb-24" data-testid="writers-section">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="overline mb-1.5">Hall of Fame</div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">Top Reporters</h2>
          </div>
          <Link to="/community/" className="text-[#ff758c] hover:text-white text-sm font-semibold flex items-center gap-1.5 transition" data-testid="see-leaderboard">
            Full Leaderboard <ArrowRight size={15} />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
          {(data?.top_writers || []).map((w, i) => (
            <Link key={w.id} to={`/profile/${w.id}/`}
              className="glass-card rounded-2xl p-6 min-w-[210px] text-center card-interactive animate-fade-in-up border border-white/12"
              style={{ animationDelay: `${i * 100}ms` }}
              data-testid={`top-writer-${i}`}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff2d55]/30 to-[#ff8a00]/30 border-2 border-[#ff2d55]/40 flex items-center justify-center mx-auto mb-3.5 shadow-[0_0_15px_rgba(255,45,85,0.3)]">
                <span className="font-heading text-xl font-black text-white">{w.name?.[0]?.toUpperCase()}</span>
              </div>
              <h4 className="font-heading text-sm font-bold mb-1 text-white truncate">{w.name}</h4>
              <div className="flex items-center justify-center gap-1 text-[#ff758c] font-mono text-xs font-bold mb-2">
                <Trophy size={13} /> {w.lifetime_xp} XP
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {(w.role_tags || []).slice(0, 2).map(t => (
                  <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-[#CBD0DC] font-medium">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating CTA Section */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 pb-32" data-testid="cta-section">
          <div className="glass-card rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.7)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff2d55]/15 via-transparent to-[#ff8a00]/15 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/20 mb-6">
                <Sparkles size={14} className="text-[#ff758c]" />
                <span className="text-xs font-bold tracking-wider uppercase text-white font-heading">
                  Join 1,000+ Student Journalists
                </span>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
                Ready to Join the Movement?
              </h2>
              <p className="text-[#CBD0DC] mb-8 text-base sm:text-lg leading-relaxed">
                Publish articles, lead investigative teams, unlock verified achievements, and showcase your digital portfolio to top colleges and media outlets.
              </p>
              <button onClick={() => setAuthOpen(true)} className="btn-primary text-base px-9 py-4 font-bold shadow-2xl" data-testid="cta-join-btn">
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
