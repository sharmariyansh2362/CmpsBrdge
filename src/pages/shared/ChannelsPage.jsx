import { useState, useRef, useEffect, useCallback } from "react";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../Components/Icons";
import { Badge, Btn, Input } from "../../Components/ui";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export default function ChannelsPage() {
  const { user, apiCall } = useApp();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const rc = ROLE_COLORS[user?.role] || C.primary;

  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const data = await apiCall(`${BASE}/api/channels/${channelId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [apiCall]);

  const fetchChannels = useCallback(async () => {
    try {
      const data = await apiCall(`${BASE}/api/channels`);
      setChannels(data);
      if (data.length > 0) {
        setActiveChannel(prev => prev || data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch channels:", err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!activeChannel?.id) return;
    setMessages([]);
    fetchMessages(activeChannel.id);
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeChannel.id), 3000);
    return () => clearInterval(pollRef.current);
  }, [activeChannel?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || sending || !activeChannel) return;
    setSending(true);
    try {
      await apiCall(`${BASE}/api/channels/${activeChannel.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: input.trim() })
      });
      setInput("");
      fetchMessages(activeChannel.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const formattedName = newChannelName.toLowerCase().replace(/\s+/g, "-");
      await apiCall(`${BASE}/api/channels`, {
        method: "POST",
        body: JSON.stringify({ name: formattedName, description: newChannelDesc })
      });
      setShowCreateModal(false);
      setNewChannelName("");
      setNewChannelDesc("");
      fetchChannels();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading channels...</div>;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "240px 1fr",
      height: "calc(100vh - 120px)",
      background: "#fff",
      borderRadius: 16,
      border: `1.5px solid ${C.border}`,
      overflow: "hidden"
    }} className="cb-channel-layout">

      <aside style={{ display: "flex", flexDirection: "column", background: "#FDFDFD", borderRight: `1.5px solid ${C.border}` }}>
        <div style={{ padding: 18, borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>Channels</h3>
            <span style={{ fontSize: 11, color: C.sub }}>Class Chat</span>
          </div>
          {(user?.role === "admin" || user?.role === "faculty") && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none",
                background: C.primarySoft, color: C.primary, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Icons.Plus size={15} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, padding: 8 }}>
          {channels.length === 0 ? (
            <div style={{ padding: 16, textAlign: "center", color: C.sub, fontSize: 12 }}>
              No channels yet
            </div>
          ) : (
            channels.map(ch => {
              const active = activeChannel?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch)}
                  style={{
                    flex: 1, border: "none", borderRadius: 10,
                    background: active ? rc + "14" : "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 10, padding: "10px 12px", color: active ? rc : C.text,
                    textAlign: "left", transition: "all 0.15s"
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.7 }}>#</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{ch.name}</div>
                    <div style={{ fontSize: 10.5, color: C.sub }}>{ch.description}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", background: "#f4f1eb" }}>
        {activeChannel ? (
          <>
            <header style={{ padding: "14px 20px", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>#{activeChannel.name}</h4>
                <p style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{activeChannel.description}</p>
              </div>
              <Badge label="Live" color={C.success} />
            </header>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.sub, padding: 40 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>No messages yet</div>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Be the first to say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.user_id === user?.id;
                  const isFaculty = msg.users?.role === "faculty";
                  const senderColor = isFaculty ? C.orange : C.teal;
                  return (
                    <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                      <div style={{
                        background: isMe ? "#e2f7cb" : "#ffffff",
                        borderRadius: isMe ? "12px 0px 12px 12px" : "0px 12px 12px 12px",
                        padding: "8px 12px 6px 12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                        maxWidth: "70%", minWidth: "120px"
                      }}>
                        {!isMe && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 800, color: senderColor }}>
                              {msg.users?.name}
                            </span>
                            <span style={{ fontSize: 9.5, background: senderColor + "15", color: senderColor, padding: "1px 5px", borderRadius: 4, fontWeight: 800 }}>
                              {ROLE_LABELS[msg.users?.role] || msg.users?.role}
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.45 }}>
                          {msg.message}
                        </div>
                        <div style={{ fontSize: 9.5, color: "#747d8c", textAlign: "right", marginTop: 4 }}>
                          {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          {isMe && <span style={{ color: "#34b7f1", marginLeft: 4 }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "12px 16px", background: "#f0f0f0", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="text"
                placeholder="Type a message"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                style={{
                  flex: 1, border: "none", borderRadius: 20, padding: "10px 18px",
                  fontSize: 13.5, background: "#ffffff", outline: "none",
                  fontFamily: "inherit", color: C.text
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || sending}
                style={{
                  width: 38, height: 38, borderRadius: "50%", border: "none",
                  background: input.trim() ? "#00a884" : "#54656f",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Icons.Send size={15} color="#fff" />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.sub }}>
            Select a channel to start chatting
          </div>
        )}
      </div>

      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 420,
            display: "flex", flexDirection: "column", gap: 16
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Create Channel</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>
            <Input label="Channel Name" placeholder="e.g. exam-queries" value={newChannelName} onChange={setNewChannelName} />
            <Input label="Description" placeholder="What is this channel for?" value={newChannelDesc} onChange={setNewChannelDesc} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleCreateChannel} style={{ flex: 1 }} disabled={!newChannelName.trim()}>Create</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}