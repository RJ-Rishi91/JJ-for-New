import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { messages as msgApi } from '../lib/api';
import AuthModal from '../components/AuthModal';
import { 
  Hash, Send, Users, MessageSquare, Image, 
  Sparkles, Shield, Clock, Paperclip, ChevronRight 
} from 'lucide-react';

const defaultChannels = [
  { id: 'general', name: 'General Newsroom', description: 'Global youth journalist discussion & pitches' },
  { id: 'photojournalism', name: 'Visual & Photography Desk', description: 'Photojournalism tips, photo essays, and visual layout' },
  { id: 'investigative', name: 'Investigative & Research', description: 'Deep-dives, public records, and fact-checking coordination' },
  { id: 'campus-leads', name: 'Campus Leads & Editors', description: 'Newsroom leadership, Chapter updates, and event co-ops' }
];

const defaultMessages = [
  {
    id: "seed-msg-1",
    sender_id: "seed-u1",
    sender_name: "Aarav Sharma",
    sender_role: "Staff Reporter",
    channel: "general",
    content: "Welcome everyone to the new Junior Journalist newsroom! Pitch your stories in #investigative or share photo essays in #photojournalism.",
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "seed-msg-2",
    sender_id: "seed-u4",
    sender_name: "Rushal Sharma",
    sender_role: "Managing Editor",
    channel: "general",
    content: "The Clean Campus plastic audit project is now live under the Projects tab. You can join the audit team!",
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
];

export default function MessagesPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState(defaultChannels);
  const [activeChannel, setActiveChannel] = useState(defaultChannels[0]);
  const [messagesList, setMessagesList] = useState(defaultMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch channel list
  useEffect(() => {
    msgApi.channels()
      .then((res) => {
        const chList = res.data || [];
        if (chList.length > 0) setChannels(chList);
      })
      .catch((err) => console.error("Failed to load channels", err));
  }, []);

  // Fetch messages for active channel with interval
  useEffect(() => {
    if (!activeChannel?.id) return;

    let isMounted = true;
    const fetchMessages = () => {
      msgApi.getChannel(activeChannel.id)
        .then((res) => {
          if (isMounted && res.data && res.data.length > 0) {
            setMessagesList(res.data);
          }
        })
        .catch((err) => console.error("Failed to load messages", err));
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChannel?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachmentUrl.trim()) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSending(true);
    try {
      const payload = {
        channel_id: activeChannel.id,
        content: inputMessage.trim(),
        attachment_url: attachmentUrl.trim() || undefined
      };

      const res = await msgApi.send(payload);
      setMessagesList((prev) => [...prev, res.data]);
      setInputMessage('');
      setAttachmentUrl('');
      setShowAttachmentInput(false);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20" data-testid="messages-page">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3] text-xs font-semibold uppercase tracking-wider mb-2">
            <MessageSquare size={13} /> Newsroom Live Wire
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-white">
            Editorial Newsroom & Channels
          </h1>
          <p className="text-[#A0A0AB] text-xs sm:text-sm">
            Coordinate story pitches, peer reviews, photojournalism feedback, and chapter dispatches in real-time.
          </p>
        </div>

        {!user && (
          <button
            onClick={() => setAuthOpen(true)}
            className="btn-primary text-xs py-2 px-4 self-start sm:self-auto"
          >
            Sign in to Chat
          </button>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[760px]">
        {/* Sidebar Channels */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-white/10 flex flex-col bg-black/30">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#00FFA3]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                News Desks
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#A0A0AB]">
              {channels.length} Desks
            </span>
          </div>

          <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                  activeChannel?.id === ch.id
                    ? 'bg-[#00FFA3]/15 text-white border border-[#00FFA3]/30 shadow-md'
                    : 'text-[#A0A0AB] hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    activeChannel?.id === ch.id
                      ? 'bg-[#00FFA3] text-black font-bold'
                      : 'bg-white/10 text-[#A0A0AB]'
                  }`}
                >
                  <Hash size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-white">{ch.name}</div>
                  <div className="text-[11px] text-[#71717A] truncate mt-0.5">{ch.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* User status card */}
          {user ? (
            <div className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00FFA3]/20 border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] text-xs font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-[#00FFA3] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" /> Online
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-white/10 bg-black/40 text-center">
              <button
                onClick={() => setAuthOpen(true)}
                className="text-xs text-[#00FFA3] hover:underline font-medium"
              >
                Join conversation →
              </button>
            </div>
          )}
        </div>

        {/* Chat Thread Area */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col bg-black/10">
          {/* Active Channel Header */}
          {activeChannel && (
            <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00FFA3]/10 text-[#00FFA3] flex items-center justify-center">
                  <Hash size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeChannel.name}
                  </h3>
                  <p className="text-[11px] text-[#A0A0AB]">{activeChannel.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#A0A0AB] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                <Users size={12} className="text-[#00FFA3]" /> Young Journalists
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-pulse h-16 w-3/4 rounded-2xl" />
                ))}
              </div>
            ) : messagesList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <MessageSquare size={40} className="text-[#52525B] mb-3" />
                <h4 className="font-heading text-base font-bold text-white mb-1">
                  No messages yet in #{activeChannel?.name}
                </h4>
                <p className="text-xs text-[#A0A0AB] max-w-sm">
                  Be the first to pitch an article angle, ask an editorial question, or introduce your campus reporting.
                </p>
              </div>
            ) : (
              messagesList.map((m) => {
                const isMe = user && m.sender_id === user.id;

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 animate-fade-in ${
                      isMe ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${
                        isMe
                          ? 'bg-[#00FFA3]/20 border-[#00FFA3]/40 text-[#00FFA3]'
                          : 'bg-white/10 border-white/15 text-white'
                      }`}
                    >
                      {m.sender_name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className={`max-w-[78%] sm:max-w-[68%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-2 mb-1 text-[11px] ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="font-bold text-white">{m.sender_name}</span>
                        {m.sender_role && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-[#A0A0AB] font-mono">
                            {m.sender_role}
                          </span>
                        )}
                        <span className="text-[#52525B] text-[10px]">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#00FFA3] text-black font-medium rounded-tr-none'
                            : 'glass border border-white/10 text-[#E4E4E7] rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        {m.attachment_url && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-black/10">
                            <img
                              src={m.attachment_url}
                              alt="Attachment"
                              className="max-h-60 w-auto rounded-xl object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachment URL Bar */}
          {showAttachmentInput && (
            <div className="px-4 py-2 border-t border-white/10 bg-black/40 flex items-center gap-2 animate-fade-in">
              <Image size={14} className="text-[#00FFA3]" />
              <input
                className="input-dark text-xs py-1.5 flex-1"
                placeholder="Paste media or image URL (https://...)"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
              <button
                type="button"
                onClick={() => { setShowAttachmentInput(false); setAttachmentUrl(''); }}
                className="text-xs text-[#A0A0AB] hover:text-white px-2"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Chat Composer */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                  className={`p-2.5 rounded-xl transition border ${
                    showAttachmentInput
                      ? 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/40'
                      : 'glass text-[#A0A0AB] hover:text-white hover:bg-white/5 border-white/10'
                  }`}
                  title="Attach image or media link"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  className="input-dark text-xs py-2.5 flex-1"
                  placeholder={`Message #${activeChannel?.name || 'newsroom'}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />

                <button
                  type="submit"
                  disabled={sending || (!inputMessage.trim() && !attachmentUrl.trim())}
                  className="btn-primary py-2.5 px-4 flex items-center gap-1.5 text-xs shrink-0"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-2">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="btn-primary text-xs py-2 px-6"
                >
                  Log in to post in #{activeChannel?.name || 'channel'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
