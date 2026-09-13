import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { homepage as homepageApi, projects as projectApi } from '../lib/api';
import AuthModal from '../components/AuthModal';
import {
  PenTool,
  Calendar,
  Trophy,
  Users,
  ArrowRight,
  Heart,
  Eye,
  Clock,
  Target,
  MessageSquareText,
  Mic,
  BookmarkCheck,
  Feather,
  Compass,
  Camera,
  Flame,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

function SkeletonCard() {
  return <div className="skeleton-pulse h-48 w-full rounded-xl border border-white/5" />;
}

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) return { days: 0, hours: 0, mins: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000)
      };
    };
    setTimeLeft(calc());
    const i = setInterval(() => setTimeLeft(calc()), 60000);
    return () => clearInterval(i);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs" data-testid="countdown-timer">
      {Object.entries(timeLeft).map(([k, v]) => (
        <div key={k} className="glass rounded-md px-2 py-0.5 text-center min-w-[36px] border border-white/10">
          <span className="text-rose-400 font-semibold text-xs block font-mono">{String(v).padStart(2, '0')}</span>
          <span className="text-slate-500 text-[8px] uppercase tracking-wider">{k}</span>
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

  // Human, editorial categories with bespoke Lucide icons instead of generic emojis
  const categories = [
    { label: 'Opinion', icon: <MessageSquareText size={17} strokeWidth={1.75} />, desc: 'Perspectives & commentary' },
    { label: 'Campus Voices', icon: <Mic size={17} strokeWidth={1.75} />, desc: 'Student issues & interviews' },
    { label: 'Reviews', icon: <BookmarkCheck size={17} strokeWidth={1.75} />, desc: 'Arts, literature & culture' },
    { label: 'Creative Writing', icon: <Feather size={17} strokeWidth={1.75} />, desc: 'Fiction, essays & poetry' },
    { label: 'Field Reports', icon: <Compass size={17} strokeWidth={1.75} />, desc: 'Local grassroots dispatches' },
    { label: 'Photo Essays', icon: <Camera size={17} strokeWidth={1.75} />, desc: 'Visual documentary stories' },
  ];

  return (
    <div className="min-h-screen text-slate-100 relative z-10" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-white/[0.06]" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Editorial Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md glass border border-white/10 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-medium">
                The Young Gazette Newsroom Collective
              </span>
            </div>

            {user ? (
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 animate-fade-in-up leading-[1.12]" data-testid="hero-greeting">
                Welcome back, {user.name?.split(' ')[0]}.<br />
                <span className="font-serif italic font-normal text-rose-300">Ready to break your next story?</span>
              </h1>
            ) : (
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 animate-fade-in-up leading-[1.12]" data-testid="hero-title">
                Your Voice.<br />
                <span className="font-serif italic font-normal text-rose-300">Your Story.</span>
              </h1>
            )}

            <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl font-normal leading-relaxed animate-fade-in-up delay-100" data-testid="hero-subtitle">
              An independent youth journalism collective where student reporters publish investigations, lead campus desks, and earn verified editorial credentials.
            </p>

            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up delay-200">
              {user ? (
                <>
                  <Link to="/submit" className="btn-primary" data-testid="hero-submit-btn">
                    <PenTool size={15} strokeWidth={2} /> Start Writing
                  </Link>
                  <Link to="/events" className="btn-ghost" data-testid="hero-events-btn">
                    <Calendar size={15} strokeWidth={1.75} /> Browse Newsroom Events
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthOpen(true)} className="btn-primary" data-testid="hero-join-btn">
                    Join the Collective <ArrowRight size={15} strokeWidth={2} />
                  </button>
                  <Link to="/explore" className="btn-ghost" data-testid="hero-explore-btn">
                    Explore Dispatches <ArrowUpRight size={15} strokeWidth={1.75} />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {data?.stats && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-14 max-w-lg animate-fade-in-up delay-300" data-testid="stats-bar">
              {[
                { label: 'Articles Published', value: data.stats.total_articles, icon: <PenTool size={15} strokeWidth={1.75} className="text-rose-400" /> },
                { label: 'Active Desks & Events', value: data.stats.total_events, icon: <Calendar size={15} strokeWidth={1.75} className="text-amber-400" /> },
                { label: 'Student Reporters', value: data.stats.total_members, icon: <Users size={15} strokeWidth={1.75} className="text-indigo-400" /> },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 card-interactive border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-1">
                    {s.icon}
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="font-heading text-2xl font-bold text-white">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore by Topic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12" data-testid="categories-section">
        <div className="flex items-center justify-between mb-5">
          <div className="overline">01 / Explore by Desk</div>
          <Link to="/explore" className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 font-medium">
            All Desks <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/explore?category=${cat.label.toLowerCase().replace(' ', '_')}`}
              className="glass-card p-3.5 card-interactive flex flex-col justify-between border border-white/[0.08] hover:border-rose-500/30"
              data-testid={`category-${cat.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="icon-box mb-3">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white font-heading mb-0.5">{cat.label}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/[0.06]" data-testid="featured-section">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="overline mb-1">02 / Editor's Selection</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Lead Dispatches</h2>
          </div>
          <Link to="/explore" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition" data-testid="see-all-stories">
            View All Dispatches <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(data?.featured || []).slice(0, 3).map((s, i) => (
              <Link
                key={s.id}
                to={`/submissions/${s.id}`}
                className="glass-card overflow-hidden card-interactive animate-fade-in-up flex flex-col justify-between border border-white/[0.08]"
                style={{ animationDelay: `${i * 100}ms` }}
                data-testid={`featured-story-${i}`}
              >
                <div className="h-44 w-full bg-slate-900 overflow-hidden relative">
                  {(s.thumbnail_url || s.cover_image) ? (
                    <img src={s.thumbnail_url || s.cover_image} alt={s.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <div className="h-full bg-slate-900 flex items-center justify-center">
                      <PenTool size={28} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="badge-pill bg-slate-950/80 backdrop-blur-md">{s.type}</span>
                    <span className="badge-pill bg-slate-950/80 backdrop-blur-md text-slate-300 border-white/10">{s.category}</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold mb-2 text-white line-clamp-2 leading-snug">
                      {s.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-white/[0.06]">
                    <span className="font-medium text-slate-300 text-[11px]">By {s.author_name}</span>
                    <div className="flex items-center gap-2.5 text-[11px] font-mono">
                      <span className="flex items-center gap-1"><Eye size={12} />{s.views}</span>
                      <span className="flex items-center gap-1 text-rose-400"><Heart size={12} />{(s.reactions?.heart || 0) + (s.reactions?.fire || 0)}</span>
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/[0.06]" data-testid="campaigns-section">
          <div className="flex items-end justify-between mb-7">
            <div>
              <div className="overline mb-1">03 / Collaborative Desks</div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Investigative Reporting Drives</h2>
            </div>
            <Link to="/projects" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition" data-testid="see-all-campaigns">
              All Active Drives <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projectsList.slice(0, 3).map((proj) => (
              <Link
                key={proj.id}
                to="/projects"
                className="glass-card overflow-hidden card-interactive flex flex-col justify-between border border-white/[0.08]"
              >
                <div className="h-40 relative bg-slate-900 overflow-hidden">
                  {proj.cover_image ? (
                    <img src={proj.cover_image} alt={proj.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Target size={28} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="badge-pill bg-slate-950/80 backdrop-blur-md text-[10px]">
                      {proj.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-3 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-white/10">
                    {proj.progress || 0}% Filed
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-white mb-1.5 line-clamp-2">{proj.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{proj.description}</p>
                  </div>

                  <div>
                    <div className="w-full bg-white/[0.08] rounded-full h-1.5 overflow-hidden mb-3">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, proj.progress || 0))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{proj.team?.length || 1} contributors</span>
                      <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                        Join Desk <ArrowRight size={11} />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/[0.06]" data-testid="events-section">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="overline mb-1">04 / Masterclasses & Deadlines</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Upcoming Newsroom Events</h2>
          </div>
          <Link to="/events" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition" data-testid="see-all-events">
            Full Calendar <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(data?.upcoming_events || []).map((ev, i) => (
              <Link
                key={ev.id}
                to={`/events/${ev.id}`}
                className="glass-card p-5 card-interactive animate-fade-in-up border border-white/[0.08]"
                style={{ animationDelay: `${i * 100}ms` }}
                data-testid={`event-card-${i}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="badge-pill mb-2">{ev.type}</span>
                    <h3 className="font-heading text-base font-bold text-white mt-1">{ev.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Users size={13} /> {ev.team_members?.length || 0}/{ev.max_team}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">{ev.description}</p>
                {ev.end_date && (
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={13} className="text-amber-400" />
                      <span>Closes in:</span>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-white/[0.06]" data-testid="opportunities-section">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="overline mb-1">05 / Growth Pathways</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Fellowships & Grants</h2>
          </div>
          <Link to="/opportunities" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition" data-testid="see-all-opps">
            Browse All <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(data?.opportunities || []).map((opp, i) => (
              <div
                key={opp.id}
                className="glass-card p-4 card-interactive animate-fade-in-up border border-white/[0.08] flex flex-col justify-between"
                style={{ animationDelay: `${i * 80}ms` }}
                data-testid={`opp-card-${i}`}
              >
                <div>
                  <div className="badge-pill mb-2.5 text-[10px]" style={{
                    borderColor: opp.type === 'internship' ? 'rgba(99,102,241,0.3)' : opp.type === 'scholarship' ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)',
                    color: opp.type === 'internship' ? '#818cf8' : opp.type === 'scholarship' ? '#fbbf24' : '#fda4af',
                    background: opp.type === 'internship' ? 'rgba(99,102,241,0.08)' : opp.type === 'scholarship' ? 'rgba(245,158,11,0.08)' : 'rgba(244,63,94,0.08)',
                  }}>{opp.type}</div>
                  <h4 className="font-heading text-xs font-bold mb-1 text-white line-clamp-2">{opp.title}</h4>
                  <p className="text-[11px] text-slate-400 mb-3">{opp.organization}</p>
                </div>
                {opp.deadline && (
                  <p className="text-[10px] text-amber-400 font-mono pt-2 border-t border-white/[0.06]">
                    Deadline: {new Date(opp.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Reporters / Community Leaderboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-20 border-t border-white/[0.06]" data-testid="writers-section">
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="overline mb-1">06 / Newsroom Ranks</div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">Top Reporters</h2>
          </div>
          <Link to="/community" className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition" data-testid="see-leaderboard">
            Full Leaderboard <ArrowRight size={13} />
          </Link>
        </div>

        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2">
          {(data?.top_writers || []).map((w, i) => (
            <Link
              key={w.id}
              to={`/profile/${w.id}`}
              className="glass-card p-4 min-w-[180px] text-center card-interactive animate-fade-in-up border border-white/[0.08]"
              style={{ animationDelay: `${i * 80}ms` }}
              data-testid={`top-writer-${i}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center mx-auto mb-2.5">
                <span className="font-heading text-base font-bold text-slate-200">{w.name?.[0]?.toUpperCase()}</span>
              </div>
              <h4 className="font-heading text-xs font-bold mb-1 text-white truncate">{w.name}</h4>
              <div className="flex items-center justify-center gap-1 text-rose-400 font-mono text-[11px] font-semibold mb-2">
                <Trophy size={11} /> {w.lifetime_xp} XP
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {(w.role_tags || []).slice(0, 2).map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 font-mono">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Mission Callout */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-24" data-testid="cta-section">
          <div className="glass-card p-8 sm:p-12 text-center border border-white/10 relative overflow-hidden">
            <div className="max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 mb-4">
                <ShieldCheck size={13} /> Young Gazette Publishing Ecosystem
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight mb-3 text-white">
                Built by Student Journalists.<br />
                <span className="font-serif italic font-normal text-rose-300">Read by Global Audiences.</span>
              </h2>
              <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                Publish investigative reports, collaborate across campus chapters, earn verified editorial credentials, and showcase your digital portfolio.
              </p>
              <button onClick={() => setAuthOpen(true)} className="btn-primary" data-testid="cta-join-btn">
                Apply for Reporter Access <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="register" />
    </div>
  );
}
