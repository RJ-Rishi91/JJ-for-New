import React, { useState, useEffect } from 'react';
import { resources as resApi } from '../lib/api';
import { BookOpen, Video, FileText, Lightbulb, Search, MessageSquare, CheckCircle, HelpCircle, ExternalLink, X, Send } from 'lucide-react';

const typeIcons = {
  guide: <BookOpen size={20} />,
  webinar: <Video size={20} />,
  template: <FileText size={20} />,
  prompt: <Lightbulb size={20} />
};

const types = ['all', 'guide', 'webinar', 'template', 'prompt'];
const cats = ['all', 'writing', 'photography', 'tools', 'journalism', 'ethics'];

export default function LearnPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ask a Mentor state
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [mentorForm, setMentorForm] = useState({ topic: 'Writing & Pitching', question: '' });
  const [mentorSubmitting, setMentorSubmitting] = useState(false);
  const [mentorSuccess, setMentorSuccess] = useState(false);

  // Selected Resource Modal
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const params = {};
    if (activeType !== 'all') params.type = activeType;
    if (activeCat !== 'all') params.category = activeCat;
    resApi.list(params).then(r => {
      setResources(r.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [activeType, activeCat]);

  const writingPrompts = [
    "Write about a local hero in your community who deserves national recognition.",
    "Describe a day in the life of a high school investigative reporter in 2026.",
    "What would you change about your school curriculum if you were principal for a day?",
    "Interview an elder in your family or town about how technology transformed their neighborhood.",
    "Investigate and pitch an exposè on cafeteria food quality or campus paper waste."
  ];

  const handleAskMentor = async (e) => {
    e.preventDefault();
    if (!mentorForm.question.trim()) return;
    setMentorSubmitting(true);
    try {
      await resApi.askMentor(mentorForm);
      setMentorSuccess(true);
      setTimeout(() => {
        setMentorSuccess(false);
        setShowMentorModal(false);
        setMentorForm({ topic: 'Writing & Pitching', question: '' });
      }, 2500);
    } catch (err) {
      // If unauthorized or error, show quick feedback
      alert(err.response?.data?.detail || "Please log in to submit a question to the editorial mentors.");
    } finally {
      setMentorSubmitting(false);
    }
  };

  const filteredResources = resources.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="learn-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="learn-title">
            Skill-Building Hub
          </h1>
          <p className="text-[#A0A0AB]">
            Master reporting techniques, investigative ethics, photojournalism, and pitch crafts.
          </p>
        </div>
        <button
          onClick={() => setShowMentorModal(true)}
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 self-start sm:self-auto shrink-0 shadow-lg shadow-[#00FFA3]/10"
        >
          <MessageSquare size={16} /> Ask an Editor / Mentor
        </button>
      </div>

      {/* Writing Prompts Carousel */}
      <section className="mb-12" data-testid="prompts-section">
        <div className="flex items-center justify-between mb-4">
          <span className="overline text-[#00FFA3]">Daily Writing Sparks</span>
          <span className="text-xs text-[#71717A]">Updated for today</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {writingPrompts.map((p, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-5 min-w-[280px] max-w-[320px] card-interactive animate-fade-in-up border border-white/10 flex flex-col justify-between"
              style={{ animationDelay: `${i * 80}ms` }}
              data-testid={`prompt-${i}`}
            >
              <div>
                <Lightbulb size={18} className="text-[#FFD600] mb-3" />
                <p className="text-sm text-white/90 leading-relaxed">{p}</p>
              </div>
              <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#71717A]">
                <span>Spark #{i + 1}</span>
                <span className="text-[#00FFA3] hover:underline cursor-pointer">Start Draft →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full md:w-80">
          <Search size={16} className="text-[#71717A]" />
          <input
            type="text"
            placeholder="Search guides, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-[#71717A] focus:outline-none w-full"
          />
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1" data-testid="learn-type-filters">
          {types.map(t => (
            <button
              key={t}
              onClick={() => { setActiveType(t); setLoading(true); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeType === t
                  ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30'
                  : 'glass text-[#A0A0AB] hover:text-white'
              }`}
              data-testid={`learn-filter-${t}`}
            >
              {t === 'all' ? 'All Formats' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1" data-testid="learn-cat-filters">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => { setActiveCat(c); setLoading(true); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCat === c
                ? 'bg-[#2962FF]/20 text-[#2962FF] border border-[#2962FF]/40'
                : 'text-[#71717A] hover:text-[#A0A0AB] bg-white/5'
            }`}
            data-testid={`learn-cat-${c}`}
          >
            {c === 'all' ? 'All Topics' : '#' + c}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-pulse h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center text-[#A0A0AB]" data-testid="learn-empty">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30 text-[#00FFA3]" />
          <p className="font-heading text-lg font-bold text-white mb-1">No resources found</p>
          <p className="text-xs text-[#71717A]">Try changing your search query or topic filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="resources-grid">
          {filteredResources.map((r, i) => (
            <div
              key={r.id || i}
              onClick={() => setSelectedResource(r)}
              className="glass rounded-2xl p-6 card-interactive animate-fade-in-up border border-white/10 flex flex-col justify-between cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
              data-testid={`resource-${i}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2962FF]/15 flex items-center justify-center text-[#2962FF] border border-[#2962FF]/20">
                    {typeIcons[r.type] || <BookOpen size={20} />}
                  </div>
                  <span className="badge-pill text-[10px] uppercase font-bold">{r.type}</span>
                </div>
                <h3 className="font-heading text-base font-bold text-white mb-2 leading-snug">{r.title}</h3>
                <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[#71717A] text-[11px] font-mono">#{r.category || 'journalism'}</span>
                <span className="text-[#00FFA3] flex items-center gap-1 text-[11px] font-semibold hover:underline">
                  Read Guide →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Detail Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/20 animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="badge-pill text-[10px] uppercase">{selectedResource.type}</span>
              <span className="text-xs text-[#71717A]">#{selectedResource.category}</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-black text-white mb-4">
              {selectedResource.title}
            </h2>
            <div className="text-sm text-[#D4D4D8] leading-relaxed mb-6 space-y-3">
              <p>{selectedResource.description}</p>
              {selectedResource.content && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs font-mono whitespace-pre-wrap">
                  {selectedResource.content}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {selectedResource.url ? (
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  Open External Source <ExternalLink size={14} />
                </a>
              ) : (
                <span className="text-xs text-[#71717A]">Junior Journalist Editorial Academy</span>
              )}
              <button
                onClick={() => setSelectedResource(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask a Mentor Modal */}
      {showMentorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up">
            <h3 className="font-heading text-xl font-bold mb-1 flex items-center gap-2">
              <MessageSquare size={20} className="text-[#00FFA3]" /> Ask an Editor / Mentor
            </h3>
            <p className="text-xs text-[#A0A0AB] mb-6">
              Stuck on a story pitch? Want feedback on investigative ethics or interview prep? Ask our senior journalists.
            </p>

            {mentorSuccess ? (
              <div className="py-8 text-center text-[#00FFA3]">
                <CheckCircle size={48} className="mx-auto mb-3 text-[#00FFA3]" />
                <h4 className="font-heading text-lg font-bold">Question Dispatched!</h4>
                <p className="text-xs text-[#A0A0AB] mt-1">
                  A mentor from the Senior Editorial Desk will review your query and reply in your notifications.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAskMentor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Topic Area</label>
                  <select
                    value={mentorForm.topic}
                    onChange={(e) => setMentorForm({ ...mentorForm, topic: e.target.value })}
                    className="input-dark w-full text-sm"
                  >
                    <option value="Writing & Pitching">Writing & Pitching Stories</option>
                    <option value="Investigative Ethics">Journalistic Ethics & Fact-Checking</option>
                    <option value="Interview Techniques">Interview Preparation & Asking Hard Questions</option>
                    <option value="Photojournalism">Visual Storytelling & Photojournalism</option>
                    <option value="Campus Newsroom">Leading a Student Newsroom / Chapter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Your Question or Scenario</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what you're working on and where you'd like editorial guidance..."
                    value={mentorForm.question}
                    onChange={(e) => setMentorForm({ ...mentorForm, question: e.target.value })}
                    className="input-dark w-full text-sm leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowMentorModal(false)}
                    className="btn-ghost text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mentorSubmitting}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    {mentorSubmitting ? "Sending..." : "Submit Question"}
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
