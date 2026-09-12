import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboard as dashApi, submissions as subApi, users as usersApi, admin as adminApi } from '../lib/api';
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  CheckCircle2,
  Users,
  Clock,
  Eye,
  Shield,
  ArrowRight,
  FileText,
  Megaphone,
  Send,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState('overview');

  // Broadcast Announcement State
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    target_role: 'all',
    link: ''
  });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Article reading modal
  const [viewingSub, setViewingSub] = useState(null);

  useEffect(() => {
    if (!user) return;
    dashApi.stats().then(r => {
      setStats(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    if (user.role === 'admin' || user.role === 'manager') {
      subApi.list({ status: 'pending' }).then(r => setPendingSubs(r.data || [])).catch(() => {});
      usersApi.listAll().then(r => setAllUsers(r.data || [])).catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="skeleton-pulse h-20 w-60 mx-auto rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center" data-testid="dashboard-login-required">
        <h2 className="font-heading text-2xl font-bold mb-4">Sign in Required</h2>
        <p className="text-[#A0A0AB]">Please log in to access your dashboard.</p>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.role === 'manager';
  const tabs = isAdmin
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'moderation', label: `Moderation (${pendingSubs.length})` },
        { id: 'broadcast', label: 'Broadcast Alert' },
        { id: 'users', label: 'Community Directory' }
      ]
    : [{ id: 'overview', label: 'Overview' }];

  const handleApprove = async (subId) => {
    await subApi.updateStatus(subId, 'published');
    setPendingSubs(pendingSubs.filter(s => s.id !== subId));
    if (viewingSub?.id === subId) setViewingSub(null);
  };

  const handleReject = async (subId) => {
    await subApi.updateStatus(subId, 'rejected');
    setPendingSubs(pendingSubs.filter(s => s.id !== subId));
    if (viewingSub?.id === subId) setViewingSub(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    await usersApi.updateRole(userId, newRole);
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setBroadcastSending(true);
    try {
      await adminApi.broadcast(broadcastForm);
      setBroadcastSuccess(true);
      setBroadcastForm({ title: '', message: '', target_role: 'all', link: '' });
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to dispatch broadcast");
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="dashboard-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-1" data-testid="dashboard-title">
            Newsroom Dashboard
          </h1>
          <p className="text-[#A0A0AB] text-sm">Welcome back, {user.name} ({user.school || 'Junior Journalist'})</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-pill uppercase text-[11px] font-bold tracking-wider">{user.role}</span>
          <span className="font-mono text-sm text-[#00FFA3] font-bold">{user.lifetime_xp || 0} XP</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar" data-testid="dashboard-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30 shadow-sm'
                : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'
            }`}
            data-testid={`tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW */}
      {tab === 'overview' && (
        <>
          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-pulse h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
              <div className="glass rounded-2xl p-5 card-interactive border border-white/10">
                <PenTool size={20} className="text-[#00FFA3] mb-2" />
                <div className="font-heading text-3xl font-black font-mono text-white">{stats?.my_submissions || 0}</div>
                <div className="text-xs text-[#A0A0AB] mt-1">My Submissions</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive border border-white/10">
                <CheckCircle2 size={20} className="text-[#2962FF] mb-2" />
                <div className="font-heading text-3xl font-black font-mono text-white">{stats?.my_published || 0}</div>
                <div className="text-xs text-[#A0A0AB] mt-1">Published Live</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive border border-white/10">
                <Calendar size={20} className="text-[#FFD600] mb-2" />
                <div className="font-heading text-3xl font-black font-mono text-white">{stats?.my_events || 0}</div>
                <div className="text-xs text-[#A0A0AB] mt-1">Events Led / Joined</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive border border-white/10">
                <CheckCircle2 size={20} className="text-[#E17055] mb-2" />
                <div className="font-heading text-3xl font-black font-mono text-white">
                  {stats?.my_tasks_done || 0} / {stats?.my_tasks || 0}
                </div>
                <div className="text-xs text-[#A0A0AB] mt-1">Tasks Completed</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-testid="quick-actions">
            <Link to="/submit" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10" data-testid="quick-submit">
              <div className="w-11 h-11 rounded-xl bg-[#00FFA3]/15 flex items-center justify-center text-[#00FFA3] shrink-0 border border-[#00FFA3]/30">
                <PenTool size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Draft New Article</h4>
                <p className="text-[11px] text-[#A0A0AB]">Write, attach media & earn XP</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
            <Link to="/events" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10" data-testid="quick-events">
              <div className="w-11 h-11 rounded-xl bg-[#2962FF]/15 flex items-center justify-center text-[#2962FF] shrink-0 border border-[#2962FF]/30">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Newsroom Projects</h4>
                <p className="text-[11px] text-[#A0A0AB]">Team reporting & Kanban desks</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
            <Link to="/rewards" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10" data-testid="quick-rewards">
              <div className="w-11 h-11 rounded-xl bg-[#FFD600]/15 flex items-center justify-center text-[#FFD600] shrink-0 border border-[#FFD600]/30">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Claim Rewards</h4>
                <p className="text-[11px] text-[#A0A0AB]">{user.badges?.length || 0} badges • Redeem merch</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
          </div>

          {/* Admin Platform Overview */}
          {isAdmin && stats && (
            <div className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-white/10" data-testid="admin-stats">
              <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#00FFA3]" /> Platform Overview (Admin & Editorial Desk)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-black font-mono text-white">{stats.total_users}</div>
                  <div className="text-xs text-[#A0A0AB]">Registered Reporters</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-black font-mono text-white">{stats.total_submissions}</div>
                  <div className="text-xs text-[#A0A0AB]">Total Submissions</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-black font-mono text-white">{stats.total_events}</div>
                  <div className="text-xs text-[#A0A0AB]">Active Events & Desks</div>
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-black font-mono text-[#FFD600]">{stats.pending_reviews}</div>
                  <div className="text-xs text-[#A0A0AB]">Pending Editorial Reviews</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. MODERATION TAB */}
      {tab === 'moderation' && isAdmin && (
        <div data-testid="moderation-panel">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-white">
              Pending Submissions Awaiting Review ({pendingSubs.length})
            </h3>
            <span className="text-xs text-[#71717A]">Review articles, assign XP, or provide feedback</span>
          </div>

          {pendingSubs.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center text-[#A0A0AB] border border-white/10" data-testid="no-pending">
              <CheckCircle2 size={36} className="mx-auto mb-3 text-[#00FFA3]" />
              <h4 className="font-heading text-base font-bold text-white mb-1">Queue is empty!</h4>
              <p className="text-xs text-[#71717A]">All student article submissions have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubs.map((sub, i) => (
                <div key={sub.id} className="glass rounded-2xl p-5 border border-white/10 card-interactive" data-testid={`pending-sub-${i}`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-pill text-[10px] uppercase font-bold">{sub.type || 'article'}</span>
                        <span className="text-xs text-[#71717A]">• #{sub.category || 'general'}</span>
                        <span className="text-xs text-[#A0A0AB]">by <strong className="text-white">{sub.author_name}</strong></span>
                      </div>
                      <h4 className="font-heading text-base font-bold text-white mb-1">{sub.title}</h4>
                      <p className="text-xs text-[#A0A0AB] line-clamp-2 leading-relaxed mb-2">{sub.content}</p>
                      {sub.cover_image && (
                        <div className="text-[11px] text-[#00FFA3] flex items-center gap-1 mb-2">
                          📷 Includes Attached Media
                        </div>
                      )}
                      <button
                        onClick={() => setViewingSub(sub)}
                        className="text-xs text-[#2962FF] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Eye size={14} /> Read Full Submission
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="btn-primary text-xs py-2 px-4 shadow-sm"
                        data-testid={`approve-${sub.id}`}
                      >
                        Approve & Publish (+50 XP)
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        className="btn-ghost text-xs py-2 px-3 text-[#FF3B30] border-[#FF3B30]/30 hover:bg-[#FF3B30]/10"
                        data-testid={`reject-${sub.id}`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BROADCAST ANNOUNCEMENT TAB */}
      {tab === 'broadcast' && isAdmin && (
        <div className="glass rounded-3xl p-6 sm:p-8 max-w-2xl border border-white/10" data-testid="broadcast-panel">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 flex items-center justify-center text-[#00FFA3] border border-[#00FFA3]/30">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Broadcast Announcement</h3>
              <p className="text-xs text-[#A0A0AB]">Send instant notification bell alerts to all reporters or specific roles.</p>
            </div>
          </div>

          {broadcastSuccess && (
            <div className="my-4 p-4 rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 flex items-center gap-3 text-xs text-[#00FFA3] animate-fade-in-up">
              <CheckCircle size={18} />
              <span>Broadcast dispatched successfully! Users will see it in their notification tray.</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Target Audience</label>
              <select
                value={broadcastForm.target_role}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                className="input-dark w-full text-sm"
              >
                <option value="all">Everyone (All Reporters & Editors)</option>
                <option value="member">Student Reporters Only</option>
                <option value="manager">Campus Leads & Managers Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Headline / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. National Youth Journalism Fellowship Applications Open!"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                className="input-dark w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Announcement Details</label>
              <textarea
                required
                rows={4}
                placeholder="Write the notification message to broadcast..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                className="input-dark w-full text-sm leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#A0A0AB] mb-1">Call to Action Link (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /opportunities or https://..."
                value={broadcastForm.link}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                className="input-dark w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={broadcastSending}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 mt-4"
            >
              <Send size={14} />
              {broadcastSending ? "Broadcasting..." : "Dispatch Broadcast Alert"}
            </button>
          </form>
        </div>
      )}

      {/* 4. USERS TAB */}
      {tab === 'users' && isAdmin && (
        <div data-testid="users-panel">
          <h3 className="font-heading text-lg font-bold mb-4">Newsroom Members & Roles ({allUsers.length})</h3>
          <div className="space-y-3">
            {allUsers.map((u, i) => (
              <div key={u.id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10" data-testid={`user-row-${i}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0 border border-[#00FFA3]/20">
                    <span className="font-bold text-sm text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                    <p className="text-[11px] text-[#71717A]">{u.email} • {u.school || 'Junior Journalist'} • <strong className="text-[#00FFA3]">{u.lifetime_xp || 0} XP</strong></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs text-[#71717A]">Permissions:</span>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="input-dark text-xs py-1 px-3 rounded-lg"
                    data-testid={`role-select-${i}`}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager / Campus Lead</option>
                    <option value="admin">Admin / Editor-in-Chief</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Submission Reader Modal */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingSub(null)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-pill text-[10px] uppercase font-bold">{viewingSub.type}</span>
              <span className="text-xs text-[#71717A]">by {viewingSub.author_name}</span>
            </div>
            <h2 className="font-heading text-2xl font-black text-white mb-4">{viewingSub.title}</h2>
            {viewingSub.cover_image && (
              <img
                src={viewingSub.cover_image}
                alt={viewingSub.title}
                className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/10"
              />
            )}
            <div className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap mb-6">
              {viewingSub.content}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(viewingSub.id)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Approve & Publish
                </button>
                <button
                  onClick={() => handleReject(viewingSub.id)}
                  className="btn-ghost text-xs py-2 px-3 text-[#FF3B30] border-[#FF3B30]/30"
                >
                  Decline
                </button>
              </div>
              <button
                onClick={() => setViewingSub(null)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
