import { useState, useRef, useEffect } from "react";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../Components/Icons";
import { Avatar, Badge, Btn, Input } from "../../Components/ui";

const MOCK_CHANNELS = [
  { id: "ch1", name: "general", description: "General classroom announcements and peer discussions.", is_active: true },
  { id: "ch2", name: "assignments", description: "Due dates, clarifications, and submission Q&A.", is_active: true },
  { id: "ch3", name: "exam-prep", description: "Important question discussions and resources.", is_active: true },
  { id: "ch4", name: "resource-sharing", description: "Lecture notes, reference books, and links.", is_active: true },
];

const MOCK_MESSAGES = {
  ch1: [
    { id: "m1", user_id: "f1", users: { name: "Dr. Priya Sharma", role: "faculty" }, message: "Welcome everyone to the official course channel! Feel free to ask questions regarding lecture schedules here.", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: "m2", user_id: "s1", users: { name: "Arjun Mehta", role: "student" }, message: "Thank you Professor! Will class notes be uploaded here or in the Course section?", created_at: new Date(Date.now() - 3600000 * 1.8).toISOString() },
    { id: "m3", user_id: "f1", users: { name: "Dr. Priya Sharma", role: "faculty" }, message: "Both, but official study material will always be uploaded in the 'My Courses' tab under 'Shared Notes'.", created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  ],
  ch2: [
    { id: "m4", user_id: "f1", users: { name: "Dr. Priya Sharma", role: "faculty" }, message: "Reminder: Assignment 1 (Complexity analysis & tree operations) is due by Friday 11:59 PM.", created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: "m5", user_id: "s2", users: { name: "Priya Tiwari", role: "student" }, message: "Professor, can we write the solution in Python or is C++ mandatory?", created_at: new Date(Date.now() - 3600000 * 23.5).toISOString() },
    { id: "m6", user_id: "f1", users: { name: "Dr. Priya Sharma", role: "faculty" }, message: "C++ or Java is highly preferred for the execution time analysis exercises.", created_at: new Date(Date.now() - 3600000 * 23.2).toISOString() },
  ],
  ch3: [
    { id: "m7", user_id: "s1", users: { name: "Arjun Mehta", role: "student" }, message: "Has anyone solved page 4 dynamic programming question from the reference booklet?", created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
    { id: "m8", user_id: "s3", users: { name: "Vaibhav", role: "student" }, message: "Yes, I got O(N*W) using the knapsack algorithm approach.", created_at: new Date(Date.now() - 3600000 * 47.8).toISOString() },
  ],
  ch4: [
    { id: "m9", user_id: "f1", users: { name: "Dr. Priya Sharma", role: "faculty" }, message: "I have shared the slide deck link for Red-Black Trees in the Course tab, check it out.", created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  ],
};

export default function ChannelsPage() {
  const { user } = useApp();
  const [channels, setChannels] = useState(MOCK_CHANNELS);
  const [activeChannel, setActiveChannel] = useState(MOCK_CHANNELS[0]);
  const [messagesMap, setMessagesMap] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  const bottomRef = useRef(null);
  const rc = ROLE_COLORS[user?.role] || C.primary;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel.id, messagesMap[activeChannel.id]?.length]);

  const handleSendMessage = () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const newMessage = {
      id: `msg-${Date.now()}`,
      user_id: user?.id || "s1",
      users: {
        name: user?.name || "Arjun Mehta",
        role: user?.role || "student"
      },
      message: input.trim(),
      created_at: new Date().toISOString(),
      sent: true // indicator for double ticks
    };

    const currentChannelMsgs = messagesMap[activeChannel.id] || [];
    setMessagesMap({
      ...messagesMap,
      [activeChannel.id]: [...currentChannelMsgs, newMessage]
    });

    setInput("");
    setSending(false);
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    const formattedName = newChannelName.toLowerCase().replace(/\s+/g, "-");
    const newChan = {
      id: `ch-${Date.now()}`,
      name: formattedName,
      description: newChannelDesc || "Class discussion channel",
      is_active: true
    };

    setChannels([...channels, newChan]);
    setMessagesMap({
      ...messagesMap,
      [newChan.id]: []
    });

    setActiveChannel(newChan);
    setShowCreateModal(false);
    setNewChannelName("");
    setNewChannelDesc("");
  };

  // Delete message feature
  const handleDeleteMessage = (msgId) => {
    const currentChannelMsgs = messagesMap[activeChannel.id] || [];
    const updated = currentChannelMsgs.filter(m => m.id !== msgId);
    setMessagesMap({
      ...messagesMap,
      [activeChannel.id]: updated
    });
  };

  // Remove/Delete channel feature
  const handleDeleteChannel = (chId) => {
    if (window.confirm("Are you sure you want to delete this channel and all its chats?")) {
      const updatedCh = channels.filter(c => c.id !== chId);
      setChannels(updatedCh);
      if (activeChannel.id === chId && updatedCh.length > 0) {
        setActiveChannel(updatedCh[0]);
      }
    }
  };

  const activeMessages = messagesMap[activeChannel.id] || [];

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
      
      {/* Channels Sidebar List */}
      <aside style={{ display: "flex", flexDirection: "column", background: "#FDFDFD", borderRight: `1.5px solid ${C.border}` }}>
        <div style={{ padding: 18, borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>Course Channels</h3>
            <span style={{ fontSize: 11, color: C.sub }}>Interactive Class Chat</span>
          </div>
          {(user?.role === "admin" || user?.role === "faculty") && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: "none", background: C.primarySoft,
                color: C.primary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <Icons.Plus size={15} />
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2, padding: 8 }}>
          {channels.map(ch => {
            const active = activeChannel.id === ch.id;
            const canDeleteChannel = user?.role === "admin" || user?.role === "faculty";
            return (
              <div
                key={ch.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 10,
                  background: active ? rc + "14" : "transparent",
                  paddingRight: 6
                }}
              >
                <button
                  onClick={() => setActiveChannel(ch)}
                  style={{
                    flex: 1, border: "none", background: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    color: active ? rc : C.text,
                    textAlign: "left", transition: "all 0.15s"
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700, opacity: 0.7 }}>#</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }} className="cb-text-ellipsis">{ch.name}</div>
                    <div style={{ fontSize: 10.5, color: C.sub }} className="cb-text-ellipsis">{ch.description}</div>
                  </div>
                </button>
                {canDeleteChannel && (
                  <button
                    onClick={() => handleDeleteChannel(ch.id)}
                    style={{
                      background: "none", border: "none", color: C.danger, cursor: "pointer",
                      width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    title="Delete Channel"
                  >
                    <Icons.Trash size={12} color={C.danger} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Messaging Area */}
      <div style={{ display: "flex", flexDirection: "column", background: "#f4f1eb" }}>
        {/* Channel Header Banner */}
        <header style={{ padding: "14px 20px", borderBottom: `1.5px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>#{activeChannel.name}</h4>
            <p style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{activeChannel.description}</p>
          </div>
          <Badge label={`Online`} color={C.success} />
        </header>

        {/* Messaging Box - Styled Like WhatsApp */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {activeMessages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.sub, padding: 40 }}>
              <Icons.Chat size={32} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 700 }}>No messages yet</div>
              <p style={{ fontSize: 12, marginTop: 4 }}>Be the first to say hello in #{activeChannel.name}!</p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isFaculty = msg.users?.role === "faculty";
              const isMe = msg.user_id === user?.id || msg.users?.name === user?.name;
              const senderColor = isFaculty ? C.orange : C.teal;
              const canDeleteMsg = isMe || user?.role === "admin" || user?.role === "faculty";

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    width: "100%"
                  }}
                >
                  <div
                    style={{
                      background: isMe ? "#e2f7cb" : "#ffffff",
                      borderRadius: isMe ? "12px 0px 12px 12px" : "0px 12px 12px 12px",
                      padding: "8px 12px 6px 12px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                      maxWidth: "70%",
                      minWidth: "120px",
                      position: "relative"
                    }}
                  >
                    {/* Sender Name for other's messages */}
                    {!isMe && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: senderColor }}>
                          {msg.users?.name}
                        </span>
                        <span style={{ fontSize: 9.5, opacity: 0.6, background: senderColor + "15", color: senderColor, padding: "1px 5px", borderRadius: 4, fontWeight: 800 }}>
                          {ROLE_LABELS[msg.users?.role] || msg.users?.role}
                        </span>
                      </div>
                    )}

                    {/* Message Text */}
                    <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.45, paddingRight: isMe ? "44px" : "32px", paddingBottom: "2px" }}>
                      {msg.message}
                    </div>

                    {/* Timestamp & double ticks */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 4,
                        right: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 9.5,
                        color: "#747d8c",
                        userSelect: "none"
                      }}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isMe && (
                        <span style={{ color: "#34b7f1", fontSize: 11, fontWeight: "bold", display: "flex" }}>
                          ✓✓
                        </span>
                      )}
                    </div>

                    {/* Message Delete options in context menu hover */}
                    {canDeleteMsg && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          opacity: 0,
                          transition: "opacity 0.15s",
                          padding: 2
                        }}
                        className="cb-message-delete-btn"
                        title="Delete message"
                      >
                        <Icons.X size={10} color={C.sub} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* CSS to show delete button on hover */}
        <style dangerouslySetInnerHTML={{__html: `
          div:hover > .cb-message-delete-btn {
            opacity: 1 !important;
          }
        `}} />

        {/* Message Input controls - WhatsApp style */}
        <div style={{ padding: "12px 16px", background: "#f0f0f0", display: "flex", gap: 10, alignItems: "center" }}>
          {/* Simulation attachment clip */}
          <button
            onClick={() => alert("Simulation: Document/Image attachment upload click!")}
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "none", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <Icons.Paperclip size={18} color="#54656f" />
          </button>

          <input
            type="text"
            placeholder="Type a message"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSendMessage()}
            style={{
              flex: 1, border: "none", borderRadius: 20, padding: "10px 18px",
              fontSize: 13.5, background: "#ffffff", outline: "none", fontFamily: "inherit", color: C.text,
              boxShadow: "0 1px 1px rgba(0,0,0,0.05)"
            }}
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "none", background: input.trim() ? "#00a884" : "#54656f",
              cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s"
            }}
          >
            <Icons.Send size={15} color="#fff" />
          </button>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 420,
            display: "flex", flexDirection: "column", gap: 16
          }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Create Channel</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>

            <Input label="Channel Name" placeholder="e.g. exam-queries" value={newChannelName} onChange={setNewChannelName} />
            <Input label="Purpose / Description" placeholder="What is this channel for?" value={newChannelDesc} onChange={setNewChannelDesc} />

            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleCreateChannel} style={{ flex: 1 }} disabled={!newChannelName.trim()}>Create Channel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
