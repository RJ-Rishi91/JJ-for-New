import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { events as eventApi } from '../lib/api';
import { Calendar, Users, Plus, ArrowRight, Clock } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'workshop', start_date: '', end_date: '', open_roles: '', max_team: 10 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    eventApi.list({}).then(r => { setEvents(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...form, open_roles: form.open_roles ? form.open_roles.split(',').map(s => s.trim()) : [], max_team: parseInt(form.max_team) || 10 };
      const { data } = await eventApi.create(payload);
      setEvents([data, ...events]);
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'workshop', start_date: '', end_date: '', open_roles: '', max_team: 10 });
    } catch {}
    setCreating(false);
  };

  const eventTypes = ['workshop', 'debate', 'coverage_drive', 'campaign', 'podcast', 'meetup'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="events-page">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tighter mb-2" data-testid="events-title">Events & Projects</h1>
          <p className="text-[#A0A0AB]">Lead, join, and collaborate on campaigns and events</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2 text-sm" data-testid="create-event-btn">
            <Plus size={18} /> New Event
          </button>
        )}
      </div>

      {showCreate && (
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in-up" data-testid="create-event-form">
          <h3 className="font-heading text-lg font-semibold mb-4">Propose an Event</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input className="input-dark" placeholder="Event Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required data-testid="event-title-input" />
            <textarea className="input-dark min-h-[100px]" placeholder="Describe your event..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required data-testid="event-desc-input" />
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(t => (
                <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.type === t ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'glass text-[#A0A0AB]'}`}
                  data-testid={`event-type-${t}`}>
                  {t.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#A0A0AB] block mb-1">Start Date</label>
                <input type="date" className="input-dark" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} data-testid="event-start-date" />
              </div>
              <div>
                <label className="text-xs text-[#A0A0AB] block mb-1">End Date</label>
                <input type="date" className="input-dark" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} data-testid="event-end-date" />
              </div>
            </div>
            <input className="input-dark" placeholder="Open Roles (comma separated, e.g. Writer, Photographer)" value={form.open_roles} onChange={e => setForm({ ...form, open_roles: e.target.value })} data-testid="event-roles-input" />
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex-1" data-testid="event-submit-btn">{creating ? 'Creating...' : 'Create Event'}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost" data-testid="event-cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-pulse h-48 rounded-2xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-[#A0A0AB]" data-testid="events-empty">
          <Calendar size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-heading text-lg mb-2">No events yet</p>
          <p className="text-sm">Be the first to propose one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="events-grid">
          {events.map((ev, i) => (
            <Link key={ev.id} to={`/events/${ev.id}/`}
              className="glass rounded-2xl p-6 card-interactive animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
              data-testid={`event-item-${i}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-pill">{ev.type?.replace('_', ' ')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ev.status === 'active' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : ev.status === 'completed' ? 'bg-white/5 text-[#A0A0AB]' : 'bg-[#FFD600]/10 text-[#FFD600]'}`}>{ev.status}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#A0A0AB]">
                  <Users size={14} /> {ev.team_members?.length || 0}/{ev.max_team}
                </div>
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{ev.title}</h3>
              <p className="text-sm text-[#A0A0AB] mb-3 line-clamp-2">{ev.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#52525B]">by {ev.creator_name}</span>
                {ev.open_roles?.length > 0 && (
                  <div className="flex gap-1">
                    {ev.open_roles.slice(0, 3).map(r => (
                      <span key={r} className="text-[9px] px-2 py-0.5 rounded-full bg-[#2962FF]/10 text-[#2962FF]">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
