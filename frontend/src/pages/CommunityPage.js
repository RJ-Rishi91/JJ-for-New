import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { users as usersApi, chapters as chaptersApi } from '../lib/api';
import { Trophy, Medal, Crown, Star, School, Users, Sparkles, MapPin, Search, PlusCircle, CheckCircle, ExternalLink } from 'lucide-react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaders, setLeaders] = useState([]);
  const [chaptersList, setChaptersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ school: '', city: '', contact_email: '', student_lead: '' });
  const [chapterSubmitted, setChapterSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersApi.leaderboard(50).catch(() => ({ data: [] })),
      chaptersApi.list().catch(() => ({ data: [] }))
    ]).then(([leadersRes, chaptersRes]) => {
      setLeaders(leadersRes.data || []);
      setChaptersList(chaptersRes.data || []);
      setLoading(false);
    });
  }, []);

  const rankIcon = (i) => {
    if (i === 0) return <Crown size={22} className="text-[#FFD600]" />;
    if (i === 1) return <Medal size={20} className="text-[#C0C0C0]" />;
    if (i === 2) return <Medal size={20} className="text-[#CD7F32]" />;
    return <span className="text-sm font-mono text-[#71717A]">#{i + 1}</span>;
  };

  const filteredLeaders = leaders.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChapter = (e) => {
    e.preventDefault();
    setChapterSubmitted(true);
    setTimeout(() => {
      setShowChapterModal(false);
      setChapterSubmitted(false);
      setChapterForm({ school: '', city: '', contact_email: '', student_lead: '' });
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="community-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="community-title">
            Community & Chapters
          </h1>
          <p className="text-[#A0A0AB]">
            Discover top youth reporters, vibrant campus journalist chapters, and celebrated changemakers.
          </p>
        </div>
        <button
          onClick={() => setShowChapterModal(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto text-xs py-2.5 px-4 shrink-0"
        >
          <PlusCircle size={16} /> Start a Chapter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 mb-8">
        {[
          { id: 'leaderboard', label: 'Leaderboard & XP', icon: <Trophy size={16} /> },
          { id: 'chapters', label: 'Campus Chapters', icon: <School size={16} /> },
          { id: 'wall-of-fame', label: 'Wall of Fame', icon: <Sparkles size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 shadow-sm'
                : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div>
          {/* Top 3 Podium */}
          {!loading && leaders.length >= 3 && (
            <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12" data-testid="podium">
              {[1, 0, 2].map((idx) => {
                const u = leaders[idx];
                if (!u) return null;
                const height = idx === 0 ? 'h-48' : idx === 1 ? 'h-40' : 'h-36';
                const colors =
                  idx === 0
                    ? 'from-[#FFD600]/25 to-[#FFD600]/5 border-[#FFD600]/40 shadow-lg shadow-[#FFD600]/10'
                    : idx === 1
                    ? 'from-[#C0C0C0]/20 to-[#C0C0C0]/5 border-[#C0C0C0]/30'
                    : 'from-[#CD7F32]/20 to-[#CD7F32]/5 border-[#CD7F32]/30';
                return (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className={`glass rounded-2xl p-4 sm:p-5 text-center card-interactive w-28 sm:w-44 flex flex-col justify-between ${height} bg-gradient-to-b ${colors}`}
                    data-testid={`podium-${idx}`}
                  >
                    <div className="flex justify-center">{rankIcon(idx)}</div>
                    <div>
                      <div className="w-12 h-12 rounded-full bg-[#00FFA3]/20 flex items-center justify-center mx-auto mb-2 border border-[#00FFA3]/30">
                        <span className="font-heading text-lg font-bold text-[#00FFA3]">
                          {u.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-heading text-xs sm:text-sm font-semibold truncate text-white">{u.name}</h4>
                      <p className="text-[10px] text-[#A0A0AB] truncate">{u.school || 'Junior Journalist'}</p>
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-[#00FFA3] font-bold">
                      {u.lifetime_xp || 0} XP
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 max-w-md">
            <Search size={16} className="text-[#71717A]" />
            <input
              type="text"
              placeholder="Search reporters by name, school, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-[#71717A] focus:outline-none w-full"
            />
          </div>

          {/* Full Leaderboard Table */}
          <div className="glass rounded-2xl overflow-hidden" data-testid="leaderboard">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
                <Trophy size={20} className="text-[#00FFA3]" /> Rankings
              </h3>
              <span className="text-xs text-[#71717A]">{filteredLeaders.length} contributors</span>
            </div>
            {loading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton-pulse h-16 rounded-xl" />
                ))}
              </div>
            ) : filteredLeaders.length === 0 ? (
              <div className="p-12 text-center text-[#71717A]">No journalists found matching "{searchQuery}"</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredLeaders.map((u, i) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition"
                    data-testid={`leaderboard-row-${i}`}
                  >
                    <div className="w-8 text-center">{rankIcon(i)}</div>
                    <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0 border border-[#00FFA3]/20">
                      <span className="font-bold text-sm text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{u.name}</h4>
                        {u.city && <span className="text-[10px] text-[#71717A]">• {u.city}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#A0A0AB]">{u.school || 'Junior Journalist'}</span>
                        {(u.role_tags || []).slice(0, 2).map((t) => (
                          <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[#00FFA3] border border-[#00FFA3]/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-sm font-bold text-[#00FFA3]">{u.lifetime_xp || 0} XP</div>
                      <div className="text-[10px] text-[#71717A]">{u.badges?.length || 0} badges</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CAMPUS CHAPTERS TAB */}
      {activeTab === 'chapters' && (
        <div>
          <div className="glass rounded-2xl p-6 mb-8 bg-gradient-to-r from-[#2962FF]/10 via-transparent to-[#00FFA3]/10 border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white mb-1">Empowering Youth Newsrooms Worldwide</h3>
                <p className="text-xs text-[#A0A0AB] max-w-2xl">
                  Junior Journalist Campus Chapters empower student newsrooms in high schools and colleges. 
                  Lead local reporting, host live debate desks, and bring real stories from your campus to the national stage.
                </p>
              </div>
              <button
                onClick={() => setShowChapterModal(true)}
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
              >
                Apply to Start a Chapter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chaptersList.map((chap, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 card-interactive border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2962FF]/20 flex items-center justify-center text-[#2962FF] border border-[#2962FF]/30">
                      <School size={20} />
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-[#A0A0AB]">
                      <MapPin size={12} className="text-[#00FFA3]" /> {chap.city || 'National'}
                    </span>
                  </div>
                  <h4 className="font-heading text-base font-bold text-white mb-2">{chap.school}</h4>
                  <div className="flex items-center gap-2 text-xs text-[#A0A0AB] mb-4">
                    <Users size={14} className="text-[#00FFA3]" />
                    <span>{chap.member_count} active journalists</span>
                  </div>

                  {chap.leaders && chap.leaders.length > 0 && (
                    <div className="mb-4">
                      <div className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold mb-1.5">Chapter Leads</div>
                      <div className="flex flex-wrap gap-1.5">
                        {chap.leaders.map((lead, lIdx) => (
                          <span key={lIdx} className="text-[11px] px-2 py-0.5 rounded-lg bg-white/5 text-white border border-white/10">
                            {lead.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-[#00FFA3] font-semibold">● Active Newsroom</span>
                  <Link
                    to={`/events`}
                    className="text-xs text-white hover:text-[#00FFA3] flex items-center gap-1 transition"
                  >
                    View Events <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WALL OF FAME TAB */}
      {activeTab === 'wall-of-fame' && (
        <div className="space-y-8">
          {/* Young Voice of the Month */}
          <div className="glass rounded-3xl p-8 bg-gradient-to-r from-[#FFD600]/15 via-[#2962FF]/10 to-transparent border-[#FFD600]/30 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#FFD600] text-black font-heading text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              Young Voice of the Month
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#FFD600] to-[#FF9100] flex items-center justify-center text-black font-heading text-3xl font-black shrink-0 shadow-lg shadow-[#FFD600]/20">
                A
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-heading text-2xl font-black text-white mb-1">Aarav Sharma</h3>
                <p className="text-xs text-[#FFD600] font-mono mb-3">Campus Lead • Delhi Public School (R.K. Puram)</p>
                <p className="text-sm text-[#A0A0AB] italic max-w-2xl mb-4">
                  "Exposed water resource mismanagement across urban municipal wards, driving community action and youth petitions signed by over 1,200 citizens."
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="badge-pill">1,850 XP</span>
                  <span className="badge-pill text-[#00FFA3] border-[#00FFA3]/30">8 Published Articles</span>
                  <span className="badge-pill text-[#FFD600] border-[#FFD600]/30">Master Storyteller</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame Spotlights */}
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
              <Crown size={20} className="text-[#FFD600]" /> Hall of Fame Contributors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Ananya Desai",
                  school: "The Cathedral & John Connon, Mumbai",
                  title: "Top Investigative Reporter",
                  points: "1,420 XP",
                  desc: "Led the undercover investigative piece on digital safety and youth cyber wellness."
                },
                {
                  name: "Rohan Verma",
                  school: "National Public School, Bengaluru",
                  title: "Photojournalist of the Year",
                  points: "1,150 XP",
                  desc: "Captured over 50 photo essays documenting rural innovators and grassroots climate solutions."
                },
                {
                  name: "Rushal Singh",
                  school: "St. Paul's Senior Secondary, Udaipur",
                  title: "Community Builder Award",
                  points: "1,980 XP",
                  desc: "Architect of the Junior Journalist youth journalism platform and multi-campus newsroom network."
                }
              ].map((hall, hIdx) => (
                <div key={hIdx} className="glass rounded-2xl p-6 border border-white/10 card-interactive flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600] mb-3">
                      <Star size={16} />
                    </div>
                    <h4 className="font-heading text-base font-bold text-white mb-1">{hall.name}</h4>
                    <p className="text-[11px] text-[#A0A0AB] mb-2">{hall.school}</p>
                    <span className="inline-block text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded-full mb-3">
                      {hall.title}
                    </span>
                    <p className="text-xs text-[#71717A] mb-4">{hall.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#00FFA3] font-bold">{hall.points}</span>
                    <span className="text-[#71717A]">Honored 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start a Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up">
            <h3 className="font-heading text-xl font-bold mb-2">Start a Campus Chapter</h3>
            <p className="text-xs text-[#A0A0AB] mb-6">
              Bring Junior Journalist to your high school or university. You'll receive an official starter kit, 
              editorial mentorship, and publication priority.
            </p>

            {chapterSubmitted ? (
              <div className="py-8 text-center text-[#00FFA3]">
                <CheckCircle size={48} className="mx-auto mb-3" />
                <h4 className="font-heading text-lg font-bold">Application Received!</h4>
                <p className="text-xs text-[#A0A0AB] mt-1">Our editorial board will reach out to you within 48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleStartChapter} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">School / College Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern School, Barakhamba"
                    value={chapterForm.school}
                    onChange={(e) => setChapterForm({ ...chapterForm, school: e.target.value })}
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={chapterForm.city}
                      onChange={(e) => setChapterForm({ ...chapterForm, city: e.target.value })}
                      className="input-dark w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Student Lead Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={chapterForm.student_lead}
                      onChange={(e) => setChapterForm({ ...chapterForm, student_lead: e.target.value })}
                      className="input-dark w-full text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Official / Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@school.edu"
                    value={chapterForm.contact_email}
                    onChange={(e) => setChapterForm({ ...chapterForm, contact_email: e.target.value })}
                    className="input-dark w-full text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowChapterModal(false)}
                    className="btn-ghost text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
