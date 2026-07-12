import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { ACADEMIC_GRADES, ACADEMIC_SEMESTERS } from "../../constants/data";
import { Card, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AcademicPerformancePage() {
  const { user } = useApp();
  const [grades, setGrades] = useState(ACADEMIC_GRADES);
  const [semesters, setSemesters] = useState(ACADEMIC_SEMESTERS);
  const [activeSem, setActiveSem] = useState(5);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);

  // Form states for adding grade
  const [studentRoll, setStudentRoll] = useState("");
  const [courseCode, setCourseCode] = useState("CS501");
  const [selectedSem, setSelectedSem] = useState("5");
  const [internalMarks, setInternalMarks] = useState("");
  const [externalMarks, setExternalMarks] = useState("");
  const [assignedGrade, setAssignedGrade] = useState("A");

  const handleAddGrade = () => {
    if (!studentRoll || !internalMarks || !externalMarks) return;
    const internal = parseFloat(internalMarks);
    const external = parseFloat(externalMarks);
    const total = internal + external;
    const gradePoint = assignedGrade === "A+" ? 10 : assignedGrade === "A" ? 9 : assignedGrade === "B+" ? 8 : assignedGrade === "B" ? 7 : 6;

    const newGrade = {
      course: courseCode,
      name: courseCode === "CS501" ? "Data Structures & Algorithms" : courseCode === "CS502" ? "Operating Systems" : "Discrete Mathematics",
      credits: 4,
      grade: assignedGrade,
      gradePoint,
      internal,
      external,
      total,
      semester: parseInt(selectedSem),
    };

    setGrades([newGrade, ...grades]);
    setShowAddGradeModal(false);
    setStudentRoll("");
    setInternalMarks("");
    setExternalMarks("");
    alert("Grade successfully updated for the student.");
  };

  const filteredGrades = grades.filter(g => g.semester === activeSem);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px",
        borderRadius: "20px",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Academic Performance Tracker</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: "600px" }}>
            {user.role === "student"
              ? "View your semester grades, SGPA trends, and cumulative performance charts."
              : "Publish, update, and manage grades and academic performance metrics for courses."}
          </p>
        </div>
        <div style={{
          position: "absolute",
          right: "20px",
          bottom: "-20px",
          opacity: 0.1,
          fontSize: 140,
          fontWeight: 900,
          userSelect: "none"
        }}>🎓</div>
      </div>

      {/* Analytics Chart & SGPA/CGPA cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flexWrap: "wrap" }} className="cb-grid-2">
        {/* GPA chart */}
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
                <YAxis domain={[5, 10]} stroke={C.sub} style={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="sgpa" stroke={C.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorSgpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stats summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.successSoft, color: C.success, display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", justifyContent: "center" }}>
              <Icons.Award size={22} color={C.success} />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>8.54</div>
              <div style={{ fontSize: 12.5, color: C.sub }}>Cumulative GPA (CGPA)</div>
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.primarySoft, color: C.primary, display: "flex", alignItems: "center", justifyCenter: "center", display: "flex", justifyContent: "center" }}>
              <Icons.CheckCircle size={22} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.text }}>82</div>
              <div style={{ fontSize: 12.5, color: C.sub }}>Credits Completed</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Semester filtering & Actions */}
      <div className="cb-flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, background: "#fff", padding: 4, borderRadius: 12, border: `1.5px solid ${C.border}` }}>
          {[1, 2, 3, 4, 5].map(sem => {
            const active = activeSem === sem;
            return (
              <button
                key={sem}
                onClick={() => setActiveSem(sem)}
                style={{
                  border: "none",
                  background: active ? ROLE_COLORS[user.role] : "transparent",
                  color: active ? "#fff" : C.sub,
                  padding: "8px 18px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                Semester {sem}
              </button>
            );
          })}
        </div>

        {user.role !== "student" && (
          <Btn onClick={() => setShowAddGradeModal(true)} style={{ gap: 8 }}>
            <Icons.Plus size={16} /> Assign / Edit Grade
          </Btn>
        )}
      </div>

      {/* Grades List Table */}
      <Card p={0}>
        <div style={{ overflowX: "auto" }}>
          <table className="cb-table" style={{ width: "100%", margin: 0 }}>
            <thead>
              <tr style={{ background: "#F8F7FF" }}>
                <th style={{ padding: "16px 20px" }}>Course Code</th>
                <th style={{ padding: "16px 20px" }}>Course Name</th>
                <th style={{ padding: "16px 20px" }}>Credits</th>
                <th style={{ padding: "16px 20px" }}>Internal (50)</th>
                <th style={{ padding: "16px 20px" }}>External (100)</th>
                <th style={{ padding: "16px 20px" }}>Total Marks</th>
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
                filteredGrades.map(grade => (
                  <tr key={grade.course}>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{grade.course}</td>
                    <td style={{ padding: "16px 20px", color: C.text }}>{grade.name}</td>
                    <td style={{ padding: "16px 20px", color: C.sub }}>{grade.credits}</td>
                    <td style={{ padding: "16px 20px", color: C.text }}>{grade.internal}</td>
                    <td style={{ padding: "16px 20px", color: C.text }}>{grade.external}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{grade.total}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <Badge
                        label={grade.grade}
                        color={
                          grade.grade === "A+" || grade.grade === "A"
                            ? C.success
                            : grade.grade.startsWith("B")
                            ? C.orange
                            : C.danger
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Grade Modal */}
      {showAddGradeModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowAddGradeModal(false)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 460,
            display: "flex", flexDirection: "column", gap: 18
          }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Assign / Update Grade</h3>
              <button onClick={() => setShowAddGradeModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>

            <Input
              label="Student Roll Number"
              placeholder="e.g. 2022CSE047"
              value={studentRoll}
              onChange={setStudentRoll}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="cb-input-wrap">
                <label className="cb-label">Course</label>
                <select
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  style={{
                    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text
                  }}
                >
                  <option value="CS501">CS501 – DSA</option>
                  <option value="CS502">CS502 – OS</option>
                  <option value="MATH303">MATH303 – DM</option>
                </select>
              </div>

              <div className="cb-input-wrap">
                <label className="cb-label">Semester</label>
                <select
                  value={selectedSem}
                  onChange={e => setSelectedSem(e.target.value)}
                  style={{
                    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text
                  }}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input
                label="Internal Marks (Max 50)"
                placeholder="e.g. 42"
                value={internalMarks}
                onChange={setInternalMarks}
              />
              <Input
                label="External Marks (Max 100)"
                placeholder="e.g. 85"
                value={externalMarks}
                onChange={setExternalMarks}
              />
            </div>

            <div className="cb-input-wrap">
              <label className="cb-label">Final Letter Grade</label>
              <select
                value={assignedGrade}
                onChange={e => setAssignedGrade(e.target.value)}
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                  padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                  fontFamily: "inherit", color: C.text
                }}
              >
                <option value="A+">A+ (Outstanding - 10)</option>
                <option value="A">A (Excellent - 9)</option>
                <option value="B+">B+ (Very Good - 8)</option>
                <option value="B">B (Good - 7)</option>
                <option value="C">C (Pass - 6)</option>
                <option value="F">F (Fail - 0)</option>
              </select>
            </div>

            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowAddGradeModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleAddGrade} style={{ flex: 1 }}>Publish Grade</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
