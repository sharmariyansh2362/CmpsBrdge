import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Btn, Badge, Input, Modal, Card } from "../../components/ui";

const BASE = "http://localhost:5000";

export default function LostFoundPage() {
  const { user, apiCall } = useApp();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "lost", title: "", description: "" });
  const [posting, setPosting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiCall(BASE + "/api/lost-found");
      setItems(data);
    } catch (err) {
      console.error("Failed to load lost & found:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [apiCall]);

  const filtered = items.filter(it =>
    (filter === "all" || it.category === filter) &&
    String(it.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const handlePost = async () => {
    if (!form.title.trim()) return;
    try {
      setPosting(true);
      await apiCall(BASE + "/api/lost-found", {
        method: "POST",
        body: JSON.stringify({ title: form.title, description: form.description, category: form.category })
      });
      setForm({ category: "lost", title: "", description: "" });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await apiCall(BASE + "/api/lost-found/" + id + "/resolve", { method: "PUT" });
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await apiCall(BASE + "/api/lost-found/" + id, { method: "DELETE" });
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading lost & found board...</div>;

  return (
    <div style={{ padding: 24 }} className="cb-space-5">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>Lost & Found</h2>
          <p style={{ fontSize: 13, color: C.sub, margin: "4px 0 0 0" }}>{filtered.length} items listed</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isAdmin && <Badge label="Admin View – Moderation" color="#EC4899" />}
          <Btn color="#6C5CE7" onClick={() => setShowModal(true)}>
            <Icons.Plus size={14} color="#fff" /> Post Item
          </Btn>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <Icons.Search size={14} color={C.sub} />
          </span>
          <input
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 14px 9px 36px", borderRadius: 12,
              border: "1.5px solid #EAEAEA", background: "#FAFAFA", fontSize: 13,
              outline: "none", fontFamily: "inherit", color: C.text, boxSizing: "border-box"
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "lost", "found"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 12, textTransform: "capitalize",
                background: filter === f ? (f === "lost" ? "#F97316" : f === "found" ? "#10B981" : "#6C5CE7") : "#F4F4F4",
                color: filter === f ? "#fff" : C.sub
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {filtered.map(it => {
          const catColor = it.category === "lost" ? "#F97316" : "#10B981";
          const isResolved = it.status === "resolved";
          return (
            <Card key={it.id} p={20}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: catColor + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icons.Package size={20} color={catColor} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Badge label={String(it.category || "").toUpperCase()} color={catColor} />
                  {isResolved && <Badge label="Resolved ✓" color="#10B981" />}
                </div>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 6px 0" }}>{it.title}</h4>
              <p style={{ fontSize: 13, color: C.sub, margin: "0 0 14px 0", lineHeight: 1.5 }}>{it.description || "No description provided."}</p>

              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{it.users?.name || "Anonymous"}</div>
                  <div style={{ fontSize: 11, color: C.sub }}>{new Date(it.created_at).toLocaleDateString("en-IN")}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {isAdmin && !isResolved && (
                    <button onClick={() => handleResolve(it.id)}
                      style={{ padding: "4px 10px", borderRadius: 8, background: "#ECFDF5", border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "#10B981" }}>
                      Mark Resolved
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(it.id)}
                      style={{ width: 30, height: 30, borderRadius: 8, background: "#FEF2F2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icons.Trash size={12} color="#EF4444" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Post Modal */}
      {showModal && (
        <Modal title="Post Lost / Found Item" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["lost", "found"].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, category: t }))}
                style={{
                  flex: 1, padding: "9px", borderRadius: 10,
                  border: "2px solid " + (form.category === t ? (t === "lost" ? "#F97316" : "#10B981") : "#EAEAEA"),
                  background: form.category === t ? (t === "lost" ? "#FFF7ED" : "#ECFDF5") : "#fff",
                  cursor: "pointer", fontWeight: 700, fontSize: 13,
                  color: form.category === t ? (t === "lost" ? "#F97316" : "#10B981") : C.sub
                }}>
                {t === "lost" ? "🔍 I Lost Something" : "📦 I Found Something"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Item Name / Title" placeholder="e.g. Blue Water Bottle"
              value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Describe the item, where it was lost/found…"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #EAEAEA", background: "#FAFAFA", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <Btn color={C.sub} full onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn color="#6C5CE7" full onClick={handlePost} disabled={posting}>
              {posting ? "Posting..." : "Post Item"}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
