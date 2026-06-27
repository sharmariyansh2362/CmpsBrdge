import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Card, Btn, Badge } from "../../components/ui";

const BASE = "http://localhost:5000";

export default function AnnouncementsPage() {
  const { user, apiCall } = useApp();
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Post form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [roleTarget, setRoleTarget] = useState("all");
  const [posting, setPosting] = useState(false);

  const fetchAnns = async () => {
    try {
      setLoading(true);
      const data = await apiCall(BASE + "/api/announcements");
      setAnns(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnns();
  }, [apiCall]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      setPosting(true);
      await apiCall(BASE + "/api/announcements", {
        method: "POST",
        body: JSON.stringify({ title, content, role_target: roleTarget })
      });
      setTitle("");
      setContent("");
      setRoleTarget("all");
      setShowForm(false);
      fetchAnns();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await apiCall(BASE + "/api/announcements/" + id, { method: "DELETE" });
      fetchAnns();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading announcements...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Announcements</h2>
          <p style={{ color: C.sub, fontSize: 13, margin: "4px 0 0 0" }}>{anns.length} announcements for your role</p>
        </div>
        {(user?.role === "faculty" || user?.role === "admin") && (
          <Btn onClick={() => setShowForm(f => !f)} color="#6C5CE7">
            {showForm ? "Cancel" : "+ Post Announcement"}
          </Btn>
        )}
      </div>

      {error && <div style={{ padding: 12, background: "#FFF0F0", color: "#E53E3E", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {/* Create Form */}
      {showForm && (
        <Card p={22} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>New Announcement</h3>
          <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Title</label>
              <input
                value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="Announcement title..."
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Content</label>
              <textarea
                value={content} onChange={e => setContent(e.target.value)} rows={4} required
                placeholder="Write announcement content..."
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Target Audience</label>
              <select value={roleTarget} onChange={e => setRoleTarget(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14 }}>
                <option value="all">Everyone (All Roles)</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn type="submit" color="#6C5CE7" disabled={posting}>{posting ? "Posting..." : "Post Announcement"}</Btn>
              <Btn color="#6F767E" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {anns.length === 0 ? (
          <Card p={20} style={{ textAlign: "center", color: C.sub }}>No announcements available for your role.</Card>
        ) : (
          anns.map(a => (
            <Card key={a.id} p={22}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, margin: 0 }}>{a.title}</h3>
                    <Badge
                      label={"For: " + a.role_target}
                      color={a.role_target === "all" ? "#6C5CE7" : a.role_target === "student" ? "#10B981" : "#F57C00"}
                    />
                  </div>
                  <p style={{ fontSize: 14, color: C.sub, margin: "0 0 10px 0", lineHeight: 1.6 }}>{a.content}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9A9FA5" }}>
                    <Icons.User size={12} color="#9A9FA5" />
                    <span>Posted by <b>{a.users?.name || "System"}</b></span>
                    <span>·</span>
                    <span>{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{ background: "#FEF2F2", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#EF4444", fontWeight: 700, fontSize: 12, flexShrink: 0, marginLeft: 12 }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
