import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C } from "../../constants/colors";
import { Card, Btn } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

const BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const { user, apiCall } = useApp();
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [semester, setSemester] = useState(user?.semester?.match(/\d+/)?.[0] || "5");
  const [section, setSection] = useState(user?.section || "A");
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    semester: "5", section: "A", day: "Monday",
    time_slot: "", subject: "", code: "", room: "", teacher: ""
  });

  const isAdmin = user?.role === "admin";

  const loadTimetable = () => {
    setLoading(true);
    apiCall(`${BASE}/api/timetable?semester=${semester}&section=${section}`)
      .then(data => setTimetable(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTimetable();
  }, [semester, section]);

  const classes = timetable.filter(t => t.day === selectedDay);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ semester, section, day: selectedDay, time_slot: "", subject: "", code: "", room: "", teacher: "" });
    setShowForm(true);
  };

  const openEditForm = (cls) => {
    setEditingId(cls.id);
    setForm({ ...cls });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await apiCall(`${BASE}/api/timetable/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form)
        });
      } else {
        await apiCall(`${BASE}/api/timetable`, {
          method: "POST",
          body: JSON.stringify(form)
        });
      }
      setShowForm(false);
      loadTimetable();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    try {
      await apiCall(`${BASE}/api/timetable/${id}`, { method: "DELETE" });
      loadTimetable();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Timetable & Schedules</h2>
        {isAdmin && (
          <Btn onClick={openAddForm}>+ Add Class</Btn>
        )}
      </div>

      {/* Semester + Section filters */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Semester</label>
          <select
            value={semester}
            onChange={e => setSemester(e.target.value)}
            style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, background: "#F8F7FF", outline: "none", color: C.text }}
          >
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Section</label>
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, background: "#F8F7FF", outline: "none", color: C.text }}
          >
            {["A","B","C","D"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {DAYS.map(day => {
          const active = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                border: "none",
                background: active ? C.primary : "#fff",
                color: active ? "#fff" : C.text,
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(108, 99, 255, 0.04)",
                whiteSpace: "nowrap"
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Add/Edit form (admin only) */}
      {isAdmin && showForm && (
        <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ fontWeight: 800, color: C.text }}>{editingId ? "Edit Class" : "Add Class"}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} style={inputStyle}>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select value={form.section} onChange={e => setForm({...form, section: e.target.value})} style={inputStyle}>
              {["A","B","C","D"].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <select value={form.day} onChange={e => setForm({...form, day: e.target.value})} style={inputStyle}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input placeholder="Time slot e.g. 09:00 - 10:00" value={form.time_slot} onChange={e => setForm({...form, time_slot: e.target.value})} style={inputStyle} />
            <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={inputStyle} />
            <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} style={inputStyle} />
            <input placeholder="Room" value={form.room} onChange={e => setForm({...form, room: e.target.value})} style={inputStyle} />
            <input placeholder="Teacher" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={handleSubmit}>{editingId ? "Save Changes" : "Add Class"}</Btn>
            <button onClick={() => setShowForm(false)} style={{ border: `1.5px solid ${C.border}`, background: "#fff", borderRadius: 10, padding: "8px 16px", cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      {/* Classes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.sub }}>Loading...</div>
        ) : classes.length === 0 ? (
          <Card style={{ padding: "40px 20px", textAlign: "center", color: C.sub }}>
            <Icons.Calendar size={32} style={{ marginBottom: 12, color: C.sub }} />
            <div style={{ fontSize: 14, fontWeight: 700 }}>No classes scheduled for {selectedDay}.</div>
          </Card>
        ) : (
          classes.map(cls => (
            <Card key={cls.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: 18 }}>
              <div style={{ width: 150, paddingRight: 16, borderRight: `1.5px solid ${C.border}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.primary }}>Time Slot</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>{cls.time_slot}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, background: C.primarySoft, color: C.primary, padding: "2px 8px", borderRadius: 4 }}>
                    {cls.code}
                  </span>
                  <span style={{ fontSize: 11.5, color: C.sub }}>{cls.room}</span>
                </div>
                <h4 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>{cls.subject}</h4>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: C.sub }}>Instructor</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{cls.teacher}</div>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEditForm(cls)} style={{ border: `1.5px solid ${C.border}`, background: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>Edit</button>
                  <button onClick={() => handleDelete(cls.id)} style={{ border: "1.5px solid #EF4444", background: "#FEE2E2", color: "#EF4444", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>Delete</button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  border: `1.5px solid #E5E5FA`, borderRadius: 10, padding: "8px 12px",
  fontSize: 13, outline: "none", fontFamily: "inherit"
};