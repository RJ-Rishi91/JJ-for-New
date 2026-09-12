import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal';
import { Menu, X, ChevronDown } from 'lucide-react';

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
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-8 h-8 rounded-lg bg-[#00FFA3] flex items-center justify-center">
              <span className="font-heading text-black font-black text-sm">JJ</span>
            </div>
            <span className="font-heading text-lg font-bold hidden sm:block">Junior<span className="text-[#00FFA3]">Journalist</span></span>
          </Link>

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
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition" data-testid="user-menu-btn">
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
