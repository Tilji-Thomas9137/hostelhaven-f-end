import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const ChatWidget = ({ currentUser, channels = [] }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(channels[0]?.id || 'ops-admin');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const [unreadByChannel, setUnreadByChannel] = useState({});
  const [toast, setToast] = useState(null); // { channelId, label }

  const getLabelById = (id) => channels.find(c => c.id === id)?.label || id;
  const totalUnread = Object.values(unreadByChannel).reduce((a, b) => a + b, 0);

  useEffect(() => {
    // Allow external open via window event
    const handler = (e) => {
      if (e?.detail?.channel) setActive(e.detail.channel);
      setOpen(true);
    };
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);

  // Local cache helpers (basic persistence per browser)
  const cacheKey = (ch) => `chat_cache_v1_${ch}`;
  const loadCache = (ch) => {
    try {
      const raw = localStorage.getItem(cacheKey(ch));
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };
  const saveCache = (ch, list) => {
    try { localStorage.setItem(cacheKey(ch), JSON.stringify(list)); } catch (_) {}
  };

  // Realtime listeners for ALL channels (keeps receivers updated even when widget is closed)
  useEffect(() => {
    if (!currentUser) return;
    const subs = [];
    channels.forEach(({ id }) => {
      const sub = supabase
        .channel(`chat:${id}`)
        .on('broadcast', { event: 'new-message' }, (payload) => {
          const msg = payload?.payload;
          if (!msg || msg.channel !== id) return;
          // Ignore self-sent messages for unread counters
          if (msg.sender_id && currentUser?.id && msg.sender_id === currentUser.id) {
            // Still persist to cache
            const cachedSelf = loadCache(id);
            const nextSelf = [...cachedSelf, msg];
            saveCache(id, nextSelf);
            if (open && active === id) setMessages(nextSelf);
            return;
          }
          // Persist to cache for this channel
          const cached = loadCache(id);
          const next = [...cached, msg];
          saveCache(id, next);
          // Always increment unread count for incoming messages from others
          setUnreadByChannel(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
          setToast({ channelId: id, label: getLabelById(id) });
          window.clearTimeout(window.__chat_toast_timer);
          window.__chat_toast_timer = window.setTimeout(() => setToast(null), 3500);
          
          // If this channel is currently visible, also update messages
          if (open && active === id) {
            setMessages(next);
          }
        })
        .subscribe();
      subs.push(sub);
    });
    return () => { subs.forEach(s => supabase.removeChannel(s)); };
  }, [channels, currentUser, open, active]);

  // When opening or switching channels, load cached then optionally fetch server history
  useEffect(() => {
    if (!currentUser) return;
    if (!open) return; 
    // Load cached messages immediately for active channel
    setMessages(loadCache(active));
    // Clear unread for this channel only when opened AND focused
    setUnreadByChannel(prev => ({ ...prev, [active]: 0 }));
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch(`http://localhost:3002/api/messages?channel=${encodeURIComponent(active)}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (res.ok && json.success) {
          const serverMsgs = json.data.messages || [];
          if (serverMsgs.length > 0) {
            setMessages(serverMsgs);
            saveCache(active, serverMsgs);
          }
        }
      } catch (_) {}
    })();
  }, [open, active, currentUser]);

  const send = async () => {
    if (!input.trim()) return;
    // Optimistically display the message
    const { data: { session } } = await supabase.auth.getSession();
    const optimistic = {
      id: `${Date.now()}-local`,
      channel: active,
      sender_id: currentUser?.id || null,
      message: input,
      created_at: new Date().toISOString()
    };
    setMessages(prev => {
      const next = [...prev, optimistic];
      saveCache(active, next);
      return next;
    });
    setInput('');

    // Client-side broadcast so all connected clients receive instantly
    try {
      const ch = supabase.channel(`chat:${active}`);
      await ch.send({ type: 'broadcast', event: 'new-message', payload: optimistic });
      await supabase.removeChannel(ch);
    } catch (_) {}

    // Optional: also hit API (for future persistence/notifications)
    try {
      if (session) {
        await fetch('http://localhost:3002/api/messages', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: active, message: optimistic.message })
        });
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!open ? (
        <button onClick={() => { setOpen(true); setToast(null); }} className="relative px-4 py-2 bg-amber-600 text-white rounded-full shadow-lg">
          Chat
          {totalUnread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
        </button>
      ) : (
        <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-amber-200 flex flex-col">
          <div className="p-3 border-b border-amber-100 flex items-center">
            <div className="flex-1 min-w-0 overflow-x-auto pr-2">
              <div className="flex gap-2 whitespace-nowrap">
                {channels.map(ch => (
                  <button key={ch.id} onClick={() => setActive(ch.id)} className={`relative text-sm px-2 py-1 rounded ${active===ch.id?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>
                    {ch.label}
                    {(unreadByChannel[ch.id] || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5">
                        {unreadByChannel[ch.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600">×</button>
          </div>
          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
            {messages.map((m) => (
              <div key={m.id || m.created_at} className={`text-sm ${m.sender_id===currentUser?.id?'text-right':''}`}>
                <div className={`inline-block px-3 py-2 rounded-xl ${m.sender_id===currentUser?.id?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-700'}`}>{m.message}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-amber-100 flex gap-2">
            <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Type a message" className="flex-1 px-3 py-2 border border-slate-300 rounded-xl" />
            <button onClick={send} className="px-3 py-2 bg-amber-600 text-white rounded-xl">Send</button>
          </div>
        </div>
      )}
      {toast && (
        <div className="absolute -top-12 right-0 bg-amber-600 text-white text-sm px-3 py-1 rounded-lg shadow-md">
          New message from {toast.label}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;


