import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  dashboard as dashApi,
  submissions as subApi,
  users as usersApi,
  admin as adminApi,
  opportunities as oppApi,
  resources as resApi,
  archives as archiveApi
} from '../lib/api';
import {
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
  X,
  Trash2,
  Plus,
  Briefcase,
  BookOpen,
  Mail,
  Download,
  Search,
  MessageSquare,
  Sparkles,
  ExternalLink
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

  // Article reading & revision modal
  const [viewingSub, setViewingSub] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Opportunities Management
  const [oppList, setOppList] = useState([]);
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    organization: '',
    type: 'internship',
    deadline: '',
    link: '',
    description: ''
  });

  // Resources / Learning Hub Management
  const [resList, setResList] = useState([]);
  const [showResModal, setShowResModal] = useState(false);
  const [resForm, setResForm] = useState({
    title: '',
    category: 'writing',
    type: 'guide',
    content_url: '',
    description: ''
  });

  // Digital Magazine Archives
  const [archiveList, setArchiveList] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveForm, setArchiveForm] = useState({
    title: '',
    issue_number: 1,
    season: 'Spring 2026',
    cover_image: '',
    pdf_url: '',
    articles_count: 12,
    pages: 32
  });

  // Inquiries & Subscribers
  const [inquiries, setInquiries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [inboxTab, setInboxTab] = useState('inquiries');

  // User search
  const [userSearch, setUserSearch] = useState('');

  const isStaff = user && ['admin', 'manager', 'editor'].includes(user.role);
  const isAdmin = user && ['admin', 'manager'].includes(user.role);

  useEffect(() => {
    if (!user) return;

    dashApi.stats().then(r => {
      setStats(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    if (isStaff) {
      subApi.list({ status: 'pending' }).then(r => setPendingSubs(r.data || [])).catch(() => {});
      oppApi.list({}).then(r => setOppList(r.data || [])).catch(() => {});
      resApi.list({}).then(r => setResList(r.data || [])).catch(() => {});
      archiveApi.list().then(r => setArchiveList(r.data || [])).catch(() => {});
      adminApi.inquiries().then(r => setInquiries(r.data || [])).catch(() => {});
    }

    if (isAdmin) {
      usersApi.listAll().then(r => setAllUsers(r.data || [])).catch(() => {});
      adminApi.subscribers().then(r => setSubscribers(r.data || [])).catch(() => {});
    }
  }, [user, isStaff, isAdmin]);

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
        <p className="text-[#A0A0AB]">Please log in to access your newsroom dashboard.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'My Desk' },
    ...(isStaff ? [{ id: 'moderation', label: `Editorial Queue (${pendingSubs.length})` }] : []),
    ...(isStaff ? [{ id: 'opportunities', label: `Opportunities (${oppList.length})` }] : []),
    ...(isStaff ? [{ id: 'resources', label: `Curriculum (${resList.length})` }] : []),
    ...(isStaff ? [{ id: 'archives', label: `Magazine Issues (${archiveList.length})` }] : []),
    ...(isStaff ? [{ id: 'inbox', label: `Reader Inbox (${inquiries.length})` }] : []),
    ...(isAdmin ? [{ id: 'users', label: `Reporters (${allUsers.length})` }] : []),
    ...(isAdmin ? [{ id: 'broadcast', label: 'Broadcast Alert' }] : []),
  ];

  // Submission review handlers
  const handleApprove = async (subId, notes = '') => {
    setActionLoading(true);
    try {
      await subApi.updateStatus(subId, 'published', notes);
      setPendingSubs(pendingSubs.filter(s => s.id !== subId));
      if (viewingSub?.id === subId) setViewingSub(null);
      setShowRevisionModal(false);
      setRevisionNotes('');
    } catch (err) {
      alert("Error approving submission: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async (subId) => {
    if (!revisionNotes.trim()) {
      alert("Please provide constructive editorial revision notes for the author.");
      return;
    }
    setActionLoading(true);
    try {
      await subApi.updateStatus(subId, 'revision_requested', revisionNotes);
      setPendingSubs(pendingSubs.filter(s => s.id !== subId));
      if (viewingSub?.id === subId) setViewingSub(null);
      setShowRevisionModal(false);
      setRevisionNotes('');
    } catch (err) {
      alert("Error requesting revisions: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (subId) => {
    setActionLoading(true);
    try {
      await subApi.updateStatus(subId, 'rejected', rejectNotes);
      setPendingSubs(pendingSubs.filter(s => s.id !== subId));
      if (viewingSub?.id === subId) setViewingSub(null);
      setRejectNotes('');
    } catch (err) {
      alert("Error declining submission: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Opportunities handlers
  const handleCreateOpp = async (e) => {
    e.preventDefault();
    try {
      const res = await oppApi.create(oppForm);
      setOppList([res.data, ...oppList]);
      setShowOppModal(false);
      setOppForm({ title: '', organization: '', type: 'internship', deadline: '', link: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create opportunity");
    }
  };

  const handleDeleteOpp = async (oppId) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
    try {
      await oppApi.delete(oppId);
      setOppList(oppList.filter(o => o.id !== oppId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete opportunity");
    }
  };

  // Resources handlers
  const handleCreateRes = async (e) => {
    e.preventDefault();
    try {
      const res = await resApi.create(resForm);
      setResList([res.data, ...resList]);
      setShowResModal(false);
      setResForm({ title: '', category: 'writing', type: 'guide', content_url: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create resource");
    }
  };

  const handleDeleteRes = async (resId) => {
    if (!window.confirm("Delete this curriculum item?")) return;
    try {
      await resApi.delete(resId);
      setResList(resList.filter(r => r.id !== resId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete resource");
    }
  };

  // Archives handlers
  const handleCreateArchive = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...archiveForm,
        issue_number: parseInt(archiveForm.issue_number) || 1,
        articles_count: parseInt(archiveForm.articles_count) || 10,
        pages: parseInt(archiveForm.pages) || 28
      };
      const res = await archiveApi.create(payload);
      setArchiveList([res.data, ...archiveList]);
      setShowArchiveModal(false);
      setArchiveForm({ title: '', issue_number: archiveList.length + 1, season: 'Spring 2026', cover_image: '', pdf_url: '', articles_count: 12, pages: 32 });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to publish magazine issue");
    }
  };

  const handleDeleteArchive = async (archiveId) => {
    if (!window.confirm("Remove this magazine issue from archives?")) return;
    try {
      await archiveApi.delete(archiveId);
      setArchiveList(archiveList.filter(a => a.id !== archiveId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete issue");
    }
  };

  // User role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole);
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  // Broadcast
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;
    setBroadcastSending(true);
    try {
      await adminApi.broadcast(broadcastForm);
      setBroadcastSuccess(true);
      setBroadcastForm({ title: '', message: '', target_role: 'all', link: '' });
      setTimeout(() => setBroadcastSuccess(false), 4000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to dispatch broadcast");
    } finally {
      setBroadcastSending(false);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.school?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold tracking-widest text-[#00FFA3] uppercase">
              {isStaff ? 'Editorial & Newsroom HQ' : 'Student Journalist Desk'}
            </span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter" data-testid="dashboard-title">
            Newsroom Command Center
          </h1>
          <p className="text-[#A0A0AB] text-sm mt-1">
            Welcome, <strong className="text-white">{user.name}</strong> • {user.school || 'Junior Journalist'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-pill uppercase text-[11px] font-bold tracking-wider border-[#00FFA3]/40 text-[#00FFA3] bg-[#00FFA3]/10">
            {user.role}
          </span>
          <span className="font-mono text-sm text-[#00FFA3] font-bold glass px-3 py-1.5 rounded-xl border border-white/10">
            {user.lifetime_xp || 0} XP
          </span>
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
                ? 'bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/40 shadow-sm'
                : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'
            }`}
            data-testid={`tab-${t.id}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. MY DESK / OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* User Specific Metrics */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-pulse h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
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
                <div className="text-xs text-[#A0A0AB] mt-1">Assignments Done</div>
              </div>
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="quick-actions">
            <Link to="/submit/" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#00FFA3]/15 flex items-center justify-center text-[#00FFA3] shrink-0 border border-[#00FFA3]/30">
                <PenTool size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Draft New Article</h4>
                <p className="text-[11px] text-[#A0A0AB]">Write, attach media & earn 25 XP</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
            <Link to="/messages/" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#2962FF]/15 flex items-center justify-center text-[#2962FF] shrink-0 border border-[#2962FF]/30">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Live Newsroom Chat</h4>
                <p className="text-[11px] text-[#A0A0AB]">Channels & direct reporter messaging</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
            <Link to="/projects/" className="glass rounded-2xl p-5 card-interactive flex items-center gap-4 border border-white/10">
              <div className="w-11 h-11 rounded-xl bg-[#FFD600]/15 flex items-center justify-center text-[#FFD600] shrink-0 border border-[#FFD600]/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Collaborative Desks</h4>
                <p className="text-[11px] text-[#A0A0AB]">Investigative team series & podcasts</p>
              </div>
              <ArrowRight size={16} className="text-[#71717A] ml-auto" />
            </Link>
          </div>

          {/* Platform Command Overview (For Staff) */}
          {isStaff && stats && (
            <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10" data-testid="admin-stats">
              <h3 className="font-heading text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Shield size={20} className="text-[#00FFA3]" /> Global Platform Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-white">{stats.total_users || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Reporters Enrolled</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-[#00FFA3]">{stats.total_submissions || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Articles & Stories</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-[#FFD600]">{stats.pending_reviews || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Awaiting Review</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-[#2962FF]">{stats.total_opportunities || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Live Opportunities</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-white">{stats.total_resources || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Curriculum Guides</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-white">{stats.total_archives || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Magazine Issues</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-[#00FFA3]">{stats.total_subscribers || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Newsletter Readers</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="font-heading text-3xl font-black font-mono text-[#FFD600]">{stats.total_inquiries || 0}</div>
                  <div className="text-xs text-[#A0A0AB] mt-1">Reader Inquiries</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. EDITORIAL MODERATION QUEUE */}
      {tab === 'moderation' && isStaff && (
        <div data-testid="moderation-panel" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                Editorial Review Queue ({pendingSubs.length})
              </h3>
              <p className="text-xs text-[#A0A0AB]">Review draft stories, request revisions, leave feedback, or publish live to Explore.</p>
            </div>
          </div>

          {pendingSubs.length === 0 ? (
            <div className="glass rounded-3xl p-14 text-center text-[#A0A0AB] border border-white/10" data-testid="no-pending">
              <CheckCircle2 size={42} className="mx-auto mb-3 text-[#00FFA3]" />
              <h4 className="font-heading text-lg font-bold text-white mb-1">Queue is clear!</h4>
              <p className="text-xs text-[#71717A]">All student article submissions have been reviewed and published.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubs.map((sub, i) => (
                <div key={sub.id} className="glass rounded-2xl p-6 border border-white/10 card-interactive" data-testid={`pending-sub-${i}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-pill text-[10px] uppercase font-bold text-[#00FFA3] border-[#00FFA3]/30 bg-[#00FFA3]/10">
                          {sub.type || 'article'}
                        </span>
                        <span className="text-xs text-[#71717A] font-mono">• #{sub.category || 'general'}</span>
                        <span className="text-xs text-[#A0A0AB]">
                          by <strong className="text-white">{sub.author_name}</strong>
                        </span>
                        {sub.status === 'revision_requested' && (
                          <span className="badge-pill text-[10px] text-[#FFD600] border-[#FFD600]/30 bg-[#FFD600]/10">
                            Revisions Pending
                          </span>
                        )}
                      </div>
                      <h4 className="font-heading text-lg font-bold text-white mb-2">{sub.title}</h4>
                      <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed mb-3">{sub.content}</p>

                      {sub.cover_image && (
                        <div className="text-xs text-[#00FFA3] flex items-center gap-1.5 mb-3">
                          <span>📷 Media Attached</span>
                        </div>
                      )}

                      {sub.editorial_notes && (
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#FFD600] mb-3">
                          <strong>Previous Note:</strong> {sub.editorial_notes}
                        </div>
                      )}

                      <button
                        onClick={() => { setViewingSub(sub); setRevisionNotes(sub.editorial_notes || ''); }}
                        className="text-xs text-[#2962FF] hover:underline font-semibold flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Full Article Preview & Revision Desk
                      </button>
                    </div>

                    <div className="flex flex-wrap lg:flex-col items-stretch gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(sub.id)}
                        disabled={actionLoading}
                        className="btn-primary text-xs py-2.5 px-4 shadow-sm"
                        data-testid={`approve-${sub.id}`}
                      >
                        Approve & Publish (+50 XP)
                      </button>
                      <button
                        onClick={() => { setViewingSub(sub); setShowRevisionModal(true); setRevisionNotes(sub.editorial_notes || ''); }}
                        className="glass text-xs py-2 px-3 text-[#FFD600] border-[#FFD600]/30 hover:bg-[#FFD600]/10 rounded-xl font-semibold transition"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        disabled={actionLoading}
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

      {/* 3. OPPORTUNITIES MANAGEMENT */}
      {tab === 'opportunities' && isStaff && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Youth Opportunities Desk</h3>
              <p className="text-xs text-[#A0A0AB]">Post fellowships, internships, grants, and writing contests for young journalists.</p>
            </div>
            <button
              onClick={() => setShowOppModal(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 self-start sm:self-auto"
            >
              <Plus size={16} /> Post New Opportunity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oppList.map(opp => (
              <div key={opp.id} className="glass rounded-2xl p-5 border border-white/10 flex flex-col justify-between card-interactive">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="badge-pill uppercase text-[10px] font-bold text-[#00FFA3] border-[#00FFA3]/30 bg-[#00FFA3]/10">
                      {opp.type}
                    </span>
                    <button
                      onClick={() => handleDeleteOpp(opp.id)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition"
                      title="Delete opportunity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 className="font-heading text-base font-bold text-white mb-1">{opp.title}</h4>
                  <p className="text-xs text-[#A0A0AB] mb-3">{opp.organization}</p>
                  <p className="text-xs text-[#D4D4D8] line-clamp-2 leading-relaxed mb-4">{opp.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  {opp.deadline ? (
                    <span className="text-[#FFD600] flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={12} /> {new Date(opp.deadline).toLocaleDateString()}
                    </span>
                  ) : <span className="text-[#71717A]">Rolling Deadline</span>}
                  {opp.link && (
                    <a
                      href={opp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00FFA3] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      Apply Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CURRICULUM & LEARNING HUB DESK */}
      {tab === 'resources' && isStaff && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Learning Hub Curriculum Desk</h3>
              <p className="text-xs text-[#A0A0AB]">Publish guides, pitch deck templates, ethics mini-courses, and workshop toolkits.</p>
            </div>
            <button
              onClick={() => setShowResModal(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 self-start sm:self-auto"
            >
              <Plus size={16} /> Add Curriculum Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resList.map(res => (
              <div key={res.id} className="glass rounded-2xl p-5 border border-white/10 flex flex-col justify-between card-interactive">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="badge-pill uppercase text-[10px] font-bold text-[#2962FF] border-[#2962FF]/30 bg-[#2962FF]/10">
                      {res.type}
                    </span>
                    <button
                      onClick={() => handleDeleteRes(res.id)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition"
                      title="Delete resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h4 className="font-heading text-base font-bold text-white mb-1">{res.title}</h4>
                  <span className="text-[11px] text-[#71717A] block mb-2 font-mono">#{res.category}</span>
                  <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed mb-4">{res.description}</p>
                </div>
                {res.content_url && (
                  <div className="pt-3 border-t border-white/10">
                    <a
                      href={res.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00FFA3] hover:underline flex items-center gap-1 font-semibold"
                    >
                      Resource Attachment <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DIGITAL MAGAZINE ARCHIVES */}
      {tab === 'archives' && isStaff && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Digital Magazine Archives</h3>
              <p className="text-xs text-[#A0A0AB]">Publish seasonal anthologies and full PDF magazine issues of Young Gazette.</p>
            </div>
            <button
              onClick={() => setShowArchiveModal(true)}
              className="btn-primary flex items-center gap-2 text-xs py-2.5 px-4 self-start sm:self-auto"
            >
              <Plus size={16} /> Publish Magazine Issue
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {archiveList.map(a => (
              <div key={a.id} className="glass rounded-2xl overflow-hidden border border-white/10 card-interactive flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full bg-black/40 overflow-hidden relative">
                    {a.cover_image ? (
                      <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-4xl">📰</div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="badge-pill bg-black/70 backdrop-blur-md text-[10px] font-bold text-[#00FFA3]">
                        Issue #{a.issue_number}
                      </span>
                      <button
                        onClick={() => handleDeleteArchive(a.id)}
                        className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white hover:text-[#FF3B30] transition"
                        title="Delete issue"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-[#FFD600] font-mono font-bold block mb-1">{a.season}</span>
                    <h4 className="font-heading text-base font-bold text-white mb-2">{a.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#71717A]">
                      <span>{a.pages || 28} Pages</span>
                      <span>•</span>
                      <span>{a.articles_count || 10} Featured Stories</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <a
                    href={a.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Download Digital Issue (PDF)
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. READER INBOX & SUBSCRIBERS */}
      {tab === 'inbox' && isStaff && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Reader & Editorial Desk Inbox</h3>
              <p className="text-xs text-[#A0A0AB]">Inquiries, tips, questions, and newsletter subscriptions.</p>
            </div>
            <div className="flex items-center gap-2 glass p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setInboxTab('inquiries')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  inboxTab === 'inquiries' ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'text-[#A0A0AB] hover:text-white'
                }`}
              >
                Inquiries ({inquiries.length})
              </button>
              <button
                onClick={() => setInboxTab('subscribers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  inboxTab === 'subscribers' ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'text-[#A0A0AB] hover:text-white'
                }`}
              >
                Subscribers ({subscribers.length})
              </button>
            </div>
          </div>

          {inboxTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-[#71717A]">
                  No incoming reader inquiries yet.
                </div>
              ) : (
                inquiries.map((inq, i) => (
                  <div key={inq.id || i} className="glass rounded-2xl p-5 border border-white/10 card-interactive">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="badge-pill text-[10px] uppercase font-bold text-[#00FFA3]">
                          {inq.category || 'general'}
                        </span>
                        <h4 className="font-heading text-base font-bold text-white">{inq.subject}</h4>
                      </div>
                      <span className="text-[11px] text-[#71717A] font-mono">
                        {inq.created_at ? new Date(inq.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0AB] mb-3">
                      From: <strong className="text-white">{inq.name}</strong> ({inq.email})
                    </p>
                    <p className="text-xs text-[#D4D4D8] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {inboxTab === 'subscribers' && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h4 className="font-heading text-base font-bold text-white mb-4">
                Verified Newsletter Subscribers ({subscribers.length})
              </h4>
              <div className="divide-y divide-white/5">
                {subscribers.map((sub, i) => (
                  <div key={sub.id || i} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-white">{sub.email}</div>
                      <div className="text-[11px] text-[#71717A]">
                        {sub.name ? `${sub.name} • ` : ''}{sub.school || 'Junior Journalist Reader'}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#71717A] font-mono">
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. COMMUNITY & ROLES DIRECTORY */}
      {tab === 'users' && isAdmin && (
        <div data-testid="users-panel" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                Newsroom Reporters & Role Delegation ({allUsers.length})
              </h3>
              <p className="text-xs text-[#A0A0AB]">Assign roles, promote editorial staff, and manage reporter permissions.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 w-full sm:w-72">
              <Search size={16} className="text-[#71717A]" />
              <input
                type="text"
                placeholder="Search reporter, school..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-[#71717A] focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u, i) => (
              <div key={u.id} className="glass rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10" data-testid={`user-row-${i}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FFA3]/20 flex items-center justify-center shrink-0 border border-[#00FFA3]/20">
                    <span className="font-bold text-sm text-[#00FFA3]">{u.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{u.name}</h4>
                    <p className="text-[11px] text-[#71717A]">
                      {u.email} • {u.school || 'Junior Journalist'} • <strong className="text-[#00FFA3]">{u.lifetime_xp || 0} XP</strong>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs text-[#71717A]">Permission Role:</span>
                  <select
                    value={u.role || 'member'}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className="input-dark text-xs py-1.5 px-3 rounded-lg"
                    data-testid={`role-select-${i}`}
                  >
                    <option value="member">Student Member</option>
                    <option value="contributor">Verified Contributor</option>
                    <option value="editor">Section Editor</option>
                    <option value="manager">Campus Lead / Manager</option>
                    <option value="admin">Editor-in-Chief / Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. BROADCAST ANNOUNCEMENT */}
      {tab === 'broadcast' && isAdmin && (
        <div className="glass rounded-3xl p-6 sm:p-8 max-w-2xl border border-white/10" data-testid="broadcast-panel">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/15 flex items-center justify-center text-[#00FFA3] border border-[#00FFA3]/30">
              <Megaphone size={20} />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">Broadcast Instant Alert</h3>
              <p className="text-xs text-[#A0A0AB]">Deliver instant notification bell alerts to all reporters or specific roles.</p>
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
                <option value="editor">Editors Only</option>
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
                placeholder="e.g. /opportunities or /explore"
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

      {/* ARTICLE PREVIEW MODAL */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/20 animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setViewingSub(null); setShowRevisionModal(false); }}
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

            {/* Revision Request Form */}
            {showRevisionModal ? (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#FFD600]/30 mb-6">
                <h4 className="text-xs font-bold text-[#FFD600] uppercase tracking-wider mb-2">
                  Editorial Revision Guidance
                </h4>
                <textarea
                  rows={3}
                  placeholder="Explain what the reporter needs to improve (e.g. strengthen thesis, add local quotes, fix citations)..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  className="input-dark w-full text-xs mb-3"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRequestRevision(viewingSub.id)}
                    disabled={actionLoading}
                    className="btn-primary text-xs py-2 px-4 bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
                  >
                    Send Revisions to Author
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApprove(viewingSub.id)}
                    disabled={actionLoading}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Approve & Publish (+50 XP)
                  </button>
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="glass text-xs py-2 px-3 text-[#FFD600] border-[#FFD600]/30 hover:bg-[#FFD600]/10 rounded-xl font-semibold transition"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleReject(viewingSub.id)}
                    disabled={actionLoading}
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
            )}
          </div>
        </div>
      )}

      {/* CREATE OPPORTUNITY MODAL */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up relative">
            <button onClick={() => setShowOppModal(false)} className="absolute top-5 right-5 text-[#71717A] hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-heading text-xl font-bold text-white mb-4">Post New Youth Opportunity</h3>
            <form onSubmit={handleCreateOpp} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Investigative Fellowship 2026"
                  value={oppForm.title}
                  onChange={e => setOppForm({ ...oppForm, title: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Host Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pulitzer Center"
                    value={oppForm.organization}
                    onChange={e => setOppForm({ ...oppForm, organization: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Type</label>
                  <select
                    value={oppForm.type}
                    onChange={e => setOppForm({ ...oppForm, type: e.target.value })}
                    className="input-dark w-full text-xs"
                  >
                    <option value="internship">Internship</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="fellowship">Fellowship</option>
                    <option value="contest">Contest / Award</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={oppForm.deadline}
                    onChange={e => setOppForm({ ...oppForm, deadline: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Application Link / URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={oppForm.link}
                    onChange={e => setOppForm({ ...oppForm, link: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Description & Eligibility</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details on eligibility, stipend, mentorship..."
                  value={oppForm.description}
                  onChange={e => setOppForm({ ...oppForm, description: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-xs py-2.5 flex-1">
                  Publish Opportunity
                </button>
                <button type="button" onClick={() => setShowOppModal(false)} className="btn-ghost text-xs py-2.5 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RESOURCE MODAL */}
      {showResModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up relative">
            <button onClick={() => setShowResModal(false)} className="absolute top-5 right-5 text-[#71717A] hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-heading text-xl font-bold text-white mb-4">Add Curriculum / Learning Item</h3>
            <form onSubmit={handleCreateRes} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Art of the Hard News Lead"
                  value={resForm.title}
                  onChange={e => setResForm({ ...resForm, title: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Category</label>
                  <select
                    value={resForm.category}
                    onChange={e => setResForm({ ...resForm, category: e.target.value })}
                    className="input-dark w-full text-xs"
                  >
                    <option value="writing">Writing & Pitching</option>
                    <option value="photography">Photojournalism</option>
                    <option value="tools">Digital Tools & Fact Checking</option>
                    <option value="journalism">Investigative Journalism</option>
                    <option value="ethics">Media Ethics & Law</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Format</label>
                  <select
                    value={resForm.type}
                    onChange={e => setResForm({ ...resForm, type: e.target.value })}
                    className="input-dark w-full text-xs"
                  >
                    <option value="guide">Guide / Article</option>
                    <option value="webinar">Webinar / Video</option>
                    <option value="template">Template / Worksheet</option>
                    <option value="prompt">Writing Prompt</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Resource / PDF / Video Link</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={resForm.content_url}
                  onChange={e => setResForm({ ...resForm, content_url: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Curriculum Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key takeaways and concepts covered..."
                  value={resForm.description}
                  onChange={e => setResForm({ ...resForm, description: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-xs py-2.5 flex-1">
                  Add to Learning Hub
                </button>
                <button type="button" onClick={() => setShowResModal(false)} className="btn-ghost text-xs py-2.5 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PUBLISH MAGAZINE ISSUE MODAL */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up relative">
            <button onClick={() => setShowArchiveModal(false)} className="absolute top-5 right-5 text-[#71717A] hover:text-white">
              <X size={20} />
            </button>
            <h3 className="font-heading text-xl font-bold text-white mb-4">Publish Young Gazette Digital Issue</h3>
            <form onSubmit={handleCreateArchive} className="space-y-4">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Young Gazette — Issue #04: The Global Future Edition"
                  value={archiveForm.title}
                  onChange={e => setArchiveForm({ ...archiveForm, title: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Issue Number</label>
                  <input
                    type="number"
                    required
                    value={archiveForm.issue_number}
                    onChange={e => setArchiveForm({ ...archiveForm, issue_number: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Season / Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer 2026"
                    value={archiveForm.season}
                    onChange={e => setArchiveForm({ ...archiveForm, season: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={archiveForm.cover_image}
                  onChange={e => setArchiveForm({ ...archiveForm, cover_image: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">PDF Download URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={archiveForm.pdf_url}
                  onChange={e => setArchiveForm({ ...archiveForm, pdf_url: e.target.value })}
                  className="input-dark w-full text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Page Count</label>
                  <input
                    type="number"
                    value={archiveForm.pages}
                    onChange={e => setArchiveForm({ ...archiveForm, pages: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Articles Count</label>
                  <input
                    type="number"
                    value={archiveForm.articles_count}
                    onChange={e => setArchiveForm({ ...archiveForm, articles_count: e.target.value })}
                    className="input-dark w-full text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary text-xs py-2.5 flex-1">
                  Publish to Archives
                </button>
                <button type="button" onClick={() => setShowArchiveModal(false)} className="btn-ghost text-xs py-2.5 px-4">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
