import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { newsletter as newsApi, contact as contactApi } from '../../lib/api';
import { Mail, Send, CheckCircle, MessageSquare, X, Shield, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Footer() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Newsletter state
  const [email, setEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);

  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Admin login modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('editor@juniorjournalist.org');
  const [adminPassword, setAdminPassword] = useState('EditorPass123!');
  const [adminShowPw, setAdminShowPw] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setNewsLoading(true);
    try {
      const res = await newsApi.subscribe({ email });
      setNewsStatus(res.data.message || 'Subscribed successfully!');
      setEmail('');
      setTimeout(() => setNewsStatus(null), 5000);
    } catch (err) {
      setNewsStatus(err.response?.data?.detail || 'Failed to subscribe');
    } finally {
      setNewsLoading(false);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await contactApi.send(contactForm);
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setContactOpen(false);
        setContactForm({ name: '', email: '', category: 'general', subject: '', message: '' });
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit message");
    } finally {
      setContactLoading(false);
    }
  };

  const handleAdminClick = () => {
    if (user && ['admin', 'manager', 'editor'].includes(user.role)) {
      navigate('/admin');
    } else {
      setAdminError('');
      setAdminModalOpen(true);
    }
  };

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    try {
      await login(adminEmail, adminPassword);
      setAdminModalOpen(false);
      navigate('/admin');
    } catch (err) {
      setAdminError(err.response?.data?.detail || 'Invalid administrative credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <footer className="border-t border-white/[0.08] glass-nav text-slate-400 pt-14 pb-10 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter Callout */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-14 border border-white/[0.1] relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-mono font-medium uppercase tracking-wider mb-2">
                <Mail size={14} /> Young Gazette Weekly Dispatch
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1.5">
                Stories that matter, straight to your inbox.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Join our readership of student journalists, mentors, and educators. Investigative scoops, scholarship deadlines, and writing sparks every Friday.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark text-xs py-2.5 px-4 flex-1"
                />
                <button
                  type="submit"
                  disabled={newsLoading}
                  className="btn-primary text-xs py-2.5 px-6 whitespace-nowrap"
                >
                  <Send size={13} /> {newsLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsStatus && (
                <p className="text-xs text-blue-300 mt-2 flex items-center gap-1.5 animate-fade-in font-medium">
                  <CheckCircle size={13} /> {newsStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 text-xs">
          <div className="col-span-2">
            <Logo className="h-7 w-auto mb-3" />
            <p className="text-slate-400 max-w-sm leading-relaxed mb-3 text-xs">
              Junior Journalist is an independent, non-profit youth journalism collective. We empower student reporters to investigate, publish, and lead change across campuses globally.
            </p>
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Shield size={13} className="text-blue-400" /> 100% Student-First Editorial Freedom
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/explore" className="hover:text-white transition">Explore Dispatches</Link></li>
              <li><Link to="/projects" className="hover:text-white transition">Investigative Desks</Link></li>
              <li><Link to="/messages" className="hover:text-white transition">Newsroom Chat</Link></li>
              <li><Link to="/events" className="hover:text-white transition">Events & Workshops</Link></li>
              <li><Link to="/community" className="hover:text-white transition">Campus Chapters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">Editorial Ops</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/learn" className="hover:text-white transition">Skill-Building Hub</Link></li>
              <li><Link to="/opportunities" className="hover:text-white transition">Fellowships & Grants</Link></li>
              <li><Link to="/rewards" className="hover:text-white transition">XP & Recognition Store</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Reporter Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider mb-3 font-mono text-[11px]">Newsroom Desk</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/submit" className="hover:text-white transition">Submit Your Story</Link></li>
              <li>
                <button onClick={() => setContactOpen(true)} className="hover:text-blue-400 transition text-left">
                  Contact Editorial Desk
                </button>
              </li>
              <li>
                <button onClick={handleAdminClick} className="hover:text-blue-300 text-blue-400 font-semibold transition text-left flex items-center gap-1">
                  <Shield size={12} /> Newsroom HQ Login
                </button>
              </li>
              <li><span className="text-slate-500">Code of Ethics</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Junior Journalist. Under Young Gazette. By youth, for truth.</p>
          <div className="flex flex-wrap items-center gap-3 font-medium">
            <button onClick={() => setContactOpen(true)} className="hover:text-slate-300 transition">
              Editorial Tips & Inquiries
            </button>
            <span>•</span>
            <Link to="/explore" className="hover:text-slate-300 transition">Digital Archives</Link>
            <span>•</span>
            <button
              onClick={handleAdminClick}
              className="hover:text-blue-300 text-blue-400 transition flex items-center gap-1 font-semibold"
              data-testid="footer-admin-login"
            >
              <Shield size={12} /> Staff Portal
            </button>
          </div>
        </div>
      </div>

      {/* CONTACT EDITORIAL DESK MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-lg w-full border border-white/10 animate-fade-in-up relative shadow-2xl">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare size={18} className="text-blue-400" />
              <h3 className="font-heading text-lg font-bold text-white">Contact Editorial Desk</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Confidential story tip, chapter partnership, or questions for our student editors? We review every submission.
            </p>

            {contactSuccess ? (
              <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center text-xs text-blue-300 space-y-1.5">
                <CheckCircle size={28} className="mx-auto text-blue-400" />
                <h4 className="font-bold text-sm text-white">Message Delivered</h4>
                <p>An editorial coordinator will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      className="input-dark text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maya@school.edu"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-dark text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Category</label>
                    <select
                      value={contactForm.category}
                      onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                      className="input-dark text-xs"
                    >
                      <option value="general" className="bg-[#111827] text-white">General Inquiry</option>
                      <option value="story_pitch" className="bg-[#111827] text-white">Confidential Story Tip</option>
                      <option value="campus_partner" className="bg-[#111827] text-white">Campus Chapter Setup</option>
                      <option value="corrections" className="bg-[#111827] text-white">Fact Check / Correction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief topic..."
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="input-dark text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details or documentation..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-dark text-xs rounded-2xl leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="btn-primary w-full text-xs py-2 mt-1"
                >
                  <Send size={13} /> {contactLoading ? 'Sending...' : 'Send Message to Desk'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADMIN / STAFF LOGIN MODAL */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 sm:p-7 max-w-md w-full border border-white/10 animate-fade-in-up relative shadow-2xl">
            <button
              onClick={() => setAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/30">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Newsroom Staff Login</h3>
                <p className="text-xs text-slate-400">Editorial command center access.</p>
              </div>
            </div>

            {/* Quick Demo One-Click Sign In */}
            <div className="my-4 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-white flex items-center gap-1">
                  <Sparkles size={13} className="text-blue-400" /> Demo Lead Editor
                </span>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                  Managing Editor
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2.5 leading-relaxed">
                Log in as Rushal Singh with full editorial review and dispatch permissions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('editor@juniorjournalist.org');
                  setAdminPassword('EditorPass123!');
                  setTimeout(() => handleAdminLogin(), 50);
                }}
                disabled={adminLoading}
                className="btn-primary w-full text-xs py-2"
              >
                {adminLoading ? 'Signing In...' : 'Quick Login as Managing Editor'}
              </button>
            </div>

            {adminError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Staff Email</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="input-dark text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={adminShowPw ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="input-dark text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminShowPw(!adminShowPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {adminShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn-ghost w-full text-xs py-2 text-slate-300 hover:text-white"
              >
                {adminLoading ? 'Authenticating...' : 'Sign In with Custom Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
