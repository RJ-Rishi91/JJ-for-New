import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import Logo from '../common/Logo';
import { Menu, X, ChevronDown, Bell, Check, ExternalLink } from 'lucide-react';
import { notifications as notifApi } from '../../lib/api';

const navItems = [
  { label: 'Explore', path: '/explore' },
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
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Logo className="h-9 w-auto" />

          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'text-[#00FFA3] bg-[#00FFA3]/10' : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'}`}
                data-testid={`nav-${item.label.toLowerCase()}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/submit" className="btn-primary text-sm py-2 px-4 hidden sm:block" data-testid="submit-btn">Submit Work</Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="p-2 rounded-xl text-[#A0A0AB] hover:text-white hover:bg-white/5 transition relative"
                    title="Notifications"
                    data-testid="notifications-btn"
                  >
                    <Bell size={20} />
                    {notifData.unread_count > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 sm:w-96 glass rounded-2xl py-3 shadow-2xl border border-white/10 animate-fade-in z-50" data-testid="notifications-dropdown">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">Notifications</h4>
                          {notifData.unread_count > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00FFA3]/20 text-[#00FFA3] font-bold">
                              {notifData.unread_count} new
                            </span>
                          )}
                        </div>
                        {notifData.unread_count > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-[#A0A0AB] hover:text-[#00FFA3] transition flex items-center gap-1"
                          >
                            <Check size={12} /> Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                        {notifData.notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#52525B]">
                            No notifications yet. Activity will appear here!
                          </div>
                        ) : (
                          notifData.notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-white/5 transition cursor-pointer text-left ${!n.read ? 'bg-[#00FFA3]/5' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shrink-0" />}
                                  {n.title}
                                </h5>
                                <span className="text-[9px] text-[#52525B] shrink-0">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#A0A0AB] mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={(e) => { e.stopPropagation(); setNotifOpen(false); }}
                                  className="inline-flex items-center gap-1 text-[10px] text-[#00FFA3] hover:underline mt-1.5"
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
                  <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition" data-testid="user-menu-btn">
                    <div className="w-8 h-8 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/30 flex items-center justify-center">
                      <span className="text-[#00FFA3] text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm text-white hidden sm:block">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className="text-[#A0A0AB]" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 glass rounded-xl py-2 animate-fade-in" data-testid="user-dropdown">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-[#A0A0AB]">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge-pill text-[10px]">{user.lifetime_xp || 0} XP</span>
                          <span className="text-[10px] text-[#A0A0AB]">{user.redeemable_points || 0} pts</span>
                        </div>
                      </div>
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[#A0A0AB] hover:text-white hover:bg-white/5 transition" data-testid="dropdown-dashboard">Dashboard</Link>
                      <Link to={`/profile/${user.id}`} onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[#A0A0AB] hover:text-white hover:bg-white/5 transition" data-testid="dropdown-profile">My Profile</Link>
                      <Link to="/submit" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[#A0A0AB] hover:text-white hover:bg-white/5 transition sm:hidden" data-testid="dropdown-submit">Submit Work</Link>
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#FF3B30] hover:bg-white/5 transition" data-testid="dropdown-logout">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-primary text-sm py-2 px-4" data-testid="login-btn">Get Started</button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2" data-testid="mobile-menu-btn">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl animate-fade-in" data-testid="mobile-menu">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${location.pathname === item.path ? 'text-[#00FFA3] bg-[#00FFA3]/10' : 'text-[#A0A0AB] hover:text-white'}`}>
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
