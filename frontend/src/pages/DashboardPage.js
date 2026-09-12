import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboard as dashApi, submissions as subApi, users as usersApi } from '../lib/api';
import { LayoutDashboard, PenTool, Calendar, CheckCircle2, Users, Clock, Eye, Shield, ArrowRight, FileText } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!user) return;
    dashApi.stats().then(r => { setStats(r.data); setLoading(false); }).catch(() => setLoading(false));
    if (user.role === 'admin' || user.role === 'manager') {
      subApi.list({ status: 'pending' }).then(r => setPendingSubs(r.data)).catch(() => {});
      usersApi.listAll().then(r => setAllUsers(r.data)).catch(() => {});
    }
  }, [user]);

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center"><div className="skeleton-pulse h-20 w-60 mx-auto rounded-2xl" /></div>;
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
    ? [{ id: 'overview', label: 'Overview' }, { id: 'moderation', label: 'Moderation' }, { id: 'users', label: 'Users' }]
    : [{ id: 'overview', label: 'Overview' }];

  const handleApprove = async (subId) => {
    await subApi.updateStatus(subId, 'published');
    setPendingSubs(pendingSubs.filter(s => s.id !== subId));
  };

  const handleReject = async (subId) => {
    await subApi.updateStatus(subId, 'rejected');
    setPendingSubs(pendingSubs.filter(s => s.id !== subId));
  };

  const handleRoleChange = async (userId, newRole) => {
    await usersApi.updateRole(userId, newRole);
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="dashboard-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-1" data-testid="dashboard-title">Dashboard</h1>
          <p className="text-[#A0A0AB] text-sm">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-pill">{user.role}</span>
          <span className="font-mono text-sm text-[#00FFA3]">{user.lifetime_xp || 0} XP</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8" data-testid="dashboard-tabs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
            data-testid={`tab-${t.id}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-pulse h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="stats-grid">
              <div className="glass rounded-2xl p-5 card-interactive">
                <PenTool size={20} className="text-[#00FFA3] mb-2" />
                <div className="font-heading text-2xl font-bold font-mono">{stats?.my_submissions || 0}</div>
                <div className="text-xs text-[#A0A0AB]">My Submissions</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive">
                <CheckCircle2 size={20} className="text-[#2962FF] mb-2" />
                <div className="font-heading text-2xl font-bold font-mono">{stats?.my_published || 0}</div>
                <div className="text-xs text-[#A0A0AB]">Published</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive">
                <Calendar size={20} className="text-[#FFD600] mb-2" />
                <div className="font-heading text-2xl font-bold font-mono">{stats?.my_events || 0}</div>
                <div className="text-xs text-[#A0A0AB]">Events Led</div>
              </div>
              <div className="glass rounded-2xl p-5 card-interactive">
                <CheckCircle2 size={20} className="text-[#E17055] mb-2" />
                <div className="font-heading text-2xl font-bold font-mono">{stats?.my_tasks_done || 0}/{stats?.my_tasks || 0}</div>
                <div className="text-xs text-[#A0A0AB]">Tasks Done</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-testid="quick-actions">
            <Link to="/submit" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4" data-testid="quick-submit">
              <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center"><PenTool size={18} className="text-[#00FFA3]" /></div>
              <div>
                <h4 className="text-sm font-semibold">Submit Work</h4>
                <p className="text-[10px] text-[#A0A0AB]">Write & earn points</p>
              </div>
              <ArrowRight size={16} className="text-[#52525B] ml-auto" />
            </Link>
            <Link to="/events" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4" data-testid="quick-events">
              <div className="w-10 h-10 rounded-xl bg-[#2962FF]/10 flex items-center justify-center"><Calendar size={18} className="text-[#2962FF]" /></div>
              <div>
                <h4 className="text-sm font-semibold">Browse Events</h4>
                <p className="text-[10px] text-[#A0A0AB]">Join or lead projects</p>
              </div>
              <ArrowRight size={16} className="text-[#52525B] ml-auto" />
            </Link>
            <Link to="/rewards" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4" data-testid="quick-rewards">
              <div className="w-10 h-10 rounded-xl bg-[#FFD600]/10 flex items-center justify-center"><Shield size={18} className="text-[#FFD600]" /></div>
              <div>
                <h4 className="text-sm font-semibold">My Rewards</h4>
                <p className="text-[10px] text-[#A0A0AB]">{user.badges?.length || 0} badges earned</p>
              </div>
              <ArrowRight size={16} className="text-[#52525B] ml-auto" />
            </Link>
          </div>

          {/* Admin stats */}
          {isAdmin && stats && (
            <div className="glass rounded-2xl p-6 mb-8" data-testid="admin-stats">
              <h3 className="font-heading text-sm font-semibold mb-4">Platform Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="font-heading text-xl font-bold font-mono">{stats.total_users}</div>
                  <div className="text-xs text-[#A0A0AB]">Total Users</div>
                </div>
                <div>
                  <div className="font-heading text-xl font-bold font-mono">{stats.total_submissions}</div>
                  <div className="text-xs text-[#A0A0AB]">Total Submissions</div>
                </div>
                <div>
                  <div className="font-heading text-xl font-bold font-mono">{stats.total_events}</div>
                  <div className="text-xs text-[#A0A0AB]">Total Events</div>
                </div>
                <div>
                  <div className="font-heading text-xl font-bold font-mono text-[#FFD600]">{stats.pending_reviews}</div>
                  <div className="text-xs text-[#A0A0AB]">Pending Reviews</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'moderation' && isAdmin && (
        <div data-testid="moderation-panel">
          <h3 className="font-heading text-lg font-semibold mb-4">Pending Submissions ({pendingSubs.length})</h3>
          {pendingSubs.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-[#A0A0AB]" data-testid="no-pending">
              <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">All caught up! No pending submissions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubs.map((sub, i) => (
                <div key={sub.id} className="glass rounded-2xl p-5" data-testid={`pending-sub-${i}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-pill text-[9px]">{sub.type}</span>
                        <span className="text-xs text-[#A0A0AB]">by {sub.author_name}</span>
                      </div>
                      <h4 className="font-heading text-sm font-semibold mb-1">{sub.title}</h4>
                      <p className="text-xs text-[#52525B] line-clamp-2">{sub.content}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleApprove(sub.id)} className="btn-primary text-xs py-1.5 px-3" data-testid={`approve-${sub.id}`}>Publish</button>
                      <button onClick={() => handleReject(sub.id)} className="btn-ghost text-xs py-1.5 px-3 text-[#FF3B30] border-[#FF3B30]/30" data-testid={`reject-${sub.id}`}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && isAdmin && (
        <div data-testid="users-panel">
          <h3 className="font-heading text-lg font-semibold mb-4">All Users ({allUsers.length})</h3>
          <div className="space-y-3">
            {allUsers.map((u, i) => (
              <div key={u.id} className="glass rounded-2xl p-4 flex items-center gap-4" data-testid={`user-row-${i}`}>
                <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold">{u.name}</h4>
                  <p className="text-[10px] text-[#A0A0AB]">{u.email} | {u.lifetime_xp} XP</p>
                </div>
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="input-dark text-xs py-1 px-2 w-28" data-testid={`role-select-${i}`}>
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
