import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Building, ArrowLeft } from 'lucide-react';
import { contact as contactApi } from '../lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactApi.send(form);
      setSuccess(true);
      setForm({ name: '', email: '', category: 'general', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to send message right now. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28" data-testid="contact-page">
      {/* Back Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#7B829A] hover:text-white transition mb-6 font-mono"
      >
        <ArrowLeft size={14} /> Back to Newsroom Home
      </Link>

      {/* Header Banner */}
      <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2d55]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2d55]/15 border border-[#ff2d55]/30 text-[#ff758c] text-xs font-mono mb-4">
            <Mail size={13} /> Direct Newsroom Communication Desk
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Contact the Editorial Desk
          </h1>
          <p className="text-[#CBD0DC] text-sm sm:text-base leading-relaxed max-w-2xl">
            Have a confidential story lead, a factual correction, an inquiry about starting a campus chapter, or partnership questions? Our editorial team reviews every message.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form: Left/Top (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10">
            <h2 className="font-heading text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#00FFA3]" /> Send a Dispatch to the Desk
            </h2>
            <p className="text-xs text-[#7B829A] mb-6">
              Messages are delivered directly to the Senior Editors review inbox.
            </p>

            {success ? (
              <div className="p-8 text-center rounded-2xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 animate-fade-in">
                <CheckCircle2 size={42} className="text-[#00FFA3] mx-auto mb-3" />
                <h3 className="font-heading text-lg font-bold text-white mb-2">Message Dispatched Successfully</h3>
                <p className="text-xs text-[#CBD0DC] max-w-md mx-auto mb-6">
                  Thank you for reaching out to the Junior Journalist editorial board. If your query requires follow-up, our editors will respond to your email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="btn-primary text-xs py-2.5 px-5 rounded-xl font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1.5 font-medium">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-dark text-xs py-2.5 rounded-xl w-full"
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1.5 font-medium">Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@school.edu"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-dark text-xs py-2.5 rounded-xl w-full"
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1.5 font-medium">Inquiry Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input-dark text-xs py-2.5 rounded-xl w-full"
                      data-testid="contact-category-select"
                    >
                      <option value="general" className="bg-[#111827] text-white">General Inquiry</option>
                      <option value="pitch" className="bg-[#111827] text-white">Pitch a Story / Lead</option>
                      <option value="confidential" className="bg-[#111827] text-white">Confidential Whistleblower Tip</option>
                      <option value="correction" className="bg-[#111827] text-white">Factual Correction Request</option>
                      <option value="chapter" className="bg-[#111827] text-white">Start a Campus Chapter</option>
                      <option value="press" className="bg-[#111827] text-white">Press &amp; Media Request</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#CBD0DC] mb-1.5 font-medium">Subject Line *</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief headline of your message..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="input-dark text-xs py-2.5 rounded-xl w-full"
                      data-testid="contact-subject-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[#CBD0DC] mb-1.5 font-medium">Message Body *</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Provide full context, story documentation, questions, or campus background..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-dark text-xs py-3 rounded-xl w-full resize-y font-sans leading-relaxed"
                    data-testid="contact-message-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  data-testid="contact-submit-btn"
                >
                  <Send size={14} /> {loading ? 'Dispatching Message...' : 'Send Message to Editorial Desk'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Desk Info: Right (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="font-heading text-lg font-bold text-white mb-2">Direct Communications</h3>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-[#7B829A] uppercase tracking-wider block mb-1">
                  General Editorial Desk
                </span>
                <a href="mailto:editorial@juniorjournalist.org" className="text-white font-medium hover:text-[#ff758c] transition font-mono">
                  editorial@juniorjournalist.org
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-[#FFA028] uppercase tracking-wider block mb-1">
                  Technology &amp; StudioRavya Inquiries
                </span>
                <a href="mailto:studioravya@onerishi.in" className="text-white font-medium hover:text-[#FFA028] transition font-mono">
                  studioravya@onerishi.in
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-mono text-[#00f2fe] uppercase tracking-wider block mb-1">
                  Student Data &amp; Privacy Officer
                </span>
                <a href="mailto:privacy@onerishi.in" className="text-white font-medium hover:text-[#00f2fe] transition font-mono">
                  privacy@onerishi.in
                </a>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-[#ff2d55]/20 bg-[#ff2d55]/5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5 text-[#ff758c]">
              <ShieldAlert size={14} /> Confidential Whistleblower Protocol
            </h4>
            <p className="text-[11px] text-[#CBD0DC] leading-relaxed">
              If you are a student or teacher sharing sensitive campus documentation or evidence of educational misconduct, select <em>Confidential Whistleblower Tip</em> in the form. Your IP address and email will be handled under strict journalistic source protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
