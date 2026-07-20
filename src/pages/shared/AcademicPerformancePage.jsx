import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { Card, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const gradeFromPoint = (gp) => {
  if (gp >= 10) return "A+";
  if (gp >= 9) return "A";
  if (gp >= 8) return "B+";
  if (gp >= 7) return "B";
  if (gp >= 6) return "C";
  return "F";
};
const pointFromGrade = (g) => ({ "A+": 10, A: 9, "B+": 8, B: 7, C: 6, F: 0 }[g] ?? 0);

export default function AcademicPerformancePage() {
  const { user, apiCall } = useApp();
  const [loading, setLoading] = useState(true);

  // Student state
  const [grades, setGrades] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [activeSem, setActiveSem] = useState(1);

  // Faculty/Admin state
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courseGrades, setCourseGrades] = useState([]);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [courseStudents, setCourseStudents] = useState([]);
  const [semester, setSemester] = useState("1");
  const [internalMarks, setInternalMarks] = useState("");
  const [externalMarks, setExternalMarks] = useState("");

  const isStudent = user.role === "student";

  useEffect(() => {
    if (isStudent) {
      Promise.all([
        apiCall("/api/academic/me/grades"),
        apiCall("/api/academic/me/summary")
      ])
        .then(([g, s]) => {
          setGrades(g || []);
          setSemesters(s.semesters || []);
          setCgpa(s.cgpa || 0);
          if (s.semesters?.length) setActiveSem(s.semesters[s.semesters.length - 1].semester);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      apiCall("/api/faculty/courses")
        .then(data => {
          setCourses(data || []);
          if (data?.length) setSelectedCourse(data[0].id);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

useEffect(() => {
  if (!isStudent && selectedCourse) {
    apiCall(`/api/academic/course/${selectedCourse}`)
      .then(data => setCourseGrades(data || []))
      .catch(err => console.error(err));

    apiCall(`/api/attendance/course/${selectedCourse}/students`)
      .then(data => setCourseStudents(data || []))
      .catch(err => console.error(err));
  }
}, [selectedCourse]);

  const handleAddGrade = async () => {
    if (!studentId || !internalMarks || !externalMarks) return;
    const internal = parseFloat(internalMarks);
    const external = parseFloat(externalMarks);
    const total = internal + external;
    const grade_point = Math.min(10, Math.round((total / 150) * 10));
    const grade = gradeFromPoint(grade_point);

    try {
      await apiCall("/api/academic/grade", {
        method: "POST",
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedCourse,
          semester: parseInt(semester),
          internal_marks: internal,
          external_marks: external,
          total_marks: total,
          grade,
          grade_point
        })
      });
      alert("Grade saved successfully!");
      setShowAddGradeModal(false);
      setStudentId(""); setInternalMarks(""); setExternalMarks("");
      apiCall(`/api/academic/course/${selectedCourse}`).then(data => setCourseGrades(data || []));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  const filteredGrades = grades.filter(g => g.semester === activeSem);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px", borderRadius: "20px", color: "#fff"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Academic Performance Tracker</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
          {isStudent
            ? "View your semester grades, SGPA trends, and cumulative performance."
            : "Assign and manage grades for your courses."}
        </p>
      </div>

      {isStudent ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="cb-grid-2">
            <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>SGPA Progress Trend</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={semesters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                    <XAxis dataKey="semester" tickFormatter={(v) => `Sem ${v}`} stroke={C.sub} style={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} stroke={C.sub} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sgpa" stroke={C.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSgpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, textAlign: "center" }}>
                <Icons.Award size={22} color={C.success} />
                <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>{cgpa}</div>
                <div style={{ fontSize: 12.5, color: C.sub }}>Cumulative GPA (CGPA)</div>
              </Card>
              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, textAlign: "center" }}>
                <Icons.CheckCircle size={22} color={C.primary} />
                <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>
                  {semesters.reduce((s, sem) => s + sem.totalCredits, 0)}
                </div>
                <div style={{ fontSize: 12.5, color: C.sub }}>Credits Completed</div>
              </Card>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, background: "#fff", padding: 4, borderRadius: 12, border: `1.5px solid ${C.border}`, overflowX: "auto" }}>
            {(semesters.length ? semesters.map(s => s.semester) : [1]).map(sem => {
              const active = activeSem === sem;
              return (
                <button
                  key={sem}
                  onClick={() => setActiveSem(sem)}
                  style={{
                    border: "none", background: active ? ROLE_COLORS[user.role] : "transparent",
                    color: active ? "#fff" : C.sub, padding: "8px 18px", borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap"
                  }}
                >
                  Semester {sem}
                </button>
              );
            })}
          </div>

          <Card p={0}>
            <div style={{ overflowX: "auto" }}>
              <table className="cb-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr style={{ background: "#F8F7FF" }}>
                    <th style={{ padding: "16px 20px" }}>Course Code</th>
                    <th style={{ padding: "16px 20px" }}>Course Name</th>
                    <th style={{ padding: "16px 20px" }}>Credits</th>
                    <th style={{ padding: "16px 20px" }}>Internal</th>
                    <th style={{ padding: "16px 20px" }}>External</th>
                    <th style={{ padding: "16px 20px" }}>Total</th>
                    <th style={{ padding: "16px 20px" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "32px", textAlign: "center", color: C.sub }}>
                        No grade records uploaded for Semester {activeSem} yet.
                      </td>
                    </tr>
                  ) : (
                    filteredGrades.map(g => (
                      <tr key={g.id}>
                        <td style={{ padding: "16px 20px", fontWeight: 700 }}>{g.courses?.code}</td>
                        <td style={{ padding: "16px 20px" }}>{g.courses?.name}</td>
                        <td style={{ padding: "16px 20px", color: C.sub }}>{g.courses?.credits}</td>
                        <td style={{ padding: "16px 20px" }}>{g.internal_marks}</td>
                        <td style={{ padding: "16px 20px" }}>{g.external_marks}</td>
                        <td style={{ padding: "16px 20px", fontWeight: 700 }}>{g.total_marks}</td>
                        <td style={{ padding: "16px 20px" }}>
                          <Badge label={g.grade} color={g.grade?.startsWith("A") ? C.success : g.grade?.startsWith("B") ? C.orange : C.danger} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Select Course</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, background: "#F8F7FF", outline: "none" }}
              >
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <Btn onClick={() => setShowAddGradeModal(true)}>+ Assign / Edit Grade</Btn>
          </div>

          <Card p={0}>
            <div style={{ overflowX: "auto" }}>
              <table className="cb-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr style={{ background: "#F8F7FF" }}>
                    <th style={{ padding: "16px 20px" }}>Roll No</th>
                    <th style={{ padding: "16px 20px" }}>Name</th>
                    <th style={{ padding: "16px 20px" }}>Internal</th>
                    <th style={{ padding: "16px 20px" }}>External</th>
                    <th style={{ padding: "16px 20px" }}>Total</th>
                    <th style={{ padding: "16px 20px" }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {courseGrades.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: 32, textAlign: "center", color: C.sub }}>No grades recorded yet.</td></tr>
                  ) : (
                    courseGrades.map(g => (
                      <tr key={g.id}>
                        <td style={{ padding: "16px 20px", fontWeight: 700 }}>{g.students?.enrollment_no}</td>
                        <td style={{ padding: "16px 20px" }}>{g.students?.users?.name}</td>
                        <td style={{ padding: "16px 20px" }}>{g.internal_marks}</td>
                        <td style={{ padding: "16px 20px" }}>{g.external_marks}</td>
                        <td style={{ padding: "16px 20px", fontWeight: 700 }}>{g.total_marks}</td>
                        <td style={{ padding: "16px 20px" }}>
                          <Badge label={g.grade} color={g.grade?.startsWith("A") ? C.success : g.grade?.startsWith("B") ? C.orange : C.danger} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {showAddGradeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowAddGradeModal(false)}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 18 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Assign / Update Grade</h3>
              <button onClick={() => setShowAddGradeModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>

<div>
  <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Student</label>
  <select value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
    <option value="">Select a student</option>
    {courseStudents.map(s => (
      <option key={s.id} value={s.id}>{s.enrollment_no} — {s.users?.name}</option>
    ))}
  </select>
</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 10 }}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Internal Marks (Max 50)" value={internalMarks} onChange={setInternalMarks} />
              <Input label="External Marks (Max 100)" value={externalMarks} onChange={setExternalMarks} />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="outline" onClick={() => setShowAddGradeModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleAddGrade} style={{ flex: 1 }}>Save Grade</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}