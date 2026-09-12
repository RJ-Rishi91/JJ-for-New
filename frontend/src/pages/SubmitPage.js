import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submissions as subApi } from '../lib/api';
import { PenTool, Camera, MapPin, Video, Send, FileText } from 'lucide-react';

const contentTypes = [
  { id: 'article', label: 'Article', icon: <PenTool size={20} />, desc: 'Written piece, opinion, essay' },
  { id: 'photo_essay', label: 'Photo Essay', icon: <Camera size={20} />, desc: 'Visual storytelling with photos' },
  { id: 'field_report', label: 'Field Report', icon: <MapPin size={20} />, desc: 'On-ground event coverage' },
  { id: 'video', label: 'Video Story', icon: <Video size={20} />, desc: 'Video journalism, interviews' },
];

const categories = ['opinion', 'campus_voices', 'reviews', 'creative_writing', 'field_reports', 'photo_essays', 'interviews', 'local_impact'];

export default function SubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', type: 'article', category: 'opinion', thumbnail_url: '', co_authors: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center"><div className="skeleton-pulse h-20 w-60 mx-auto rounded-2xl" /></div>;
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center" data-testid="submit-login-required">
        <h2 className="font-heading text-2xl font-bold mb-4">Sign in to Submit</h2>
        <p className="text-[#A0A0AB]">You need to be logged in to submit your work.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, co_authors: form.co_authors ? form.co_authors.split(',').map(s => s.trim()) : [] };
      await subApi.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center animate-fade-in-up" data-testid="submit-success">
        <div className="w-20 h-20 rounded-full bg-[#00FFA3]/20 flex items-center justify-center mx-auto mb-6">
          <Send size={32} className="text-[#00FFA3]" />
        </div>
        <h2 className="font-heading text-2xl font-bold mb-2">Submitted!</h2>
        <p className="text-[#A0A0AB]">Your work is under review. You earned +5 XP!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="submit-page">
      <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2">Submit Work</h1>
      <p className="text-[#A0A0AB] mb-8">Share your story with the community and earn recognition</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type */}
        <div>
          <label className="overline block mb-3">Content Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="content-type-selector">
            {contentTypes.map(ct => (
              <button key={ct.id} type="button" onClick={() => setForm({ ...form, type: ct.id })}
                className={`glass rounded-2xl p-4 text-center transition-all ${form.type === ct.id ? 'border-[#00FFA3] bg-[#00FFA3]/10 text-[#00FFA3]' : 'text-[#A0A0AB] hover:text-white hover:bg-white/5'}`}
                data-testid={`type-btn-${ct.id}`}>
                <div className="flex justify-center mb-2">{ct.icon}</div>
                <div className="text-xs font-semibold">{ct.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="overline block mb-2">Title</label>
          <input className="input-dark" placeholder="Your compelling headline..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required data-testid="submit-title" />
        </div>

        <div>
          <label className="overline block mb-2">Category</label>
          <div className="flex flex-wrap gap-2" data-testid="category-selector">
            {categories.map(c => (
              <button key={c} type="button" onClick={() => setForm({ ...form, category: c })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.category === c ? 'bg-[#2962FF]/10 text-[#2962FF] border border-[#2962FF]/30' : 'glass text-[#A0A0AB] hover:text-white'}`}
                data-testid={`cat-btn-${c}`}>
                {c.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="overline block mb-2">Content</label>
          <textarea className="input-dark min-h-[250px] resize-y" placeholder="Write your story here..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required data-testid="submit-content" />
        </div>

        <div>
          <label className="overline block mb-2">Thumbnail URL (optional)</label>
          <input className="input-dark" placeholder="https://example.com/image.jpg" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} data-testid="submit-thumbnail" />
        </div>

        <div>
          <label className="overline block mb-2">Co-authors (comma separated, optional)</label>
          <input className="input-dark" placeholder="Jane Doe, John Smith" value={form.co_authors} onChange={(e) => setForm({ ...form, co_authors: e.target.value })} data-testid="submit-coauthors" />
        </div>

        {error && <div className="p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-sm" data-testid="submit-error">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" data-testid="submit-btn">
          <FileText size={18} /> {loading ? 'Submitting...' : 'Submit for Review'}
        </button>
        <p className="text-xs text-[#52525B] text-center">You'll earn +5 XP upon submission and +10 XP when published</p>
      </form>
    </div>
  );
}
