import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { newsletter as newsApi, contact as contactApi } from '../../lib/api';
import { Mail, Send, CheckCircle, MessageSquare, X, Heart, Shield, BookOpen } from 'lucide-react';

export default function Footer() {
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

  return (
    <footer className="border-t border-white/10 bg-[#030303] text-[#A0A0AB] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Newsletter Callout */}
        <div className="glass rounded-3xl p-8 sm:p-10 mb-16 border border-white/10 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00FFA3]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-[#00FFA3] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Mail size={16} /> Young Gazette Weekly Digest
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
                Stories that matter, straight to your inbox.
              </h3>
              <p className="text-sm text-[#A0A0AB] leading-relaxed">
                Join our global readership of students, mentors, and educators. Get investigative scoops, scholarship deadlines, and writing sparks every Friday.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your student or reader email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark text-xs py-3 px-4 rounded-xl flex-1 bg-black/60 border-white/15 focus:border-[#00FFA3]"
                />
                <button
                  type="submit"
                  disabled={newsLoading}
                  className="btn-primary text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-[#00FFA3]/10"
                >
                  <Send size={14} /> {newsLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsStatus && (
                <p className="text-xs text-[#00FFA3] mt-2 flex items-center gap-1.5 animate-fade-in">
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
            <p className="text-xs text-[#71717A] max-w-sm leading-relaxed mb-4">
              Junior Journalist is an independent, non-profit youth journalism collective. We empower student reporters to investigate, publish, and lead change across campuses globally.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#00FFA3]">
              <Shield size={14} /> 100% Student-First Editorial Freedom
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/explore" className="hover:text-white transition">Explore Articles</Link></li>
              <li><Link to="/projects" className="hover:text-white transition">Investigative Desks</Link></li>
              <li><Link to="/messages" className="hover:text-white transition">Newsroom Chat</Link></li>
              <li><Link to="/events" className="hover:text-white transition">Events & Workshops</Link></li>
              <li><Link to="/community" className="hover:text-white transition">Campus Chapters</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Learning & Ops</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/learn" className="hover:text-white transition">Skill-Building Hub</Link></li>
              <li><Link to="/opportunities" className="hover:text-white transition">Fellowships & Grants</Link></li>
              <li><Link to="/rewards" className="hover:text-white transition">XP & Rewards Store</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Reporter Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Editorial</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/submit" className="hover:text-white transition">Submit Your Story</Link></li>
              <li>
                <button onClick={() => setContactOpen(true)} className="hover:text-[#00FFA3] transition text-left">
                  Contact Editorial Desk
                </button>
              </li>
              <li><span className="text-[#52525B]">Code of Ethics</span></li>
              <li><span className="text-[#52525B]">Fact-Checking Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#52525B]">
          <p>© {new Date().getFullYear()} Junior Journalist. All rights reserved. By youth, for truth.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setContactOpen(true)} className="hover:text-[#A0A0AB] transition">
              Editorial Tips & Queries
            </button>
            <span>•</span>
            <Link to="/explore" className="hover:text-[#A0A0AB] transition">Digital Anthologies</Link>
          </div>
        </div>
      </div>

      {/* CONTACT EDITORIAL DESK MODAL */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 animate-fade-in-up relative">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <MessageSquare size={20} className="text-[#00FFA3]" />
              <h3 className="font-heading text-xl font-bold text-white">Contact Editorial Desk</h3>
            </div>
            <p className="text-xs text-[#A0A0AB] mb-6">
              Have a confidential story tip, partnership inquiry, or question for our student editors? We read every submission.
            </p>

            {contactSuccess ? (
              <div className="p-6 rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-center text-xs text-[#00FFA3] space-y-2">
                <CheckCircle size={32} className="mx-auto text-[#00FFA3]" />
                <h4 className="font-bold text-sm text-white">Inquiry Dispatched!</h4>
                <p>Thank you for reaching out. An editorial coordinator will get in touch with you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A0A0AB] mb-1">Your Name</label>
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
                    <label className="block text-xs text-[#A0A0AB] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="maya@school.edu"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#A0A0AB] mb-1">Category</label>
                    <select
                      value={contactForm.category}
                      onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                      className="input-dark w-full text-xs"
                    >
                      <option value="general">General Query</option>
                      <option value="tip">Confidential Story Tip</option>
                      <option value="campus_lead">Start a Campus Chapter</option>
                      <option value="mentorship">Editorial Mentorship</option>
                      <option value="partnership">School / Media Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#A0A0AB] mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief headline..."
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="input-dark w-full text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#A0A0AB] mb-1">Message / Tip Details</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide relevant details, context, and any sources..."
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-dark w-full text-xs leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  <Send size={14} /> {contactLoading ? 'Sending...' : 'Send Message to Desk'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
