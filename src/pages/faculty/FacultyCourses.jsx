import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Badge, Btn, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { COURSES, ALL_STUDENTS } from "../../constants/data";

const MODULES_DATA = [
  { num: 1, title: "Introduction & Foundational Concepts", desc: "Overview of basic paradigms, complexity bounds, and system conventions." },
  { num: 2, title: "Core Data Management structures", desc: "Linked structures, indexing protocols, tree traversals, and optimization heuristics." },
  { num: 3, title: "Algorithmic Paradigms", desc: "Divide and conquer, greedy strategies, dynamic programming, and computational limits." },
  { num: 4, title: "System Integrations & Network Layers", desc: "Concurrency, threads management, protocol standards, and distributed memory setups." },
];

export default function FacultyCourses() {
  const { user, apiCall } = useApp();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, students, resources
  const [loading, setLoading] = useState(true);
  
  // Shared resources state
  const [resources, setResources] = useState([
    { id: 1, title: "Semester Syllabus PDF", desc: "Complete academic syllabus and grading breakdown guidelines.", author: "Dr. Priya Sharma", date: "Jul 05, 2025" },
    { id: 2, title: "Lecture 1 Notes - Complexity Analysis", desc: "Handwritten notes covering Big-O bounds and recursion trees.", author: "Arjun Mehta (Student)", date: "Jul 08, 2025" }
  ]);

  // Form state for uploading resources
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/faculty/courses");
      if (data && data.length > 0) {
        setCourses(data);
      } else {
        const facultyName = user?.name || "Dr. Priya Sharma";
        setCourses(COURSES.filter(c => c.faculty === facultyName));
      }
    } catch (err) {
      console.error("Failed to load faculty courses:", err);
      const facultyName = user?.name || "Dr. Priya Sharma";
      setCourses(COURSES.filter(c => c.faculty === facultyName));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [apiCall]);

  const handleShareResource = () => {
    if (!resTitle.trim() || !resDesc.trim()) return;
    const newRes = {
      id: resources.length + 1,
      title: resTitle,
      desc: resDesc,
      author: `${user?.name || "Faculty"} (Faculty)`,
      date: "Today"
    };
    setResources([newRes, ...resources]);
    setResTitle("");
    setResDesc("");
    alert("Class note shared successfully!");
  };

  if (loading) return <div style={{ padding: 40, color: C.sub }}>Loading assigned courses...</div>;

  if (selectedCourse) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Course Header Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${C.orange} 0%, #FFA726 100%)`,
          padding: "24px 32px",
          borderRadius: "20px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button 
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer",
                  width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Icons.ChevLeft size={16} color="#fff" />
              </button>
              <Badge label={selectedCourse.code} color="rgba(255, 255, 255, 0.2)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 10, marginBottom: 4 }}>{selectedCourse.name}</h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.85)" }}>
              Credits: <b>{selectedCourse.credits}</b> &bull; Semester: <b>{selectedCourse.semester}</b>
            </p>
          </div>
          <div>
            <Badge label={`Instructor: ${user?.name || selectedCourse.faculty_name}`} color="#fff" />
          </div>
        </div>

        {/* Tab Selectors */}
        <div style={{ display: "flex", gap: 8, background: "#fff", padding: 4, borderRadius: 12, border: `1.5px solid ${C.border}`, alignSelf: "flex-start" }}>
          {[
            { id: "overview", label: "Syllabus Modules", icon: Icons.Layers },
            { id: "students", label: "Enrolled Students", icon: Icons.Users },
            { id: "resources", label: "Notes & Resources", icon: Icons.FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  background: active ? C.orange : "transparent",
                  color: active ? "#fff" : C.sub,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                <Icon size={15} color={active ? "#fff" : C.sub} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="cb-grid-2">
            {MODULES_DATA.map(mod => (
              <Card key={mod.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: C.orangeSoft, color: C.orange,
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0
                }}>
                  {mod.num}
                </div>
                <div>
                  <h4 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>{mod.title}</h4>
                  <p style={{ fontSize: 12.5, color: C.sub, marginTop: 6, lineHeight: 1.5 }}>{mod.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "students" && (
          <Card p={0}>
            <div style={{ overflowX: "auto" }}>
              <table className="cb-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr style={{ background: "#F8F7FF" }}>
                    <th style={{ padding: "16px 20px" }}>Roll Number</th>
                    <th style={{ padding: "16px 20px" }}>Name</th>
                    <th style={{ padding: "16px 20px" }}>Email</th>
                    <th style={{ padding: "16px 20px" }}>Section</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_STUDENTS.filter(s => s.section === (user?.name?.includes("Priya") ? "B" : "A")).map(student => (
                    <tr key={student.id}>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{student.id}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{student.name}</td>
                      <td style={{ padding: "16px 20px", color: C.sub }}>{student.email}</td>
                      <td style={{ padding: "16px 20px", color: C.sub }}>Section {student.section}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "resources" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="cb-grid-sidebar">
            {/* Resources List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h4 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>Class Notes & Resources</h4>
              {resources.map(res => (
                <Card key={res.id} p={18} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="cb-flex-between">
                    <h5 style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{res.title}</h5>
                    <span style={{ fontSize: 11.5, color: C.sub }}>{res.date}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>{res.desc}</p>
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }} className="cb-flex-between">
                    <span style={{ fontSize: 11.5, color: C.sub }}>Uploaded by: <b>{res.author}</b></span>
                    <button style={{
                      background: "none", border: "none", color: C.orange, cursor: "pointer",
                      fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                    }} onClick={() => alert("Note resource download/access link click simulated!")}>
                      <Icons.Download size={13} color={C.orange} /> Access Notes
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Upload form */}
            <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h4 style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>Share Class Resource</h4>
              <Input label="Title of Note / Document" placeholder="e.g. Unit 2 Tree traversals guide" value={resTitle} onChange={setResTitle} />
              <div className="cb-input-wrap">
                <label className="cb-label">Description / Core Topics</label>
                <textarea
                  placeholder="Key concepts covered or links..."
                  rows={4}
                  value={resDesc}
                  onChange={e => setResDesc(e.target.value)}
                  style={{
                    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text, resize: "none"
                  }}
                />
              </div>
              <Btn onClick={handleShareResource} style={{ width: "100%" }} color={C.orange}>
                Upload Note
              </Btn>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {courses.map(c => (
          <Card 
            key={c.id} 
            p={20} 
            style={{ cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 124, 0, 0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
            onClick={() => { setSelectedCourse(c); setActiveTab("overview"); }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, background: '#FFF3E0', color: '#F57C00', padding: '4px 8px', borderRadius: 6 }}>{c.code}</span>
              <Badge label={`Sem ${c.semester}`} color="#F57C00" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{c.name}</h3>
            <p style={{ fontSize: 13, color: C.sub, margin: '0 0 12px 0' }}>Credits: {c.credits} · Dept: {c.department}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
