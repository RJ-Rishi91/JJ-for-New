import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { users as usersApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Award, Star, PenTool, Calendar, Eye, MapPin, School, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const isOwn = currentUser?.id === id;

  useEffect(() => {
    usersApi.profile(id).then(r => {
      setProfile(r.data);
      setEditForm({ name: r.data.name, bio: r.data.bio, city: r.data.city, school: r.data.school });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try {
      const { auth } = await import('../lib/api');
      await auth.updateProfile(editForm);
      setProfile({ ...profile, ...editForm });
      setEditing(false);
    } catch {}
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="skeleton-pulse h-64 rounded-2xl" /></div>;
  if (!profile) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-[#A0A0AB]">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="profile-page">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6" data-testid="profile-header">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#00FFA3]/20 border-2 border-[#00FFA3]/30 flex items-center justify-center shrink-0">
            <span className="font-heading text-3xl font-bold text-[#00FFA3]">{profile.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {editing ? (
                  <input className="input-dark mb-2 text-lg font-bold" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} data-testid="edit-name" />
                ) : (
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1" data-testid="profile-name">{profile.name}</h1>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(profile.role_tags || []).map(t => (
                    <span key={t} className="badge-pill">{t}</span>
                  ))}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A0A0AB] font-semibold">{profile.role}</span>
                </div>
              </div>
              {isOwn && (
                editing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary text-sm py-1.5 px-4" data-testid="save-profile-btn">Save</button>
                    <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-1.5 px-4" data-testid="cancel-edit-btn">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn-ghost text-sm py-1.5 px-4" data-testid="edit-profile-btn">Edit Profile</button>
                )
              )}
            </div>
            {editing ? (
              <textarea className="input-dark text-sm mb-3" placeholder="Tell the world about yourself..." value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} data-testid="edit-bio" />
            ) : (
              profile.bio && <p className="text-sm text-[#A0A0AB] mb-3" data-testid="profile-bio">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-[#52525B]">
              {(editing ? editForm.city : profile.city) && (
                editing ? (
                  <input className="input-dark text-xs w-32" value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                ) : (
                  <span className="flex items-center gap-1"><MapPin size={12} /> {profile.city}</span>
                )
              )}
              {(editing ? editForm.school : profile.school) && (
                editing ? (
                  <input className="input-dark text-xs w-40" value={editForm.school} onChange={e => setEditForm({ ...editForm, school: e.target.value })} />
                ) : (
                  <span className="flex items-center gap-1"><School size={12} /> {profile.school}</span>
                )
              )}
              <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(profile.joined_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10" data-testid="profile-stats">
          <div className="text-center">
            <div className="font-heading text-lg font-bold font-mono text-[#00FFA3]">{profile.lifetime_xp || 0}</div>
            <div className="text-[10px] text-[#A0A0AB]">Lifetime XP</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-lg font-bold font-mono">{profile.submissions?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB]">Published</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-lg font-bold font-mono">{profile.events_led?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB]">Events Led</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-lg font-bold font-mono">{profile.badges?.length || 0}</div>
            <div className="text-[10px] text-[#A0A0AB]">Badges</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <div className="glass rounded-2xl p-5" data-testid="profile-badges">
          <h3 className="font-heading text-sm font-semibold mb-4">Badges</h3>
          {(profile.badges || []).length === 0 ? (
            <p className="text-xs text-[#52525B]">No badges yet. Start contributing!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.badges.map(b => (
                <span key={b} className="badge-pill text-xs">{b.replace('_', ' ')}</span>
              ))}
            </div>
          )}
        </div>

        {/* Published Work */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading text-sm font-semibold">Published Work</h3>
          {(profile.submissions || []).length === 0 ? (
            <div className="glass rounded-2xl p-5 text-center text-[#52525B] text-sm">No published submissions yet</div>
          ) : (
            (profile.submissions || []).map((s, i) => (
              <Link key={s.id} to={`/submissions/${s.id}`} className="glass rounded-2xl p-4 flex items-center gap-4 card-interactive block" data-testid={`profile-sub-${i}`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <PenTool size={16} className="text-[#00FFA3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold truncate">{s.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] text-[#A0A0AB]">
                    <span className="badge-pill text-[9px]">{s.type}</span>
                    <span className="flex items-center gap-1"><Eye size={10} />{s.views}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
