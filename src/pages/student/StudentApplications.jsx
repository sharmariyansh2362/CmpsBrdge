import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Badge, Input } from "../../Components/ui";

const BASE = "";
const APP_TYPES = ["Leave Application", "Bonafide Certificate", "Fee Receipt", "Medical Leave", "Study Permission", "Course Enrollment"]; export default function StudentApplications() {
  const { apiCall } = useApp();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(APP_TYPES[0]);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await apiCall(BASE + "/api/student/applications");
      setApps(data);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [apiCall]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !description.trim()) return;
    try {
      setSubmitting(true);
      await apiCall(BASE + "/api/student/applications", {
        method: "POST",
        body: JSON.stringify({
          type,
          description: type === "Course Enrollment"
            ? `Course Enrollment Request: ${courseName}. ${description}`
            : description
        })
      });
      setDescription("");
      setType(APP_TYPES[0]);
      setShowForm(false);
      fetchApps();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) =>
    s === "approved" ? "#10B981" : s === "rejected" ? "#EF4444" : "#F97316";

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading your applications...</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>My Applications</h2>
          <p style={{ fontSize: 13, color: C.sub, margin: "4px 0 0 0" }}>Track leave, bonafide, and other submitted forms.</p>
        </div>
        <Btn color="#6C5CE7" onClick={() => setShowForm(f => !f)}>
          {showForm ? "Cancel" : "+ New Application"}
        </Btn>
      </div>

      {/* Application Form */}
      {showForm && (
        <Card p={24} style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Submit New Application</h3>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Application Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14 }}>
                {APP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              {type === "Course Enrollment" && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Course Name / Code</label>
                  <input
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    placeholder="e.g. Data Structures CS201"
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14 }}
                  />
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Details / Reason</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required rows={4}
                placeholder="Explain the reason for your application..."
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #EAEAEA", outline: "none", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
              />
            </div>
            <Btn type="submit" color="#6C5CE7" full disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Btn>
          </form>
        </Card>
      )}

      {/* Applications List */}
      {apps.length === 0 ? (
        <Card p={20} style={{ textAlign: "center", color: C.sub }}>No applications submitted yet.</Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {apps.map(a => (
            <Card key={a.id} p={20}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{a.type}</h4>
                    <Badge label={String(a.status || "").toUpperCase()} color={statusColor(a.status)} />
                  </div>
                  <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 10px 0", lineHeight: 1.5 }}>{a.description}</p>
                  <span style={{ fontSize: 12, color: "#9A9FA5" }}>
                    Submitted on {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
