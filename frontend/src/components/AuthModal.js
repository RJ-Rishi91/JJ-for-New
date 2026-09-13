import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './common/Logo';
import { X, Eye, EyeOff } from 'lucide-react';

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
      <div className="relative w-full max-w-md glass rounded-2xl p-8 animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A0A0AB] hover:text-white transition" data-testid="auth-close-btn">
          <X size={20} />
        </button>
        <div className="flex justify-center mb-5">
          <Logo withLink={false} className="h-11 w-auto" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-6 text-center text-white">
          {tab === 'login' ? 'Welcome Back' : 'Join the Collective'}
        </h2>
        <div className="flex gap-2 mb-6">
          {['login', 'register'].map((t) => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
              data-testid={`auth-tab-${t}`}>
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-sm" data-testid="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <input className="input-dark" placeholder="Full Name" value={form.name} onChange={set('name')} required data-testid="auth-name-input" />
              <div className="grid grid-cols-2 gap-3">
                <input className="input-dark" placeholder="City" value={form.city} onChange={set('city')} data-testid="auth-city-input" />
                <input className="input-dark" placeholder="School/College" value={form.school} onChange={set('school')} data-testid="auth-school-input" />
              </div>
            </>
          )}
          <input className="input-dark" type="email" placeholder="Email" value={form.email} onChange={set('email')} required data-testid="auth-email-input" />
          <div className="relative">
            <input className="input-dark pr-10" type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} required data-testid="auth-password-input" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-white">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full" data-testid="auth-submit-btn">
            {loading ? 'Loading...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {tab === 'login' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, email: 'editor@juniorjournalist.org', password: 'EditorPass123!' });
                }}
                className="w-full text-center text-xs text-[#00FFA3] hover:underline font-mono py-1"
              >
                ⚡ Fill Staff / Editor Credentials
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
