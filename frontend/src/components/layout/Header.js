import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import Logo from '../common/Logo';
import { Menu, X, ChevronDown, Bell, Check, ExternalLink, PenTool } from 'lucide-react';
import { notifications as notifApi } from '../../lib/api';

const navItems = [
  { label: 'Explore', path: '/explore' },
  { label: 'Projects', path: '/projects' },
  { label: 'Newsroom', path: '/messages' },
  { label: 'Events', path: '/events' },
  { label: 'Learn', path: '/learn' },
  { label: 'Opportunities', path: '/opportunities' },
  { label: 'Rewards', path: '/rewards' },
  { label: 'Community', path: '/community' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState({ notifications: [], unread_count: 0 });
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      notifApi.list().then(r => setNotifData(r.data)).catch(() => {});
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 15000);
    return () => clearInterval(timer);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notifApi.markAllRead();
      setNotifData({
        notifications: notifData.notifications.map(n => ({ ...n, read: true })),
        unread_count: 0
      });
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      notifApi.markRead(notif.id).catch(() => {});
      setNotifData({
        notifications: notifData.notifications.map(n => n.id === notif.id ? { ...n, read: true } : n),
        unread_count: Math.max(0, notifData.unread_count - 1)
      });
    }
    setNotifOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-nav border-b border-white/[0.08]" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-15">
          <Logo className="h-8 w-auto" />

          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  location.pathname === item.path
                    ? 'text-white bg-white/[0.08] border border-white/10 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <Link to="/submit" className="btn-primary text-xs py-1.5 px-3.5 hidden sm:inline-flex" data-testid="submit-btn">
                  <PenTool size={13} /> Submit Work
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition relative"
                    title="Notifications"
                    data-testid="notifications-btn"
                  >
                    <Bell size={18} strokeWidth={1.75} />
                    {notifData.unread_count > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-11 w-80 sm:w-96 glass-card rounded-xl py-2.5 shadow-2xl border border-white/10 animate-fade-in z-50" data-testid="notifications-dropdown">
                      <div className="flex items-center justify-between px-3.5 pb-2 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white font-heading">Notifications</h4>
                          {notifData.unread_count > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold font-mono">
                              {notifData.unread_count} new
                            </span>
                          )}
                        </div>
                        {notifData.unread_count > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-slate-400 hover:text-rose-300 transition flex items-center gap-1"
                          >
                            <Check size={11} /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.05]">
                        {notifData.notifications.length === 0 ? (
                          <div className="p-5 text-center text-xs text-slate-500">
                            No notifications yet. Activity will appear here!
                          </div>
                        ) : (
                          notifData.notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 hover:bg-white/[0.04] transition cursor-pointer text-left ${!n.read ? 'bg-rose-500/[0.05]' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />}
                                  {n.title}
                                </h5>
                                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={(e) => { e.stopPropagation(); setNotifOpen(false); }}
                                  className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:underline mt-1 font-medium"
                                >
                                  View details <ExternalLink size={10} />
                                </Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-white/[0.06] transition" data-testid="user-menu-btn">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center">
                      <span className="text-slate-200 text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-slate-200 hidden sm:block font-medium">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-11 w-52 glass-card rounded-xl py-1.5 shadow-2xl border border-white/10 animate-fade-in z-50" data-testid="user-dropdown">
                      <div className="px-3 py-2 border-b border-white/[0.08]">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="badge-pill text-[9px]">{user.lifetime_xp || 0} XP</span>
                          <span className="text-[10px] text-slate-400 font-mono">{user.redeemable_points || 0} pts</span>
                        </div>
                      </div>
                      {['admin', 'manager', 'editor'].includes(user.role) && (
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/15 font-semibold transition flex items-center justify-between" data-testid="dropdown-admin">
                          <span>Newsroom HQ Desk</span>
                          <span className="text-[8px] uppercase tracking-wider font-mono bg-rose-500/20 px-1 py-0.5 rounded">{user.role}</span>
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition" data-testid="dropdown-dashboard">My Dashboard</Link>
                      <Link to={`/profile/${user.id}`} onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition" data-testid="dropdown-profile">My Profile</Link>
                      <Link to="/submit" onClick={() => setProfileOpen(false)} className="block px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/[0.04] transition sm:hidden" data-testid="dropdown-submit">Submit Work</Link>
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-white/[0.04] transition border-t border-white/[0.06] mt-1" data-testid="dropdown-logout">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-primary text-xs py-1.5 px-3.5" data-testid="login-btn">Get Started</button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-slate-200 p-1.5 rounded-lg hover:bg-white/[0.06]" data-testid="mobile-menu-btn">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] glass-card animate-fade-in" data-testid="mobile-menu">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs font-medium transition ${
                    location.pathname === item.path
                      ? 'text-white bg-white/[0.08] font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
