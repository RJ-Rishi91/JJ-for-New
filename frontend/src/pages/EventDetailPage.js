import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { events as eventApi, tasks as taskApi } from '../lib/api';
import { Users, Plus, Clock, CheckCircle2, Circle, ArrowRight, GripVertical, Trash2 } from 'lucide-react';

const STATUS_COLS = [
  { id: 'todo', label: 'To Do', color: '#A0A0AB' },
  { id: 'in_progress', label: 'In Progress', color: '#2962FF' },
  { id: 'review', label: 'Review', color: '#FFD600' },
  { id: 'done', label: 'Done', color: '#00FFA3' },
];

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [joining, setJoining] = useState(false);
  const [joinRole, setJoinRole] = useState('member');

  const isLeader = event?.event_leaders?.includes(user?.id);
  const isMember = event?.team_members?.some(m => m.user_id === user?.id);

  const loadData = useCallback(async () => {
    try {
      const [ev, t] = await Promise.all([eventApi.get(id), taskApi.list({ event_id: id })]);
      setEvent(ev.data);
      setTasks(t.data);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await eventApi.join(id, joinRole);
      await loadData();
    } catch {}
    setJoining(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await taskApi.create({ ...taskForm, event_id: id });
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', due_date: '' });
      await loadData();
    } catch {}
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      await taskApi.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch {}
  };

  const deleteTask = async (taskId) => {
    try {
      await taskApi.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch {}
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="skeleton-pulse h-64 rounded-2xl" /></div>;
  if (!event) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-[#A0A0AB]">Event not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24" data-testid="event-detail-page">
      {/* Header */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6" data-testid="event-header">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="badge-pill">{event.type?.replace('_', ' ')}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${event.status === 'active' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-white/5 text-[#A0A0AB]'}`}>{event.status}</span>
          </div>
          {isLeader && event.status === 'active' && (
            <button onClick={() => eventApi.updateStatus(id, 'completed').then(loadData)} className="text-xs text-[#A0A0AB] hover:text-[#00FFA3] transition" data-testid="complete-event-btn">
              Mark Complete
            </button>
          )}
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2" data-testid="event-title">{event.title}</h1>
        <p className="text-[#A0A0AB] mb-4">{event.description}</p>
        <div className="flex flex-wrap gap-4 text-xs text-[#A0A0AB]">
          <span>Led by {event.creator_name}</span>
          {event.start_date && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(event.start_date).toLocaleDateString()}</span>}
          <span className="flex items-center gap-1"><Users size={12} /> {event.team_members?.length}/{event.max_team} members</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Team */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-2xl p-5" data-testid="team-panel">
            <h3 className="font-heading text-sm font-semibold mb-4">Team</h3>
            <div className="space-y-3">
              {(event.team_members || []).map((m, i) => (
                <div key={i} className="flex items-center gap-3" data-testid={`team-member-${i}`}>
                  <div className="w-8 h-8 rounded-full bg-[#00FFA3]/20 flex items-center justify-center text-xs font-bold text-[#00FFA3]">{m.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-[10px] text-[#A0A0AB]">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {!isMember && user && event.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <select value={joinRole} onChange={e => setJoinRole(e.target.value)} className="input-dark text-sm mb-2" data-testid="join-role-select">
                  <option value="member">Member</option>
                  {(event.open_roles || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button onClick={handleJoin} disabled={joining} className="btn-primary w-full text-sm" data-testid="join-event-btn">
                  {joining ? 'Joining...' : 'Join Team'}
                </button>
              </div>
            )}
          </div>

          {event.open_roles?.length > 0 && (
            <div className="glass rounded-2xl p-5" data-testid="open-roles-panel">
              <h3 className="font-heading text-sm font-semibold mb-3">Open Roles</h3>
              <div className="flex flex-wrap gap-2">
                {event.open_roles.map(r => (
                  <span key={r} className="badge-pill">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kanban Board */}
        <div className="lg:col-span-3" data-testid="kanban-board">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold">Task Board</h3>
            {(isLeader || isMember) && (
              <button onClick={() => setShowAddTask(!showAddTask)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1" data-testid="add-task-btn">
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>

          {showAddTask && (
            <form onSubmit={handleAddTask} className="glass rounded-2xl p-5 mb-4 animate-fade-in" data-testid="add-task-form">
              <input className="input-dark mb-3" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required data-testid="task-title-input" />
              <textarea className="input-dark mb-3 min-h-[60px]" placeholder="Description (optional)" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} data-testid="task-desc-input" />
              <div className="flex gap-3 mb-3">
                {['low', 'medium', 'high'].map(p => (
                  <button key={p} type="button" onClick={() => setTaskForm({ ...taskForm, priority: p })}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${taskForm.priority === p ? 'bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30' : 'glass text-[#A0A0AB]'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 text-sm" data-testid="task-submit-btn">Create Task</button>
                <button type="button" onClick={() => setShowAddTask(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kanban-columns">
            {STATUS_COLS.map(col => (
              <div key={col.id} className="kanban-col" data-testid={`kanban-col-${col.id}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-semibold text-[#A0A0AB]">{col.label}</span>
                  <span className="text-[10px] text-[#52525B] ml-auto">{tasks.filter(t => t.status === col.id).length}</span>
                </div>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <div key={task.id} className="glass rounded-xl p-3 card-interactive" data-testid={`task-card-${task.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium">{task.title}</h4>
                        {(isLeader || task.created_by === user?.id) && (
                          <button onClick={() => deleteTask(task.id)} className="text-[#52525B] hover:text-[#FF3B30] transition" data-testid={`delete-task-${task.id}`}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      {task.description && <p className="text-[10px] text-[#52525B] mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${task.priority === 'high' ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : task.priority === 'medium' ? 'bg-[#FFD600]/10 text-[#FFD600]' : 'bg-white/5 text-[#A0A0AB]'}`}>{task.priority}</span>
                        {task.assignee_name && <span className="text-[9px] text-[#A0A0AB]">{task.assignee_name}</span>}
                      </div>
                      {(isLeader || isMember) && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-white/5">
                          {STATUS_COLS.filter(s => s.id !== task.status).map(s => (
                            <button key={s.id} onClick={() => moveTask(task.id, s.id)}
                              className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 text-[#A0A0AB] hover:text-white transition"
                              data-testid={`move-task-${task.id}-${s.id}`}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
