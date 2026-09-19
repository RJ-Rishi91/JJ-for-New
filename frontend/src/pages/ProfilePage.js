import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users as usersApi, auth as authApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Award, Star, PenTool, Calendar, Eye, MapPin, School, Mail, Download, Share2, Check, Sparkles } from 'lucide-react';

const AVAILABLE_ROLE_TAGS = [
  'writer', 'photojournalist', 'field_reporter', 'video_journalist',
  'anchor', 'editor', 'event_leader', 'mentor'
];

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [copied, setCopied] = useState(false);

  const isOwn = currentUser?.id === id;

  useEffect(() => {
    usersApi.profile(id).then(r => {
      setProfile(r.data);
      setEditForm({
        name: r.data.name,
        bio: r.data.bio || '',
        city: r.data.city || '',
        school: r.data.school || '',
        role_tags: r.data.role_tags || []
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const toggleRoleTag = (tag) => {
    const current = editForm.role_tags || [];
    if (current.includes(tag)) {
      setEditForm({ ...editForm, role_tags: current.filter(t => t !== tag) });
    } else {
      setEditForm({ ...editForm, role_tags: [...current, tag] });
    }
  };

  const handleSave = async () => {
    try {
      await authApi.updateProfile(editForm);
      setProfile({ ...profile, ...editForm });
      setEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintPortfolio = () => {
    window.print();
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="skeleton-pulse h-64 rounded-2xl" /></div>;
  if (!profile) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-[#A0A0AB]">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 print:p-0 print:m-0" data-testid="profile-page">
      {/* Profile Header */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden" data-testid="profile-header">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#00FFA3]/20 border-2 border-[#00FFA3]/40 flex items-center justify-center shrink-0">
            <span className="font-heading text-3xl font-black text-[#00FFA3]">{profile.name?.[0]?.toUpperCase()}</span>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                {editing ? (
                  <input
                    className="input-dark mb-2 text-xl font-bold"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    data-testid="edit-name"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1" data-testid="profile-name">
                      {profile.name}
                    </h1>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] font-mono font-bold uppercase tracking-wider">
                      {profile.role}
                    </span>
                  </div>
                )}

                {/* Role tags */}
                {editing ? (
                  <div className="my-3">
                    <label className="text-xs text-[#A0A0AB] block mb-1.5 font-semibold">Select your Roles & Talents:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_ROLE_TAGS.map(tag => {
                        const active = (editForm.role_tags || []).includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleRoleTag(tag)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${active ? 'bg-[#00FFA3] text-black font-bold' : 'glass text-[#A0A0AB] hover:text-white'}`}
                          >
                            @{tag.replace('_', '-')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(profile.role_tags || []).length === 0 ? (
                      <span className="text-xs text-[#52525B]">@contributor</span>
                    ) : (
                      (profile.role_tags || []).map(t => (
                        <span key={t} className="badge-pill text-xs">@{t.replace('_', '-')}</span>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 print:hidden">
                <button
                  onClick={handleShare}
                  className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  title="Share profile"
                >
                  {copied ? <Check size={14} className="text-[#00FFA3]" /> : <Share2 size={14} />}
                  <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  onClick={handlePrintPortfolio}
                  className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                  title="Download / Print Portfolio"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Export Portfolio</span>
                </button>
                {isOwn && (
                  editing ? (
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="btn-primary text-xs py-1.5 px-4" data-testid="save-profile-btn">Save</button>
                      <button onClick={() => setEditing(false)} className="btn-ghost text-xs py-1.5 px-3" data-testid="cancel-edit-btn">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="btn-primary text-xs py-1.5 px-4" data-testid="edit-profile-btn">Edit Profile</button>
                  )
                )}
              </div>
            </div>

            {editing ? (
              <textarea
                className="input-dark text-sm mb-3 min-h-[80px]"
                placeholder="Tell the community about your passions, writing goals, and interests..."
                value={editForm.bio}
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                data-testid="edit-bio"
              />
            ) : (
              profile.bio && <p className="text-sm text-[#A0A0AB] mb-3 leading-relaxed" data-testid="profile-bio">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-[#52525B]">
              {(editing ? editForm.city : profile.city) && (
                editing ? (
                  <input className="input-dark text-xs w-32" placeholder="City" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                ) : (
                  <span className="flex items-center gap-1"><MapPin size={12} /> {profile.city}</span>
                )
              )}
              {(editing ? editForm.school : profile.school) && (
                editing ? (
                  <input className="input-dark text-xs w-44" placeholder="School / College" value={editForm.school} onChange={e => setEditForm({ ...editForm, school: e.target.value })} />
                ) : (
                  <span className="flex items-center gap-1"><School size={12} /> {profile.school}</span>
                )
              )}
              <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(profile.joined_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10" data-testid="profile-stats">
          <div className="text-center p-3 rounded-2xl bg-white/[0.02]">
            <div className="font-heading text-2xl font-bold font-mono text-[#00FFA3]">{profile.lifetime_xp || 0}</div>
            <div className="text-[10px] text-[#A0A0AB] uppercase tracking-wider">Lifetime XP</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/[0.02]">
            <div className="font-heading text-2xl font-bold font-mono">{profile.submissions?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB] uppercase tracking-wider">Published Works</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/[0.02]">
            <div className="font-heading text-2xl font-bold font-mono">{profile.events_led?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB] uppercase tracking-wider">Events & Campaigns</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/[0.02]">
            <div className="font-heading text-2xl font-bold font-mono text-[#FFD600]">{profile.badges?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB] uppercase tracking-wider">Badges Earned</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges Column */}
        <div className="glass rounded-3xl p-6" data-testid="profile-badges">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold flex items-center gap-2">
              <Award size={16} className="text-[#FFD600]" /> Badges & Trophies
            </h3>
            <span className="text-xs text-[#00FFA3] font-mono">{profile.badges?.length || 0} unlocked</span>
          </div>
          {(profile.badges || []).length === 0 ? (
            <p className="text-xs text-[#52525B]">No badges yet. Start writing, leading events, and taking tasks!</p>
          ) : (
            <div className="space-y-2">
              {profile.badges.map(b => (
                <div key={b} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center text-[#FFD600]">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold capitalize">{b.replace('_', ' ')}</h5>
                    <p className="text-[10px] text-[#A0A0AB]">Milestone verification</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Published Work Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold flex items-center gap-2">
              <PenTool size={16} className="text-[#00FFA3]" /> Published Portfolio
            </h3>
            <span className="text-xs text-[#A0A0AB]">{profile.submissions?.length || 0} items</span>
          </div>

          {(profile.submissions || []).length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center text-[#52525B] text-sm">
              No published submissions yet. When stories are approved by editors, they appear here.
            </div>
          ) : (
            (profile.submissions || []).map((s, i) => (
              <Link
                key={s.id}
                to={`/submissions/${s.id}/`}
                className="glass rounded-2xl p-4 flex items-center gap-4 card-interactive block transition hover:border-[#00FFA3]/40"
                data-testid={`profile-sub-${i}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <PenTool size={18} className="text-[#00FFA3]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate text-white">{s.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-[#A0A0AB] mt-1">
                    <span className="badge-pill text-[9px]">{s.type}</span>
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Eye size={10} />{s.views} reads</span>
                  </div>
                </div>
              </Link>
            ))
          )}

          {/* Events Led Section */}
          {profile.events_led && profile.events_led.length > 0 && (
            <div className="pt-6">
              <h3 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-[#2962FF]" /> Events & Projects Led
              </h3>
              <div className="space-y-3">
                {profile.events_led.map((ev) => (
                  <Link
                    key={ev.id}
                    to={`/events/${ev.id}/`}
                    className="glass rounded-2xl p-4 flex items-center justify-between card-interactive block hover:border-[#2962FF]/40 transition"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-white">{ev.title}</h4>
                      <p className="text-[11px] text-[#A0A0AB]">{ev.type} • {ev.team_members?.length || 1} team members</p>
                    </div>
                    <span className="badge-pill text-[10px]">{ev.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
