import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissions as subApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Flame, Heart, Sparkles, ArrowLeft, Clock, User } from 'lucide-react';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subApi.get(id).then(r => { setSub(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleReact = async (reaction) => {
    if (!user) return;
    await subApi.react(id, reaction);
    setSub(prev => ({ ...prev, reactions: { ...prev.reactions, [reaction]: (prev.reactions?.[reaction] || 0) + 1 } }));
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8"><div className="skeleton-pulse h-64 rounded-2xl" /></div>;
  if (!sub) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-[#A0A0AB]">Submission not found</div>;

  const reactions = [
    { key: 'fire', icon: <Flame size={18} />, label: 'Fire' },
    { key: 'heart', icon: <Heart size={18} />, label: 'Love' },
    { key: 'clap', icon: <Sparkles size={18} />, label: 'Brilliant' },
    { key: 'mind_blown', icon: <Sparkles size={18} />, label: 'Mind Blown' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="submission-detail-page">
      <Link to="/explore" className="flex items-center gap-2 text-[#A0A0AB] hover:text-white text-sm mb-6 transition" data-testid="back-link">
        <ArrowLeft size={16} /> Back to Explore
      </Link>

      <article data-testid="submission-article">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-pill">{sub.type?.replace('_', ' ')}</span>
          <span className="badge-pill" style={{ borderColor: 'rgba(41,98,255,0.3)', color: '#2962FF', background: 'rgba(41,98,255,0.1)' }}>{sub.category?.replace('_', ' ')}</span>
          {sub.status !== 'published' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD600]/10 text-[#FFD600] font-semibold">{sub.status}</span>
          )}
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4" data-testid="submission-title">{sub.title}</h1>

        <div className="flex items-center gap-4 mb-8 text-sm text-[#A0A0AB]">
          <Link to={`/profile/${sub.author_id}`} className="flex items-center gap-2 hover:text-[#00FFA3] transition" data-testid="submission-author">
            <div className="w-8 h-8 rounded-full bg-[#00FFA3]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00FFA3]">{sub.author_name?.[0]?.toUpperCase()}</span>
            </div>
            {sub.author_name}
          </Link>
          <span className="flex items-center gap-1"><Eye size={14} /> {sub.views} views</span>
          {sub.published_at && <span className="flex items-center gap-1"><Clock size={14} /> {new Date(sub.published_at).toLocaleDateString()}</span>}
        </div>

        {sub.co_authors?.length > 0 && (
          <div className="flex items-center gap-2 mb-6 text-xs text-[#52525B]">
            <User size={12} /> Co-authors: {sub.co_authors.join(', ')}
          </div>
        )}

        <div className="glass rounded-2xl p-6 sm:p-8 mb-8" data-testid="submission-content">
          <div className="prose prose-invert max-w-none text-[#A0A0AB] leading-relaxed whitespace-pre-wrap">
            {sub.content}
          </div>
        </div>

        {/* Reactions */}
        {user && (
          <div className="flex items-center gap-3 mb-8" data-testid="reactions-bar">
            {reactions.map(r => (
              <button key={r.key} onClick={() => handleReact(r.key)}
                className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm card-interactive"
                data-testid={`react-${r.key}`}>
                {r.icon}
                <span className="font-mono text-xs">{sub.reactions?.[r.key] || 0}</span>
              </button>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
