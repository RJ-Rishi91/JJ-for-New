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
    <footer className="border-t border-white/10 glass-nav text-[#CBD0DC] pt-16 pb-12 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter Callout in Frosted Glass */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 mb-16 border border-white/15 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#ff2d55]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-[#ff758c] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Mail size={16} /> Young Gazette Weekly Digest
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                Stories that matter, straight to your inbox.
              </h3>
              <p className="text-sm text-[#CBD0DC] leading-relaxed">
                Join our global readership of students, mentors, and educators. Get investigative scoops, scholarship deadlines, and writing sparks every Friday.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your student email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark text-xs py-3 px-4 rounded-xl flex-1"
                />
                <button
                  type="submit"
                  disabled={newsLoading}
                  className="btn-primary text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Send size={14} /> {newsLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsStatus && (
                <p className="text-xs text-[#ff758c] mt-2 flex items-center gap-1.5 animate-fade-in font-medium">
                  <CheckCircle size={14} /> {newsStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-xs text-[#7B829A] max-w-sm leading-relaxed mb-4">
              Junior Journalist is an independent, non-profit youth journalism collective. We empower student reporters to investigate, publish, and lead change across campuses globally.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#ff758c] font-medium mb-4">
              <Shield size={14} /> 100% Student-First Editorial Freedom
            </div>
            {/* StudioRavya Branding Badge */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-3">
              <img src="/studioravya-logo.png" alt="StudioRavya" className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,160,40,0.25)]" />
              <div className="text-[11px] leading-tight text-[#A0A0AB]">
                <span className="block text-[9px] uppercase font-mono tracking-widest text-[#FFA028] font-bold">A product of</span>
                <span className="text-white font-semibold tracking-wide text-xs">StudioRavya</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/explore" className="hover:text-[#ff758c] transition">Explore Articles</Link></li>
              <li><Link to="/projects" className="hover:text-[#ff758c] transition">Investigative Desks</Link></li>
              <li><Link to="/messages" className="hover:text-[#ff758c] transition">Newsroom Chat</Link></li>
              <li><Link to="/events" className="hover:text-[#ff758c] transition">Events & Workshops</Link></li>
              <li><Link to="/community" className="hover:text-[#ff758c] transition">Campus Chapters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Learning & Ops</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/learn" className="hover:text-[#ff758c] transition">Skill-Building Hub</Link></li>
              <li><Link to="/opportunities" className="hover:text-[#ff758c] transition">Fellowships & Grants</Link></li>
              <li><Link to="/rewards" className="hover:text-[#ff758c] transition">XP & Rewards Store</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#ff758c] transition">Reporter Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-heading">Editorial Desk</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/submit" className="hover:text-[#ff758c] transition">Submit Your Story</Link></li>
              <li>
                <button onClick={() => setContactOpen(true)} className="hover:text-[#ff758c] transition text-left">
                  Contact Editorial Desk
                </button>
              </li>
              <li>
                <button onClick={handleAdminClick} className="hover:text-[#ff758c] text-[#ff758c] font-semibold transition text-left flex items-center gap-1.5">
                  <Shield size={13} /> Newsroom HQ Login
                </button>
              </li>
              <li><span className="text-[#7B829A]">Code of Ethics</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#7B829A]">
          <div className="flex flex-wrap items-center gap-2">
            <p>© {new Date().getFullYear()} Junior Journalist. All rights reserved. By youth, for truth.</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="text-[#A0A0AB]">A product of <strong className="text-[#FFA028] font-semibold">StudioRavya</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => setContactOpen(true)} className="hover:text-white transition">
              Editorial Tips & Queries
            </button>
            <span>•</span>
            <Link to="/explore" className="hover:text-white transition">Digital Anthologies</Link>
            <span>•</span>
            <button
              onClick={handleAdminClick}
              className="hover:text-[#ff758c] text-[#ff758c] transition flex items-center gap-1.5 font-bold"
              data-testid="footer-admin-login"
            >
              <Shield size={13} /> Admin / Staff Portal
            </button>
          </div>
        </div>
      </div>

      {/* CONTACT EDITORIAL DESK MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up relative shadow-2xl">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-5 right-5 text-[#7B829A] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <MessageSquare size={20} className="text-[#ff758c]" />
              <h3 className="font-heading text-xl font-bold text-white">Contact Editorial Desk</h3>
            </div>
            <p className="text-xs text-[#CBD0DC] mb-6">
              Have a confidential story tip, partnership inquiry, or question for our student editors? We read every submission.
            </p>

            {contactSuccess ? (
              <div className="p-6 rounded-2xl bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-center text-xs text-[#ff758c] space-y-2">
                <CheckCircle size={32} className="mx-auto text-[#ff758c]" />
                <h4 className="font-bold text-sm text-white">Inquiry Dispatched!</h4>
                <p>Thank you for reaching out. An editorial coordinator will get in touch with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. maya@school.edu"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1">Category</label>
                    <select
                      value={contactForm.category}
                      onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                      className="input-dark w-full text-xs"
                    >
                      <option value="general" className="bg-[#0c0819] text-white">General Inquiry</option>
                      <option value="story_pitch" className="bg-[#0c0819] text-white">Confidential Story Tip</option>
                      <option value="campus_partner" className="bg-[#0c0819] text-white">Campus Chapter Setup</option>
                      <option value="corrections" className="bg-[#0c0819] text-white">Fact Check / Correction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief topic..."
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#CBD0DC] mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide context, details, or documentation..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-dark w-full text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2"
                >
                  <Send size={14} /> {contactLoading ? 'Sending...' : 'Send Message to Desk'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADMIN / STAFF LOGIN MODAL */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/20 animate-fade-in-up relative shadow-2xl">
            <button
              onClick={() => setAdminModalOpen(false)}
              className="absolute top-5 right-5 text-[#7B829A] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ff2d55]/20 flex items-center justify-center text-[#ff758c] border border-[#ff2d55]/30">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Staff & Admin Newsroom Login</h3>
                <p className="text-xs text-[#CBD0DC]">Access the Editorial Command Center.</p>
              </div>
            </div>

            {/* Quick Demo One-Click Sign In */}
            <div className="my-5 p-4 rounded-2xl bg-[#ff2d55]/10 border border-[#ff2d55]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#ff758c]" /> Demo Editorial Lead
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#ff2d55]/20 text-[#ff758c] font-bold">
                  Admin Access
                </span>
              </div>
              <p className="text-[11px] text-[#CBD0DC] mb-3 leading-relaxed">
                Log in as Managing Editor (Rushal Sharma) with full permissions to review articles, manage opportunities, and dispatch broadcasts.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('editor@juniorjournalist.org');
                  setAdminPassword('EditorPass123!');
                  setTimeout(() => handleAdminLogin(), 50);
                }}
                disabled={adminLoading}
                className="btn-primary w-full text-xs py-2.5"
              >
                {adminLoading ? 'Signing In...' : '⚡ Quick Login as Managing Editor'}
              </button>
            </div>

            {adminError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs text-[#CBD0DC] mb-1 font-semibold">Staff Email or Username</label>
                <input
                  type="text"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="editor@juniorjournalist.org or jj_admin"
                  className="input-dark w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-[#CBD0DC] mb-1 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={adminShowPw ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    className="input-dark w-full text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminShowPw(!adminShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B829A] hover:text-white"
                  >
                    {adminShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="btn-ghost w-full text-xs py-2.5 hover:text-white border-white/20"
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
