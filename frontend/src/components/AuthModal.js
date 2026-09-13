import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './common/Logo';
import { X, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', school: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.city, form.school);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="auth-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 sm:p-7 animate-fade-in-up border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition" data-testid="auth-close-btn">
          <X size={18} />
        </button>
        <div className="flex justify-center mb-4">
          <Logo withLink={false} className="h-8 w-auto" />
        </div>
        <h2 className="font-heading text-xl font-bold mb-5 text-center text-white">
          {tab === 'login' ? 'Welcome Back' : 'Join the Newsroom Collective'}
        </h2>
        <div className="flex gap-1.5 mb-5 p-1 rounded-lg glass border border-white/[0.08]">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold font-heading transition-all ${
                tab === t
                  ? 'bg-white/[0.08] text-white border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid={`auth-tab-${t}`}>
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
        {error && <div className="mb-3.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs" data-testid="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <>
              <input className="input-dark text-xs" placeholder="Full Name" value={form.name} onChange={set('name')} required data-testid="auth-name-input" />
              <div className="grid grid-cols-2 gap-2.5">
                <input className="input-dark text-xs" placeholder="City" value={form.city} onChange={set('city')} data-testid="auth-city-input" />
                <input className="input-dark text-xs" placeholder="School/College" value={form.school} onChange={set('school')} data-testid="auth-school-input" />
              </div>
            </>
          )}
          <input className="input-dark text-xs" type="email" placeholder="Student or Personal Email" value={form.email} onChange={set('email')} required data-testid="auth-email-input" />
          <div className="relative">
            <input className="input-dark text-xs pr-9" type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} required data-testid="auth-password-input" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-xs py-2.5" data-testid="auth-submit-btn">
            {loading ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Student Account'}
          </button>

          {tab === 'login' && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, email: 'editor@juniorjournalist.org', password: 'EditorPass123!' });
                }}
                className="w-full text-center text-xs text-rose-400 hover:text-rose-300 hover:underline font-mono py-1 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={12} /> Fill Demo Staff / Editor Credentials
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
