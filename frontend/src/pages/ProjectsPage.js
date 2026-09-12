import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { projects as projectApi } from '../lib/api';
import AuthModal from '../components/AuthModal';
import { 
  Users, Target, Calendar, Plus, CheckCircle2, 
  Sparkles, ArrowRight, ShieldCheck, X, Briefcase, Filter
} from 'lucide-react';

const categories = ['all', 'investigative', 'environment', 'civic', 'campus', 'social'];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalProject, setJoinModalProject] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'investigative',
    goal: '',
    target_date: '',
    cover_image: '',
    open_roles: 'Investigative Writer, Data Visualizer, Photographer'
  });

  const fetchProjects = async () => {
    try {
      const params = activeCategory !== 'all' ? { category: activeCategory } : {};
      const res = await projectApi.list(params);
      setProjectsList(res.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const rolesArray = formData.open_roles
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        open_roles: rolesArray
      };

      await projectApi.create(payload);
      setCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'investigative',
        goal: '',
        target_date: '',
        cover_image: '',
        open_roles: 'Investigative Writer, Data Visualizer, Photographer'
      });
      setSuccessMsg('Project campaign launched successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinProject = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!selectedRole) {
      setError('Please select or specify a role to join');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await projectApi.join(joinModalProject.id, selectedRole);
      setJoinModalProject(null);
      setSelectedRole('');
      setSuccessMsg(`Joined "${joinModalProject.title}" as ${selectedRole}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to join project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24" data-testid="projects-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Collaborative Journalism Desk
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Projects & Campaigns
          </h1>
          <p className="text-[#A0A0AB] text-base max-w-2xl">
            Team up with student journalists, photographers, and researchers across schools to investigate critical issues, run nationwide reporting drives, and publish collective impact stories.
          </p>
        </div>

        <button
          onClick={() => (user ? setCreateModalOpen(true) : setAuthOpen(true))}
          className="btn-primary flex items-center gap-2 self-start md:self-center py-3 px-6 shadow-lg shadow-[#00FFA3]/10"
          data-testid="start-campaign-btn"
        >
          <Plus size={18} /> Start a Campaign
        </button>
      </div>

      {successMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-8 pb-2">
        <Filter size={16} className="text-[#52525B] mr-2 shrink-0 hidden sm:block" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/40 shadow-sm'
                : 'glass text-[#A0A0AB] hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-pulse h-96 rounded-3xl" />
          ))}
        </div>
      ) : projectsList.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-xl mx-auto border border-white/10">
          <Target size={48} className="text-[#52525B] mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-white mb-2">No Campaigns in this category</h3>
          <p className="text-sm text-[#A0A0AB] mb-6">Be the leader to initiate an investigative project or student campaign.</p>
          <button
            onClick={() => (user ? setCreateModalOpen(true) : setAuthOpen(true))}
            className="btn-primary text-sm py-2.5 px-6"
          >
            Launch First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((proj) => {
            const isMember = user && proj.team?.some((m) => m.user_id === user.id);

            return (
              <div
                key={proj.id}
                className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col card-interactive transition hover:border-[#00FFA3]/30"
              >
                {/* Card Cover */}
                <div className="relative h-48 w-full bg-black/40 overflow-hidden">
                  {proj.cover_image ? (
                    <img
                      src={proj.cover_image}
                      alt={proj.title}
                      className="w-full h-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00FFA3]/10 to-[#2962FF]/20 flex items-center justify-center">
                      <Target size={40} className="text-[#00FFA3]/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge-pill bg-black/70 backdrop-blur-md text-[#00FFA3] border-[#00FFA3]/30 text-[11px] uppercase">
                      {proj.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                    {proj.progress || 0}% Complete
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white mb-2 line-clamp-2 leading-snug">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#A0A0AB] mb-4 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Goal & Milestone Bar */}
                    <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#A0A0AB] flex items-center gap-1">
                          <Target size={13} className="text-[#00FFA3]" /> Campaign Goal
                        </span>
                        <span className="text-[11px] text-[#00FFA3] font-bold">
                          {proj.progress || 0}%
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white mb-2.5 line-clamp-1">{proj.goal}</p>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#00FFA3] to-[#2962FF] h-2 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(5, proj.progress || 0))}%` }}
                        />
                      </div>
                    </div>

                    {/* Open Roles Needed */}
                    {proj.open_roles?.length > 0 && (
                      <div className="mb-5">
                        <div className="text-[11px] text-[#A0A0AB] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                          <Briefcase size={12} className="text-[#FFD600]" /> Open Team Roles
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.open_roles.map((role) => (
                            <span
                              key={role}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#FFD600]/10 text-[#FFD600] border border-[#FFD600]/20"
                            >
                              + {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team & Action Bar */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(proj.team || []).slice(0, 3).map((m, idx) => (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full bg-[#00FFA3]/20 border-2 border-black flex items-center justify-center text-[10px] font-bold text-[#00FFA3]"
                            title={`${m.name} (${m.role})`}
                          >
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] text-[#A0A0AB]">
                        {proj.team?.length || 0} active
                      </span>
                    </div>

                    {isMember ? (
                      <span className="text-xs font-semibold text-[#00FFA3] flex items-center gap-1">
                        <ShieldCheck size={14} /> Joined
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setJoinModalProject(proj);
                          setSelectedRole(proj.open_roles?.[0] || 'Contributor');
                        }}
                        className="btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1"
                      >
                        Join Team <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Project Modal */}
      {joinModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/10 relative">
            <button
              onClick={() => setJoinModalProject(null)}
              className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="badge-pill text-[10px] mb-2 uppercase">{joinModalProject.category}</span>
              <h3 className="font-heading text-xl font-bold text-white mb-1">
                Join {joinModalProject.title}
              </h3>
              <p className="text-xs text-[#A0A0AB]">
                Select which open role you wish to take on in this campaign.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <label className="overline block">Available Roles</label>
              <div className="space-y-2">
                {joinModalProject.open_roles?.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition border ${
                      selectedRole === role
                        ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40'
                        : 'bg-white/5 text-[#A0A0AB] border-white/5 hover:border-white/20'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div>
                <label className="overline block mb-1">Or custom role title</label>
                <input
                  className="input-dark text-xs"
                  placeholder="e.g. Lead Researcher, Graphic Designer"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setJoinModalProject(null)}
                className="btn-ghost text-xs py-2.5 flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinProject}
                disabled={submitting}
                className="btn-primary text-xs py-2.5 flex-1 flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Joining...' : 'Confirm & Join Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Campaign Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/10 relative my-8">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="font-heading text-2xl font-bold text-white mb-1">
                Launch a Reporting Campaign
              </h3>
              <p className="text-xs text-[#A0A0AB]">
                Pitch a collaborative initiative, rally fellow youth journalists, and assign team responsibilities.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="overline block mb-1">Campaign Title</label>
                <input
                  className="input-dark text-xs"
                  placeholder="e.g. Clean Campus & Zero Waste Audit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="overline block mb-1">Category</label>
                <select
                  className="input-dark text-xs bg-black/60"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="investigative">Investigative Reporting</option>
                  <option value="environment">Environmental & Climate</option>
                  <option value="civic">Civic & Youth Rights</option>
                  <option value="campus">Campus Life & Education</option>
                  <option value="social">Social Impact & Community</option>
                </select>
              </div>

              <div>
                <label className="overline block mb-1">Campaign Overview</label>
                <textarea
                  className="input-dark text-xs min-h-[90px]"
                  placeholder="What is the story or issue? Why does it matter to students?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="overline block mb-1">Tangible Project Goal</label>
                <input
                  className="input-dark text-xs"
                  placeholder="e.g. Audit 15 high schools and publish a national whitepaper"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="overline block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    className="input-dark text-xs"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="overline block mb-1">Cover Image URL</label>
                  <input
                    className="input-dark text-xs"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="overline block mb-1">Open Team Roles (comma-separated)</label>
                <input
                  className="input-dark text-xs"
                  placeholder="Field Writer, Data Visualizer, Interviewer"
                  value={formData.open_roles}
                  onChange={(e) => setFormData({ ...formData, open_roles: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-ghost text-xs py-2.5 flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2.5 flex-1 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Launching...' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
