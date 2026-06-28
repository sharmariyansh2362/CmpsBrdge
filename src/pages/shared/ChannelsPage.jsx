import { useState, useRef, useEffect, useCallback } from "react";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Avatar, Badge, Btn, Modal, Input } from "../../components/ui";

const BASE = "http://localhost:5000";
const POLL_INTERVAL = 3000;

export default function ChannelsPage() {
  const { user, apiCall } = useApp();
  const [channels, setChannels] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const rc = ROLE_COLORS[user?.role] || "#6C5CE7";
  const canCreate = user?.role === "admin" || user?.role === "faculty";
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelForm, setNewChannelForm] = useState({ name: "", description: "" });
  const [creatingChannel, setCreatingChannel] = useState(false);

  const handleToggle = async (channelId) => {
    try {
      await apiCall(`${BASE}/api/channels/${channelId}/toggle`, { method: 'PATCH' });
      // Refresh channel list
      const data = await apiCall(`${BASE}/api/channels`);
      setChannels(data);
      // Update active channel if needed
      if (active?.id === channelId) {
        const updated = data.find(ch => ch.id === channelId);
        setActive(updated || null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelForm.name.trim()) return;
    try {
      setCreatingChannel(true);
      await apiCall(BASE + "/api/channels", {
        method: "POST",
        body: JSON.stringify(newChannelForm)
      });
      setShowCreateModal(false);
      setNewChannelForm({ name: "", description: "" });
      const data = await apiCall(BASE + "/api/channels");
      setChannels(data);
      if (data.length > 0) setActive(data[data.length - 1]);
    } catch (err) {
      alert(err.message);
    } finally {
      setCreatingChannel(false);
    }
  };

  // Fetch all channels once
  useEffect(() => {
    const loadChannels = async () => {
      try {
        setLoadingChannels(true);
        const data = await apiCall(BASE + "/api/channels");
        setChannels(data);
        if (data.length > 0) setActive(data[0]);
      } catch (err) {
        console.error("Failed to load channels:", err);
      } finally {
        setLoadingChannels(false);
      }
    };
    loadChannels();
  }, [apiCall]);

  // Fetch messages for active channel + polling every 3 seconds
  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const data = await apiCall(BASE + "/api/channels/" + channelId + "/messages");
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [apiCall]);

  useEffect(() => {
    if (!active) return;
    setLoadingMsgs(true);
    fetchMessages(active.id).finally(() => setLoadingMsgs(false));

    // Start polling
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchMessages(active.id);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [active, fetchMessages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    if (!input.trim() || !active || sending) return;
    try {
      setSending(true);
      await apiCall(BASE + "/api/channels/" + active.id + "/messages", {
        method: "POST",
        body: JSON.stringify({ message: input.trim() })
      });
      setInput("");
      fetchMessages(active.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loadingChannels) return <div style={{ padding: 40, textAlign: "center" }}>Loading channels...</div>;

  const ch = active;

  return (
    <div className="cb-channel-layout" style={{ height: "calc(100vh - 64px)", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, borderRight: "1px solid #F0F0F0",
        display: "flex", flexDirection: "column", background: "#FAFAFA"
      }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid #F0F0F0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>Class Channels</div>
            {canCreate && (
              <button onClick={() => setShowCreateModal(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                <Icons.Plus size={16} color="#6C5CE7" />
              </button>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>Live chat with polling</div>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {channels.map(c => (
        <button key={c.id} onClick={() => { setActive(c); setMobileView("chat"); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px", border: "none", cursor: "pointer", textAlign: "left",
            background: active?.id === c.id ? "#F8F7FF" : "transparent",
            borderLeft: active?.id === c.id ? "3px solid #6C5CE7" : "3px solid transparent"
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "#EDE9FF",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12, color: "#6C5CE7", flexShrink: 0
          }}>
            {String(c.name || "").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: active?.id === c.id ? "#6C5CE7" : C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              #{c.name}
            </div>
            <div style={{ fontSize: 11, color: C.sub, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{c.description || "Course Channel"}</span>
              {(user?.role === "admin" || user?.role === "faculty") && (
                <button onClick={e => { e.stopPropagation(); handleToggle(c.id); }}
                  style={{ background: "none", border: "none", color: "#6C5CE7", cursor: "pointer", fontSize: 12 }}>
                  {c.is_active ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </div>
        </button>
      ))}
        </div>
      </aside>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Channel Header */}
        {ch && (
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 12, background: "#fff" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#6C5CE7" }}>
              {String(ch.name || "").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>#{ch.name}</div>
              <div style={{ fontSize: 12, color: C.sub }}>Polling for new messages every 3 seconds</div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {loadingMsgs && <div style={{ textAlign: "center", color: C.sub }}>Loading messages...</div>}
          {!loadingMsgs && messages.length === 0 && (
            <div style={{ textAlign: "center", color: C.sub, padding: 40 }}>No messages yet. Say hello!</div>
          )}
          {messages.map(m => {
            const isMe = m.user_id === user?.id;
            const senderRole = m.users?.role || "student";
            const senderColor = ROLE_COLORS[senderRole] || "#6C5CE7";
            return (
              <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar name={m.users?.name || "?"} size={32} color={senderColor} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: isMe ? rc : C.text }}>
                      {m.users?.name || "Unknown"} {isMe && "(You)"}
                    </span>
                    <Badge label={ROLE_LABELS[senderRole] || senderRole} color={senderColor} />
                    <span style={{ fontSize: 11, color: C.sub }}>
                      {new Date(m.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div style={{
                    background: isMe ? "#F8F7FF" : "#F4F4F4",
                    border: isMe ? "1px solid #E0D9FF" : "1px solid #EBEBEB",
                    borderRadius: "4px 12px 12px 12px",
                    padding: "10px 14px",
                    fontSize: 13.5,
                    color: C.text,
                    maxWidth: 520,
                    lineHeight: 1.5
                  }}>
                    {m.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 10, background: "#fff" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={ch ? "Message #" + ch.name + "…" : "Select a channel…"}
            disabled={!active}
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 12,
              border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14,
              fontFamily: "inherit", background: "#FAFAFA"
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            style={{
              width: 42, height: 42, borderRadius: 12, border: "none",
              background: rc, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: (!input.trim() || sending) ? 0.5 : 1
            }}
          >
            <Icons.Send size={16} color="#fff" />
          </button>
        </div>
      </div>

      {showCreateModal && (
        <Modal title="Create New Channel" onClose={() => setShowCreateModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Channel Name (no spaces)" placeholder="e.g. compsci-101" 
              value={newChannelForm.name} onChange={v => setNewChannelForm(f => ({ ...f, name: v.replace(/\s+/g, '-') }))} />
            <Input label="Description" placeholder="What is this channel for?" 
              value={newChannelForm.description} onChange={v => setNewChannelForm(f => ({ ...f, description: v }))} />
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <Btn color="#6F767E" full onClick={() => setShowCreateModal(false)}>Cancel</Btn>
              <Btn color="#6C5CE7" full onClick={handleCreateChannel} disabled={creatingChannel}>
                {creatingChannel ? "Creating..." : "Create Channel"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
