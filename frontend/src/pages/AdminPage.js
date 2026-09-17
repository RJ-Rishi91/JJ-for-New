import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import Logo from '../components/common/Logo';
import {
  Shield,
  Megaphone,
  Send,
  Mail,
  Globe,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Plus,
  Briefcase,
  BookOpen,
  Download,
  Search,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Eye,
  LogOut,
  Radio,
  Newspaper,
  Layers,
  Inbox,
  UserCheck
} from 'lucide-react';

export default function AdminPage() {
  const { user, login, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('announcements');

  // Stats & core data
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [oppList, setOppList] = useState([]);
  const [resList, setResList] = useState([]);
  const [archiveList, setArchiveList] = useState([]);

  // Login form state (if not logged in)
  const [loginEmail, setLoginEmail] = useState('editor@juniorjournalist.org');
  const [loginPassword, setLoginPassword] = useState('EditorPass123!');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Announcements Desk State
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    category: 'general',
    target_audience: 'all',
    send_web: true,
    send_email: true,
    link: ''
  });
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  // Submissions Moderation State
  const [viewingSub, setViewingSub] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Opportunities Modal
  const [showOppModal, setShowOppModal] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    organization: '',
    type: 'internship',
    deadline: '',
    link: '',
    description: ''
  });

  // Resources Modal
  const [showResModal, setShowResModal] = useState(false);
  const [resForm, setResForm] = useState({
    title: '',
    category: 'writing',
    type: 'guide',
    content_url: '',
    description: ''
  });

  // Magazine Archives Modal
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

  // User search query
  const [userSearch, setUserSearch] = useState('');

  const isStaff = user && ['admin', 'manager', 'editor'].includes(user.role);

  // Load all editorial data
  const fetchEditorialData = async () => {
    if (!isStaff) return;
    try {
      const [statsRes, subsRes, oppsRes, resRes, archRes, inqRes, annRes] = await Promise.allSettled([
        dashApi.stats(),
        subApi.list({ status: 'pending' }),
        oppApi.list({}),
        resApi.list({}),
        archiveApi.list(),
        adminApi.inquiries(),
        adminApi.announcements ? adminApi.announcements.list() : Promise.resolve({ data: [] })
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (subsRes.status === 'fulfilled') setPendingSubs(subsRes.value.data || []);
      if (oppsRes.status === 'fulfilled') setOppList(oppsRes.value.data || []);
      if (resRes.status === 'fulfilled') setResList(resRes.value.data || []);
      if (archRes.status === 'fulfilled') setArchiveList(archRes.value.data || []);
      if (inqRes.status === 'fulfilled') setInquiries(inqRes.value.data || []);
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data || []);

      if (['admin', 'manager'].includes(user.role)) {
        const [usersRes, subsListRes] = await Promise.allSettled([
          usersApi.listAll(),
          adminApi.subscribers()
        ]);
        if (usersRes.status === 'fulfilled') setAllUsers(usersRes.value.data || []);
        if (subsListRes.status === 'fulfilled') setSubscribers(subsListRes.value.data || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isStaff) {
      fetchEditorialData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle staff login
  const handleStaffLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Invalid administrative credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle create announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      alert("Please provide both a title and message for the announcement.");
      return;
    }
    if (!announcementForm.send_web && !announcementForm.send_email) {
      alert("Please select at least one distribution channel (Website Alert or Email Notification).");
      return;
    }

    setAnnouncementSending(true);
    try {
      const res = await adminApi.announcements.create(announcementForm);
      setAnnouncementSuccess(res.data.message || "Announcement broadcasted successfully!");
      if (res.data.announcement) {
        setAnnouncements([res.data.announcement, ...announcements]);
      }
      setAnnouncementForm({
        title: '',
        message: '',
        category: 'general',
        target_audience: 'all',
        send_web: true,
        send_email: true,
        link: ''
      });
      setTimeout(() => setAnnouncementSuccess(''), 6000);
    } catch (err) {
      alert("Failed to publish announcement: " + (err.response?.data?.detail || err.message));
    } finally {
      setAnnouncementSending(false);
    }
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement from history?")) return;
    try {
      await adminApi.announcements.delete(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.detail || err.message));
    }
  };

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
      setShowRejectModal(false);
      setRejectNotes('');
    } catch (err) {
      alert("Error rejecting submission: " + (err.response?.data?.detail || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersApi.updateRole(userId, newRole);
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  // Opportunity create
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

  const handleDeleteOpp = async (id) => {
    if (!window.confirm("Delete this opportunity?")) return;
    try {
      await oppApi.delete(id);
      setOppList(oppList.filter(o => o.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete opportunity");
    }
  };

  // Resource create
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

  const handleDeleteRes = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await resApi.delete(id);
      setResList(resList.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete resource");
    }
  };

  // Magazine Archive create
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

  const handleDeleteArchive = async (id) => {
    if (!window.confirm("Remove this magazine issue?")) return;
    try {
      await archiveApi.delete(id);
      setArchiveList(archiveList.filter(a => a.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete issue");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070412] text-white flex items-center justify-center">
        <div className="skeleton-pulse h-16 w-52 rounded-2xl" />
      </div>
    );
  }

  // 1. Unauthenticated or Non-Staff State: Direct Login Screen
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#070412] text-white flex flex-col justify-center items-center px-4 py-12 relative z-20">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#ff2d55]/15 border border-[#ff2d55]/30 flex items-center justify-center text-[#ff2d55]">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight">Newsroom HQ Staff Access</h2>
              <p className="text-xs text-[#A0A0AB]">Editorial Command & Publishing Console</p>
            </div>
          </div>

          {/* Quick Demo One-Click Sign In */}
          <div className="mb-6 p-4 rounded-2xl bg-[#7000ff]/15 border border-[#7000ff]/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#ff2d55]" /> Demo Managing Editor
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#7000ff]/30 text-[#00f2fe] font-bold">
                Clearance Level 1
              </span>
            </div>
            <p className="text-[11px] text-[#A0A0AB] mb-3 leading-relaxed">
              Log in as Rushal Sharma (Managing Editor) to review dispatches, post announcements, and manage newsroom desks.
            </p>
            <button
              type="button"
              onClick={() => {
                setLoginEmail('editor@juniorjournalist.org');
                setLoginPassword('EditorPass123!');
                setTimeout(() => handleStaffLogin(), 50);
              }}
              disabled={loginLoading}
              className="btn-primary w-full text-xs py-2.5 rounded-xl font-semibold"
            >
              {loginLoading ? 'Authenticating...' : 'Quick Login as Managing Editor'}
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} /> {loginError}
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[#A0A0AB] mb-1 font-medium">Staff Email or Username</label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="input-dark text-xs py-2.5 px-3.5"
                placeholder="editor@juniorjournalist.org or jj_admin"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A0A0AB] mb-1 font-medium">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="input-dark text-xs py-2.5 px-3.5"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-ghost w-full text-xs py-2.5 rounded-xl text-white font-semibold"
            >
              {loginLoading ? 'Signing In...' : 'Sign In to Editorial Console'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link to="/" className="text-xs text-[#A0A0AB] hover:text-white transition inline-flex items-center gap-1.5">
              <ArrowLeft size={13} /> Back to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Work tabs specification
  const tabs = [
    { id: 'announcements', label: 'Announcements Desk', icon: <Megaphone size={16} />, badge: announcements.length },
    { id: 'moderation', label: 'Editorial Review', icon: <FileText size={16} />, badge: pendingSubs.length, alert: pendingSubs.length > 0 },
    { id: 'opportunities', label: 'Opportunities', icon: <Briefcase size={16} />, badge: oppList.length },
    { id: 'resources', label: 'Curriculum Hub', icon: <BookOpen size={16} />, badge: resList.length },
    { id: 'archives', label: 'Magazine Editions', icon: <Newspaper size={16} />, badge: archiveList.length },
    { id: 'inbox', label: 'Reader Inquiries', icon: <Inbox size={16} />, badge: inquiries.length },
    { id: 'users', label: 'Reporters Directory', icon: <Users size={16} />, badge: allUsers.length },
    { id: 'subscribers', label: 'Subscribers', icon: <Mail size={16} />, badge: subscribers.length },
  ];

  const filteredUsers = allUsers.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.school?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070412] text-white flex flex-col relative z-20" data-testid="admin-panel">
      {/* ─── WORK-CENTRIC DEDICATED ADMIN TOPBAR (NO PUBLIC NAV, NO XP) ─── */}
      <header className="sticky top-0 z-40 bg-[#0c0824]/95 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Editorial Status */}
          <div className="flex items-center gap-3.5">
            <Logo className="h-7 w-auto" />
            <div className="h-5 w-[1px] bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#ff2d55]/20 border border-[#ff2d55]/40 text-[#ff2d55] font-mono text-[11px] font-bold uppercase tracking-wider">
                Newsroom HQ Desk
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#00f2fe] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse" /> Live Operational
              </span>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-2">
              <span className="text-[#A0A0AB]">Pending Dispatches:</span>
              <span className={`font-bold ${pendingSubs.length > 0 ? 'text-[#ff2d55]' : 'text-white'}`}>
                {pendingSubs.length}
              </span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-2">
              <span className="text-[#A0A0AB]">Reader Inquiries:</span>
              <span className="font-bold text-[#00f2fe]">{inquiries.length}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 flex items-center gap-2">
              <span className="text-[#A0A0AB]">Reporters:</span>
              <span className="font-bold text-white">{allUsers.length || stats?.total_members || 7}</span>
            </div>
          </div>

          {/* Admin User Card (NO XP DISPLAY) & Return to Site */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition"
              title="View Public Site"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Public Site</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2d55] to-[#7000ff] flex items-center justify-center font-bold text-xs shadow-md">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[140px]">{user.name}</div>
                <div className="text-[10px] font-mono text-[#00f2fe] uppercase font-bold tracking-wider">{user.role}</div>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#ff2d55] hover:bg-white/[0.06] transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── WORK-CENTRIC DESK TABS ─── */}
      <div className="bg-[#0c0824]/60 border-b border-white/[0.08] px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-[1600px] mx-auto flex items-center gap-1.5 py-2">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff2d55] to-[#7000ff] text-white shadow-lg shadow-[#ff2d55]/20'
                    : 'text-[#A0A0AB] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-black/30 text-white'
                      : t.alert
                      ? 'bg-[#ff2d55]/20 text-[#ff2d55] border border-[#ff2d55]/40'
                      : 'bg-white/10 text-[#A0A0AB]'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── DESK WORKSPACE CONTENT ─── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-8">
        {/* 1. ANNOUNCEMENTS DESK (WEB + EMAIL) */}
        {activeTab === 'announcements' && (
          <div className="space-y-8 animate-fade-in" data-testid="announcements-desk">
            {/* Header / Intro */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight flex items-center gap-2.5">
                  <Megaphone className="text-[#ff2d55]" size={24} /> Newsroom Broadcast & Announcement Window
                </h2>
                <p className="text-xs text-[#A0A0AB] mt-1">
                  Compose editorial dispatches, urgent newsroom bulletins, and scholarship alerts. Broadcast directly to on-site user notifications and dispatch via email.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="glass px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
                  <span className="text-[#A0A0AB]">Total Broadcasts: </span>
                  <span className="text-[#00f2fe] font-bold">{announcements.length}</span>
                </div>
              </div>
            </div>

            {/* Compose Grid: Compose Form (Left) & Real-time Previews (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Window */}
              <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-[#ff2d55] animate-pulse" />
                    <h3 className="font-heading text-base font-bold text-white">Compose New Announcement</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/30 px-2 py-0.5 rounded-full font-bold">
                    Multi-Channel Dispatch
                  </span>
                </div>

                {announcementSuccess && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>{announcementSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  {/* Title / Headline */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Announcement Title / Headline <span className="text-[#ff2d55]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fall 2026 Investigative Fellowship Recipients Announced"
                      value={announcementForm.title}
                      onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="input-dark text-sm py-2.5 px-4 font-medium"
                    />
                  </div>

                  {/* Category & Target Audience Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1.5">Category</label>
                      <select
                        value={announcementForm.category}
                        onChange={e => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                        className="input-dark text-xs py-2 px-3"
                      >
                        <option value="general" className="bg-[#111827] text-white">📢 General Update</option>
                        <option value="urgent" className="bg-[#111827] text-white">🚨 Breaking / Urgent Alert</option>
                        <option value="editorial" className="bg-[#111827] text-white">✍️ Editorial Guideline</option>
                        <option value="event" className="bg-[#111827] text-white">🗓️ Masterclass / Event</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white mb-1.5">Target Audience</label>
                      <select
                        value={announcementForm.target_audience}
                        onChange={e => setAnnouncementForm({ ...announcementForm, target_audience: e.target.value })}
                        className="input-dark text-xs py-2 px-3"
                      >
                        <option value="all" className="bg-[#111827] text-white">🌐 All Members & Subscribers</option>
                        <option value="writers" className="bg-[#111827] text-white">✍️ Student Reporters & Writers</option>
                        <option value="editors" className="bg-[#111827] text-white">🛡️ Editorial Board Only</option>
                        <option value="subscribers" className="bg-[#111827] text-white">✉️ Newsletter Subscribers Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Distribution Channels Toggles (Website & Email) */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <label className="block text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Distribution Channels (Select One or Both)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Web Checkbox */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          announcementForm.send_web
                            ? 'bg-[#7000ff]/15 border-[#7000ff]/40 text-white'
                            : 'bg-white/[0.02] border-white/10 text-[#A0A0AB]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={announcementForm.send_web}
                          onChange={e => setAnnouncementForm({ ...announcementForm, send_web: e.target.checked })}
                          className="mt-0.5 accent-[#7000ff] rounded"
                        />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <Globe size={13} className="text-[#00f2fe]" /> Website In-App Broadcast
                          </div>
                          <p className="text-[11px] text-[#A0A0AB] mt-0.5 leading-snug">
                            Alerts on-site users with real-time notification bell badge and feed item.
                          </p>
                        </div>
                      </label>

                      {/* Email Checkbox */}
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          announcementForm.send_email
                            ? 'bg-[#ff2d55]/15 border-[#ff2d55]/40 text-white'
                            : 'bg-white/[0.02] border-white/10 text-[#A0A0AB]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={announcementForm.send_email}
                          onChange={e => setAnnouncementForm({ ...announcementForm, send_email: e.target.checked })}
                          className="mt-0.5 accent-[#ff2d55] rounded"
                        />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <Mail size={13} className="text-[#ff2d55]" /> Email Notification Dispatch
                          </div>
                          <p className="text-[11px] text-[#A0A0AB] mt-0.5 leading-snug">
                            Dispatches direct email notification to verified reader and staff inboxes.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Destination Link */}
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Call to Action Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /explore, /opportunities, or https://..."
                      value={announcementForm.link}
                      onChange={e => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                      className="input-dark text-xs py-2 px-3 font-mono"
                    />
                  </div>

                  {/* Message Content */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-white">
                        Announcement Body / Message <span className="text-[#ff2d55]">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-[#A0A0AB]">
                        {announcementForm.message.length} chars
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your announcement or briefing notes here. Explain the details, deadlines, guidelines, or instructions clearly for your newsroom readership..."
                      value={announcementForm.message}
                      onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                      className="input-dark text-xs p-3 leading-relaxed rounded-2xl"
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-[#A0A0AB] flex items-center gap-2">
                      <span>Targeting:</span>
                      <span className="text-white font-mono font-bold">
                        {announcementForm.target_audience.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>Channels:</span>
                      <span className="text-[#00f2fe] font-mono font-semibold">
                        {[announcementForm.send_web && 'Web', announcementForm.send_email && 'Email'].filter(Boolean).join(' + ') || 'None'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={announcementSending}
                      className="btn-primary py-2.5 px-6 rounded-full text-xs font-bold inline-flex items-center justify-center gap-2"
                    >
                      <Send size={13} />
                      {announcementSending ? 'Broadcasting...' : 'Publish Announcement'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Dispatch Preview Window */}
              <div className="lg:col-span-5 space-y-6">
                {/* Web Preview Card */}
                <div className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#A0A0AB] pb-2 border-b border-white/10">
                    <span className="flex items-center gap-1.5 text-white font-semibold">
                      <Globe size={13} className="text-[#00f2fe]" /> Live On-Site Notification Preview
                    </span>
                    <span className="text-[10px] text-[#00f2fe]">User Navbar</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff2d55] shrink-0 shadow-[0_0_6px_#ff2d55]" />
                        <h4 className="font-heading text-xs font-bold text-white line-clamp-1">
                          {announcementForm.title || "Announcement Headline Preview"}
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-[#A0A0AB] shrink-0">Just now</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mt-1">
                      {announcementForm.message || "Your announcement message body will render here for on-site student reporters and readers."}
                    </p>
                    {announcementForm.link && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#00f2fe] font-medium mt-1.5">
                        View link <ExternalLink size={10} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Dispatch Preview Card */}
                <div className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#A0A0AB] pb-2 border-b border-white/10">
                    <span className="flex items-center gap-1.5 text-white font-semibold">
                      <Mail size={13} className="text-[#ff2d55]" /> Email Dispatch Preview
                    </span>
                    <span className="text-[10px] text-[#ff2d55]">Inbox HTML</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e0a29] border border-white/15 space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#A0A0AB] pb-2 border-b border-white/10">
                      <span>From: newsroom@juniorjournalist.org</span>
                      <span>To: [Recipient List]</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#ff2d55]/20 text-[#ff2d55] font-bold">
                        {announcementForm.category.toUpperCase()} NOTICE
                      </span>
                      <h4 className="font-heading text-sm font-bold text-white mt-1.5">
                        {announcementForm.title || "Headline will appear here"}
                      </h4>
                    </div>
                    <p className="text-xs text-[#A0A0AB] leading-relaxed whitespace-pre-line">
                      {announcementForm.message || "Full message content formatted for clean delivery into student journalist and reader inboxes across desktop and mobile devices."}
                    </p>
                    {announcementForm.link && (
                      <div className="pt-2">
                        <span className="btn-primary text-[10px] py-1 px-3 rounded-full inline-block">
                          Read More & Respond →
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-white/10 text-[9px] text-slate-500 font-mono">
                      Sent by Junior Journalist Editorial Command • Young Gazette Youth Network
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcement Dispatch History Table */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading text-base font-bold text-white">Announcement Dispatch History</h3>
                  <p className="text-xs text-[#A0A0AB]">Archive of all notifications and broadcasts published from this desk.</p>
                </div>
              </div>

              {announcements.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/15">
                  <Megaphone size={32} className="mx-auto text-[#A0A0AB] mb-2 opacity-50" />
                  <p className="text-xs text-[#A0A0AB]">No past announcements found. Use the compose window above to send your first broadcast.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#A0A0AB] font-mono text-[11px]">
                        <th className="pb-3 font-semibold">Title / Headline</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Audience</th>
                        <th className="pb-3 font-semibold">Channels & Deliveries</th>
                        <th className="pb-3 font-semibold">Published By</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {announcements.map(ann => (
                        <tr key={ann.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3.5 pr-4 max-w-xs">
                            <div className="font-semibold text-white truncate">{ann.title}</div>
                            <div className="text-[11px] text-[#A0A0AB] line-clamp-1 mt-0.5">{ann.message}</div>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span className={`badge-pill text-[10px] ${
                              ann.category === 'urgent' ? 'border-[#ff2d55]/40 text-[#ff2d55] bg-[#ff2d55]/10' :
                              ann.category === 'editorial' ? 'border-[#7000ff]/40 text-[#7000ff] bg-[#7000ff]/10' :
                              'border-[#00f2fe]/40 text-[#00f2fe] bg-[#00f2fe]/10'
                            }`}>
                              {ann.category}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-[11px] text-slate-300">
                            {ann.target_audience || 'All'}
                          </td>
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              {ann.send_web && (
                                <span className="px-2 py-0.5 rounded-full bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30 font-bold flex items-center gap-1">
                                  <Globe size={10} /> Web ({ann.web_recipients_count || 'Sent'})
                                </span>
                              )}
                              {ann.send_email && (
                                <span className="px-2 py-0.5 rounded-full bg-[#ff2d55]/15 text-[#ff2d55] border border-[#ff2d55]/30 font-bold flex items-center gap-1">
                                  <Mail size={10} /> Email ({ann.email_recipients_count || 'Sent'})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 text-[11px] text-[#A0A0AB]">
                            {ann.created_by_name || 'Admin'}
                          </td>
                          <td className="py-3.5 pr-4 font-mono text-[11px] text-[#A0A0AB] whitespace-nowrap">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#ff2d55] hover:bg-white/[0.06] transition"
                              title="Delete announcement"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. EDITORIAL QUEUE */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-fade-in" data-testid="moderation-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Editorial Review Queue</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Student submissions awaiting review, fact-check, or revision notes.</p>
              </div>
              <span className="badge-pill font-mono text-xs">{pendingSubs.length} pending</span>
            </div>

            {pendingSubs.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
                <CheckCircle2 size={42} className="mx-auto text-emerald-400 mb-3" />
                <h3 className="font-heading text-lg font-bold text-white">Editorial Queue Clear!</h3>
                <p className="text-xs text-[#A0A0AB] mt-1">All student submissions have been reviewed and dispatched.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingSubs.map(sub => (
                  <div key={sub.id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="badge-pill text-[10px]">{sub.type}</span>
                        <span className="text-[10px] font-mono text-[#A0A0AB]">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-heading text-base font-bold text-white mb-1.5">{sub.title}</h3>
                      <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed mb-4">{sub.content}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs text-[#A0A0AB]">By <strong className="text-white">{sub.author_name}</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingSub(sub)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-white transition flex items-center gap-1"
                        >
                          <Eye size={13} /> Review Full
                        </button>
                        <button
                          onClick={() => handleApprove(sub.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. OPPORTUNITIES DESK */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6 animate-fade-in" data-testid="opportunities-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Opportunities Desk</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Manage youth journalism fellowships, internships, and grants.</p>
              </div>
              <button
                onClick={() => setShowOppModal(true)}
                className="btn-primary py-2 px-4 text-xs rounded-full font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Opportunity
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {oppList.map(opp => (
                <div key={opp.id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-pill text-[10px]">{opp.type}</span>
                      <button onClick={() => handleDeleteOpp(opp.id)} className="text-[#A0A0AB] hover:text-[#ff2d55]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-heading text-sm font-bold text-white mb-1">{opp.title}</h3>
                    <p className="text-xs text-[#00f2fe] font-medium mb-2">{opp.organization}</p>
                    <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed">{opp.description}</p>
                  </div>
                  {opp.deadline && (
                    <div className="pt-3 mt-3 border-t border-white/10 text-[11px] font-mono text-amber-400">
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CURRICULUM HUB */}
        {activeTab === 'resources' && (
          <div className="space-y-6 animate-fade-in" data-testid="resources-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Curriculum & Skill Hub Desk</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Manage learning modules, pitch guides, and reporting masterclasses.</p>
              </div>
              <button
                onClick={() => setShowResModal(true)}
                className="btn-primary py-2 px-4 text-xs rounded-full font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Learning Resource
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resList.map(res => (
                <div key={res.id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-pill text-[10px]">{res.category}</span>
                      <button onClick={() => handleDeleteRes(res.id)} className="text-[#A0A0AB] hover:text-[#ff2d55]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-heading text-sm font-bold text-white mb-1.5">{res.title}</h3>
                    <p className="text-xs text-[#A0A0AB] line-clamp-3 leading-relaxed">{res.description}</p>
                  </div>
                  {res.content_url && (
                    <div className="pt-3 mt-3 border-t border-white/10">
                      <a href={res.content_url} target="_blank" rel="noreferrer" className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1">
                        View Resource <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MAGAZINE EDITIONS */}
        {activeTab === 'archives' && (
          <div className="space-y-6 animate-fade-in" data-testid="archives-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Digital Magazine Editions Desk</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Publish and archive quarterly print-replica PDF magazine editions.</p>
              </div>
              <button
                onClick={() => setShowArchiveModal(true)}
                className="btn-primary py-2 px-4 text-xs rounded-full font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Publish New Edition
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {archiveList.map(arch => (
                <div key={arch.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
                  <div className="h-44 bg-[#110e2e] relative overflow-hidden">
                    {arch.cover_image ? (
                      <img src={arch.cover_image} alt={arch.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A0A0AB]">
                        <Newspaper size={36} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="badge-pill bg-black/70 text-xs font-mono">{arch.season}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white mb-1">Issue #{arch.issue_number}: {arch.title}</h3>
                      <p className="text-xs font-mono text-[#A0A0AB]">{arch.articles_count || 10} Dispatches • {arch.pages || 28} Pages</p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                      <a href={arch.pdf_url || '#'} target="_blank" rel="noreferrer" className="text-xs text-[#00f2fe] flex items-center gap-1 hover:underline">
                        <Download size={12} /> View PDF
                      </a>
                      <button onClick={() => handleDeleteArchive(arch.id)} className="text-[#A0A0AB] hover:text-[#ff2d55]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. READER INBOX & TIPS */}
        {activeTab === 'inbox' && (
          <div className="space-y-6 animate-fade-in" data-testid="inbox-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Reader Inquiries & Story Tips</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Confidential story tips, campus chapter requests, and fact-checking feedback.</p>
              </div>
              <span className="badge-pill font-mono text-xs">{inquiries.length} inquiries</span>
            </div>

            {inquiries.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
                <Inbox size={42} className="mx-auto text-[#A0A0AB] mb-3 opacity-50" />
                <h3 className="font-heading text-base font-bold text-white">No Inquiries Found</h3>
                <p className="text-xs text-[#A0A0AB] mt-1">Messages from the public contact desk will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map(inq => (
                  <div key={inq.id} className="glass-card rounded-2xl p-5 border border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="badge-pill text-[10px] uppercase font-mono">{inq.category}</span>
                        <h4 className="font-heading text-sm font-bold text-white">{inq.subject}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-[#A0A0AB]">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0AB] leading-relaxed mb-3">{inq.message}</p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-300">From: <strong className="text-white">{inq.name}</strong> ({inq.email})</span>
                      <a href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}`} className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1 font-semibold">
                        <Mail size={12} /> Reply via Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. REPORTERS DIRECTORY & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in" data-testid="users-desk">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Reporters & Newsroom Staff Directory</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Manage staff roles, verify reporters, and grant editorial clearances.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0AB]" />
                <input
                  type="text"
                  placeholder="Search by name, email, school..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="input-dark text-xs pl-8 py-2 w-full"
                />
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/10 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[#A0A0AB] font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Reporter</th>
                    <th className="pb-3 font-semibold">School / Desk</th>
                    <th className="pb-3 font-semibold">Editorial Role</th>
                    <th className="pb-3 font-semibold">Lifetime XP</th>
                    <th className="pb-3 font-semibold text-right">Role Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] font-mono text-[#A0A0AB]">{u.email}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300">
                        {u.school || 'Independent Reporter'}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`badge-pill text-[10px] uppercase font-mono ${
                          ['admin', 'manager', 'editor'].includes(u.role)
                            ? 'border-[#00f2fe]/40 text-[#00f2fe] bg-[#00f2fe]/10'
                            : 'border-white/20 text-[#A0A0AB]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono font-bold text-slate-300">
                        {u.lifetime_xp || 0} XP
                      </td>
                      <td className="py-3.5 text-right">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="input-dark text-[11px] py-1 px-2.5 rounded-lg w-auto inline-block"
                        >
                          <option value="member" className="bg-[#111827]">Member</option>
                          <option value="reporter" className="bg-[#111827]">Reporter</option>
                          <option value="editor" className="bg-[#111827]">Editor</option>
                          <option value="manager" className="bg-[#111827]">Managing Editor</option>
                          <option value="admin" className="bg-[#111827]">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. NEWSLETTER SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6 animate-fade-in" data-testid="subscribers-desk">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight">Newsletter Subscriber Audience</h2>
                <p className="text-xs text-[#A0A0AB] mt-1">Weekly Gazette readership mailing list.</p>
              </div>
              <button
                onClick={() => {
                  const csv = "Email,SubscribedDate\n" + subscribers.map(s => `${s.email},${s.created_at || ''}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                }}
                className="btn-ghost py-2 px-4 text-xs rounded-full font-bold flex items-center gap-1.5 text-white"
              >
                <Download size={13} /> Export CSV ({subscribers.length})
              </button>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-white/10 shadow-xl">
              {subscribers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A0A0AB]">No newsletter subscribers found yet.</div>
              ) : (
                <div className="divide-y divide-white/[0.06] max-h-96 overflow-y-auto">
                  {subscribers.map((sub, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="font-mono text-white flex items-center gap-2">
                        <Mail size={13} className="text-[#ff2d55]" /> {sub.email}
                      </span>
                      <span className="text-[11px] font-mono text-[#A0A0AB]">
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ─── EDITORIAL ARTICLE REVIEW MODAL ─── */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-white/15 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => setViewingSub(null)}
              className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="badge-pill text-xs">{viewingSub.type}</span>
              <span className="badge-pill text-xs border-white/20">{viewingSub.category}</span>
            </div>

            <h2 className="font-heading text-2xl font-bold text-white mb-2">{viewingSub.title}</h2>
            <div className="text-xs text-[#A0A0AB] mb-6 flex items-center gap-3">
              <span>By <strong className="text-white">{viewingSub.author_name}</strong></span>
              <span>•</span>
              <span>Submitted {new Date(viewingSub.created_at).toLocaleDateString()}</span>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4 mb-8 bg-black/20 p-5 rounded-2xl border border-white/10">
              {viewingSub.content}
            </div>

            {/* Editorial Decision Actions */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5">
                  Editorial Feedback / Revision Notes for Author
                </label>
                <textarea
                  rows={3}
                  value={revisionNotes}
                  onChange={e => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Excellent reporting on the budget breakdown. Please clarify source quotes in paragraph 3 before final publication..."
                  className="input-dark text-xs p-3 leading-relaxed rounded-2xl"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <button
                  onClick={() => handleReject(viewingSub.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                >
                  Reject Story
                </button>
                <button
                  onClick={() => handleRequestRevision(viewingSub.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                >
                  Request Revision with Notes
                </button>
                <button
                  onClick={() => handleApprove(viewingSub.id, revisionNotes)}
                  disabled={actionLoading}
                  className="btn-primary px-6 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Approve & Publish Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE OPPORTUNITY MODAL ─── */}
      {showOppModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-white/15 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowOppModal(false)} className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Post Editorial Opportunity</h3>
            <form onSubmit={handleCreateOpp} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Investigative Reporting Summer Fellowship"
                  value={oppForm.title}
                  onChange={e => setOppForm({ ...oppForm, title: e.target.value })}
                  className="input-dark text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Host Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Young Gazette"
                    value={oppForm.organization}
                    onChange={e => setOppForm({ ...oppForm, organization: e.target.value })}
                    className="input-dark text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Type</label>
                  <select
                    value={oppForm.type}
                    onChange={e => setOppForm({ ...oppForm, type: e.target.value })}
                    className="input-dark text-xs"
                  >
                    <option value="internship" className="bg-[#111827]">Internship</option>
                    <option value="fellowship" className="bg-[#111827]">Fellowship</option>
                    <option value="scholarship" className="bg-[#111827]">Scholarship</option>
                    <option value="contest" className="bg-[#111827]">Writing Contest</option>
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
                    className="input-dark text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Application Link</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={oppForm.link}
                    onChange={e => setOppForm({ ...oppForm, link: e.target.value })}
                    className="input-dark text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Description & Eligibility</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline requirements, stipend/grant amount, eligibility..."
                  value={oppForm.description}
                  onChange={e => setOppForm({ ...oppForm, description: e.target.value })}
                  className="input-dark text-xs rounded-2xl"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold mt-2">
                Publish Opportunity
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE CURRICULUM RESOURCE MODAL ─── */}
      {showResModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-white/15 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowResModal(false)} className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Add Curriculum Learning Resource</h3>
            <form onSubmit={handleCreateRes} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastering the Investigative Interview"
                  value={resForm.title}
                  onChange={e => setResForm({ ...resForm, title: e.target.value })}
                  className="input-dark text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Category</label>
                  <select
                    value={resForm.category}
                    onChange={e => setResForm({ ...resForm, category: e.target.value })}
                    className="input-dark text-xs"
                  >
                    <option value="writing" className="bg-[#111827]">Writing Guides</option>
                    <option value="investigation" className="bg-[#111827]">Investigative Journalism</option>
                    <option value="ethics" className="bg-[#111827]">Media Ethics</option>
                    <option value="career" className="bg-[#111827]">Career & College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Format</label>
                  <select
                    value={resForm.type}
                    onChange={e => setResForm({ ...resForm, type: e.target.value })}
                    className="input-dark text-xs"
                  >
                    <option value="guide" className="bg-[#111827]">Guide / Article</option>
                    <option value="video" className="bg-[#111827]">Video Workshop</option>
                    <option value="template" className="bg-[#111827]">Pitch Template</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Content / Document URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={resForm.content_url}
                  onChange={e => setResForm({ ...resForm, content_url: e.target.value })}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Summary</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief summary of what reporters will learn..."
                  value={resForm.description}
                  onChange={e => setResForm({ ...resForm, description: e.target.value })}
                  className="input-dark text-xs rounded-2xl"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold mt-2">
                Save Resource
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── CREATE MAGAZINE ARCHIVE MODAL ─── */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-white/15 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setShowArchiveModal(false)} className="absolute top-5 right-5 text-[#A0A0AB] hover:text-white">
              <X size={18} />
            </button>
            <h3 className="font-heading text-lg font-bold text-white mb-4">Publish Digital Magazine Edition</h3>
            <form onSubmit={handleCreateArchive} className="space-y-3">
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Edition Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Voices of Democracy: The Youth Ballot"
                  value={archiveForm.title}
                  onChange={e => setArchiveForm({ ...archiveForm, title: e.target.value })}
                  className="input-dark text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Issue Number</label>
                  <input
                    type="number"
                    value={archiveForm.issue_number}
                    onChange={e => setArchiveForm({ ...archiveForm, issue_number: e.target.value })}
                    className="input-dark text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Season / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. Fall 2026"
                    value={archiveForm.season}
                    onChange={e => setArchiveForm({ ...archiveForm, season: e.target.value })}
                    className="input-dark text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">Cover Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={archiveForm.cover_image}
                  onChange={e => setArchiveForm({ ...archiveForm, cover_image: e.target.value })}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#A0A0AB] mb-1">PDF File URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={archiveForm.pdf_url}
                  onChange={e => setArchiveForm({ ...archiveForm, pdf_url: e.target.value })}
                  className="input-dark text-xs font-mono"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-xs py-2.5 rounded-xl font-bold mt-2">
                Publish Digital Edition
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
