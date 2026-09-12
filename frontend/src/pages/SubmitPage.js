import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { submissions as subApi } from '../lib/api';
import { PenTool, Camera, MapPin, Video, Send, FileText, Image as ImageIcon, Upload, Eye, Check, RefreshCw } from 'lucide-react';

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

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('jj_story_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { title: '', content: '', type: 'article', category: 'opinion', thumbnail_url: '', co_authors: '' };
  });

  const [mode, setMode] = useState('edit'); // 'edit' or 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (form.title || form.content) {
      localStorage.setItem('jj_story_draft', JSON.stringify(form));
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  }, [form]);

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

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, thumbnail_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearDraft = () => {
    if (window.confirm('Are you sure you want to clear this draft?')) {
      localStorage.removeItem('jj_story_draft');
      setForm({ title: '', content: '', type: 'article', category: 'opinion', thumbnail_url: '', co_authors: '' });
      setLastSaved(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, co_authors: form.co_authors ? form.co_authors.split(',').map(s => s.trim()) : [] };
      await subApi.create(payload);
      localStorage.removeItem('jj_story_draft');
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
        <h2 className="font-heading text-2xl font-bold mb-2">Submitted Successfully!</h2>
        <p className="text-[#A0A0AB]">Your work is in review. You earned +5 XP!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="submit-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2">Submit Work</h1>
          <p className="text-[#A0A0AB] text-sm">Share your story with the Young Gazette collective</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[11px] text-[#52525B] flex items-center gap-1">
              <Check size={12} className="text-[#00FFA3]" /> Saved at {lastSaved}
            </span>
          )}
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-xs text-[#A0A0AB] hover:text-[#FF3B30] transition px-2 py-1"
          >
            Clear Draft
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${mode === 'edit' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
        >
          <PenTool size={16} /> Edit Story
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${mode === 'preview' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-[#A0A0AB] hover:text-white'}`}
        >
          <Eye size={16} /> Live Preview
        </button>
      </div>

      {mode === 'preview' ? (
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-6">
          {form.thumbnail_url && (
            <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-black/40">
              <img src={form.thumbnail_url} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="badge-pill text-xs">{form.type}</span>
            <span className="text-xs text-[#A0A0AB]">{form.category.replace('_', ' ')}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-white">
            {form.title || 'Untitled Headline'}
          </h2>
          <div className="text-xs text-[#A0A0AB] flex items-center gap-2">
            <span>By {user.name}</span>
            {form.co_authors && <span>with {form.co_authors}</span>}
          </div>
          <div className="text-[#D4D4D8] leading-relaxed whitespace-pre-wrap font-sans text-base">
            {form.content || 'Your story content preview will appear here...'}
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              onClick={() => setMode('edit')}
              className="btn-primary text-sm py-2 px-6"
            >
              Back to Editing
            </button>
          </div>
        </div>
      ) : (
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
            <label className="overline block mb-2">Headline / Title</label>
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
            <label className="overline block mb-2">Story Content</label>
            <textarea className="input-dark min-h-[260px] resize-y leading-relaxed font-sans" placeholder="Write or paste your story here... Support for multi-paragraph reporting, essays, reviews..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required data-testid="submit-content" />
          </div>

          {/* Media / Thumbnail Upload */}
          <div>
            <label className="overline block mb-2">Cover Image / Media (Upload or URL)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="glass rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer border border-dashed border-white/20 hover:border-[#00FFA3]/50 transition">
                <Upload size={20} className="text-[#00FFA3] mb-1" />
                <span className="text-xs font-semibold text-white">Choose Image File</span>
                <span className="text-[10px] text-[#A0A0AB]">JPG, PNG, WebP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
              <div className="flex flex-col justify-center">
                <input
                  className="input-dark text-xs"
                  placeholder="Or paste an image URL: https://..."
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  data-testid="submit-thumbnail"
                />
              </div>
            </div>
            {form.thumbnail_url && (
              <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-white/20">
                <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, thumbnail_url: '' })}
                  className="absolute top-1 right-1 bg-black/80 rounded-full p-1 text-white hover:text-[#FF3B30]"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="overline block mb-2">Co-authors & Contributors (optional)</label>
            <input className="input-dark" placeholder="e.g. Aryan Khan, Sara Ali (photographer)" value={form.co_authors} onChange={(e) => setForm({ ...form, co_authors: e.target.value })} data-testid="submit-coauthors" />
          </div>

          {error && <div className="p-3 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-sm" data-testid="submit-error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5" data-testid="submit-btn">
            <FileText size={18} /> {loading ? 'Submitting...' : 'Submit Story for Editorial Review'}
          </button>
          <p className="text-xs text-[#52525B] text-center">You'll earn +5 XP upon submission and +10 XP when published</p>
        </form>
      )}
    </div>
  );
}
