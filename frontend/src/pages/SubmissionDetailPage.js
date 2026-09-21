import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { submissions as subApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Flame, Heart, Sparkles, ArrowLeft, Clock, User, MessageSquare, Send, Trash2 } from 'lucide-react';

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reactionNotice, setReactionNotice] = useState('');

  useEffect(() => {
    subApi.get(id).then(r => { setSub(r.data); setLoading(false); }).catch(() => setLoading(false));
    subApi.comments(id).then(r => setComments(r.data || [])).catch(() => {});
  }, [id]);

  const handleReact = async (reaction) => {
    if (!user) {
      setReactionNotice('Please sign in to react to articles and support student reporters!');
      setTimeout(() => setReactionNotice(''), 4000);
      return;
    }
    try {
      await subApi.react(id, reaction);
      setSub(prev => ({ ...prev, reactions: { ...prev.reactions, [reaction]: (prev.reactions?.[reaction] || 0) + 1 } }));
    } catch {}
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setSubmittingComment(true);
    try {
      const res = await subApi.addComment(id, newComment.trim());
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await subApi.deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
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
      <Link to="/explore/" className="flex items-center gap-2 text-[#A0A0AB] hover:text-white text-sm mb-6 transition" data-testid="back-link">
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

        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-white" data-testid="submission-title">{sub.title}</h1>

        <div className="flex items-center gap-4 mb-8 text-sm text-[#A0A0AB]">
          <Link to={`/profile/${sub.author_id}/`} className="flex items-center gap-2 hover:text-[#00FFA3] transition" data-testid="submission-author">
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

        {/* Cover image if available */}
        {(sub.thumbnail_url || sub.cover_image) && (
          <div className="rounded-2xl overflow-hidden mb-8 max-h-96 w-full bg-black/40">
            <img src={sub.thumbnail_url || sub.cover_image} alt={sub.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="glass rounded-2xl p-6 sm:p-8 mb-8" data-testid="submission-content">
          <div className="prose prose-invert max-w-none text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
            {sub.content}
          </div>
        </div>

        {/* Reactions */}
        <div className="mb-8" data-testid="reactions-bar">
          <div className="flex flex-wrap items-center gap-3">
            {reactions.map(r => (
              <button key={r.key} onClick={() => handleReact(r.key)}
                className="glass rounded-xl px-4 py-2 flex items-center gap-2 text-sm card-interactive transition hover:border-[#ff2d55]/40"
                data-testid={`react-${r.key}`}
                title={user ? `React with ${r.label}` : 'Sign in to react'}>
                {r.icon}
                <span className="font-mono text-xs">{sub.reactions?.[r.key] || 0}</span>
              </button>
            ))}
            {!user && (
              <span className="text-xs text-[#A0A0AB]">Sign in to react</span>
            )}
          </div>
          {reactionNotice && (
            <p className="text-xs text-[#ff758c] mt-2.5 animate-fade-in font-medium flex items-center gap-1.5" data-testid="reaction-notice">
              ⚠️ {reactionNotice}
            </p>
          )}
        </div>

        {/* Discussion & Peer Feedback */}
        <section className="border-t border-white/10 pt-8 mt-10" data-testid="comments-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-[#00FFA3]" /> Reader Discussion & Peer Feedback ({comments.length})
            </h3>
          </div>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="glass rounded-2xl p-4 mb-6 border border-white/10">
              <textarea
                className="input-dark text-xs min-h-[75px] mb-3"
                placeholder="Share constructive feedback, ask questions, or discuss this story..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#A0A0AB]">You earn +2 XP for constructive peer discussion</span>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Send size={13} /> {submittingComment ? 'Posting...' : 'Post Feedback'}
                </button>
              </div>
            </form>
          ) : (
            <div className="glass rounded-2xl p-4 text-center mb-6 text-xs text-[#A0A0AB]">
              Sign in to participate in story discussions and earn XP.
            </div>
          )}

          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-[#52525B] text-center py-6">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="glass rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{c.user_name}</span>
                      {c.user_role && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-[#00FFA3] font-mono uppercase">
                          {c.user_role}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#52525B]">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                      {(user && (user.id === c.user_id || user.role === 'admin' || user.role === 'editor')) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-[#52525B] hover:text-[#FF3B30] p-1 transition"
                          title="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
