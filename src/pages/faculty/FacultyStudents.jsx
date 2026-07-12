import { useState, useEffect } from "react";
import { C, ROLE_COLORS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Avatar, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { ALL_STUDENTS, COURSES, ACADEMIC_GRADES } from "../../constants/data";

export default function FacultyStudents() {
  const { user, apiCall } = useApp();
  
  // Local state for students list and details
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);
  const [isEditingGrade, setIsEditingGrade] = useState(null); // course code being edited
  const [loading, setLoading] = useState(true);

  // Form states for editing grade
  const [editInternal, setEditInternal] = useState("");
  const [editExternal, setEditExternal] = useState("");
  const [editGrade, setEditGrade] = useState("A");

  // Determine courses taught by this faculty member
  // In demo: Priya Sharma teaches CS501 and CS502. Anil Gupta teaches MATH303.
  const facultyName = user?.name || "Dr. Priya Sharma";
  const myCourses = COURSES.filter(c => c.faculty === facultyName).map(c => c.code);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/faculty/students");
      // If backend returns empty, apply fallback logic
      if (data && data.length > 0) {
        setStudents(data);
      } else {
        // Fallback: only show students matching this faculty's section/course criteria to avoid showing all multiple students
        const sectionFilter = facultyName.includes("Priya") ? "B" : "A";
        const filtered = ALL_STUDENTS.filter(s => s.section === sectionFilter);
        setStudents(filtered);
      }
    } catch (err) {
      console.error("Failed to load students from database:", err);
      const sectionFilter = facultyName.includes("Priya") ? "B" : "A";
      const filtered = ALL_STUDENTS.filter(s => s.section === sectionFilter);
      setStudents(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [apiCall]);

  const handleOpenStudent = (student) => {
    setSelectedStudent(student);
    // Fetch grades for this student (fallback to demo data)
    const grades = ACADEMIC_GRADES.filter(g => g.semester === 5); // display current semester
    setStudentGrades(grades);
    setIsEditingGrade(null);
  };

  const handleEditClick = (grade) => {
    setIsEditingGrade(grade.course);
    setEditInternal(String(grade.internal));
    setEditExternal(String(grade.external));
    setEditGrade(grade.grade);
  };

  const handleSaveGrade = (courseCode) => {
    const internal = parseFloat(editInternal) || 0;
    const external = parseFloat(editExternal) || 0;
    const total = internal + external;
    const gradePoint = editGrade === "A+" ? 10 : editGrade === "A" ? 9 : editGrade === "B+" ? 8 : editGrade === "B" ? 7 : 6;

    // Update state locally
    const updatedGrades = studentGrades.map(g => {
      if (g.course === courseCode) {
        return {
          ...g,
          internal,
          external,
          total,
          grade: editGrade,
          gradePoint
        };
      }
      return g;
    });

    setStudentGrades(updatedGrades);
    setIsEditingGrade(null);
    alert(`Grade updated successfully for ${selectedStudent.name} in course ${courseCode}!`);
  };

  if (loading) return <div style={{ padding: 40, color: C.sub }}>Loading student listings...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="cb-flex-between">
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>My Students Directory</h2>
        <Badge label={`${myCourses.join(", ")} Instructor`} color={C.orange} />
      </div>

      <Card p={0}>
        <div style={{ overflowX: "auto" }}>
          <table className="cb-table" style={{ width: "100%", margin: 0 }}>
            <thead>
              <tr style={{ background: "#F8F7FF" }}>
                <th style={{ padding: "16px 20px" }}>Roll Number</th>
                <th style={{ padding: "16px 20px" }}>Name</th>
                <th style={{ padding: "16px 20px" }}>Section</th>
                <th style={{ padding: "16px 20px" }}>Status</th>
                <th style={{ padding: "16px 20px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id || s.enrollment_no}>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>
                    {s.id || s.roll_number || s.enrollment_no}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div className="cb-flex" style={{ gap: 10 }}>
                      <Avatar name={s.name} size={30} color={C.orange} />
                      <span style={{ fontWeight: 700, color: C.text }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", color: C.sub }}>Section {s.section || "B"}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge
                      label={s.status || "active"}
                      color={s.status === "active" ? C.success : s.status === "warning" ? C.warning : C.danger}
                    />
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Btn sm onClick={() => handleOpenStudent(s)}>View & Manage</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Student Details & Grades Modal */}
      {selectedStudent && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setSelectedStudent(null)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 22, width: "100%", maxWidth: 650,
            display: "flex", flexDirection: "column", gap: 20, maxHeight: "90vh", overflowY: "auto"
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="cb-flex-between">
              <div className="cb-flex" style={{ gap: 14 }}>
                <Avatar name={selectedStudent.name} size={44} color={C.orange} />
                <div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 800, color: C.text }}>{selectedStudent.name}</h3>
                  <p style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                    Roll No: <b>{selectedStudent.id || selectedStudent.roll_number || selectedStudent.enrollment_no}</b> &bull; Section {selectedStudent.section || "B"}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={20} color={C.sub} />
              </button>
            </div>

            {/* Student Profile Info */}
            <div style={{ background: "#F8F7FF", borderRadius: 14, padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ fontSize: 12.5, color: C.sub }}>
                <strong>Department:</strong> Computer Science & Engineering
              </div>
              <div style={{ fontSize: 12.5, color: C.sub }}>
                <strong>Semester:</strong> 5th Semester
              </div>
              <div style={{ fontSize: 12.5, color: C.sub }}>
                <strong>Email:</strong> {selectedStudent.email || `${(selectedStudent.roll_number || selectedStudent.enrollment_no || "student").toLowerCase()}@krmu.edu.in`}
              </div>
              <div style={{ fontSize: 12.5, color: C.sub }}>
                <strong>Attendance Rate:</strong> {selectedStudent.attendance || 85}%
              </div>
            </div>

            {/* Academic Grades Table */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Academic Performance (Current Semester)</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {studentGrades.map(grade => {
                  const isMyCourse = myCourses.includes(grade.course);
                  const isEditing = isEditingGrade === grade.course;

                  return (
                    <div key={grade.course} style={{
                      border: `1.5px solid ${C.border}`, borderRadius: 14, padding: 14,
                      display: "flex", flexDirection: "column", gap: 12
                    }}>
                      <div className="cb-flex-between">
                        <div className="cb-flex" style={{ gap: 8 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 800, background: C.orangeSoft, color: C.orange, padding: "2px 8px", borderRadius: 4 }}>
                            {grade.course}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grade.name}</span>
                        </div>
                        {isMyCourse ? (
                          !isEditing ? (
                            <button
                              onClick={() => handleEditClick(grade)}
                              style={{
                                background: "none", border: "none", color: C.primary,
                                cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4
                              }}
                            >
                              <Icons.Edit size={12} color={C.primary} /> Edit Marks
                            </button>
                          ) : (
                            <Badge label="Editing" color={C.primary} />
                          )
                        ) : (
                          <Badge label="Read Only (Other Course)" color={C.sub} />
                        )}
                      </div>

                      {!isEditing ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                          <div>
                            <div style={{ fontSize: 10.5, color: C.sub }}>Internal (50)</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grade.internal}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, color: C.sub }}>External (100)</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{grade.external}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, color: C.sub }}>Total Marks</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{grade.total}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10.5, color: C.sub }}>Grade Assigned</div>
                            <div style={{ marginTop: 2 }}>
                              <Badge label={grade.grade} color={C.success} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                            <Input label="Internal (Max 50)" value={editInternal} onChange={setEditInternal} />
                            <Input label="External (Max 100)" value={editExternal} onChange={setEditExternal} />
                            <div className="cb-input-wrap">
                              <label className="cb-label">Letter Grade</label>
                              <select
                                value={editGrade}
                                onChange={e => setEditGrade(e.target.value)}
                                style={{
                                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                                  padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                                  fontFamily: "inherit", color: C.text
                                }}
                              >
                                <option value="A+">A+ (Outstanding)</option>
                                <option value="A">A (Excellent)</option>
                                <option value="B+">B+ (Very Good)</option>
                                <option value="B">B (Good)</option>
                                <option value="C">C (Pass)</option>
                                <option value="F">F (Fail)</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignSelf: "flex-end" }}>
                            <Btn sm variant="outline" onClick={() => setIsEditingGrade(null)}>Cancel</Btn>
                            <Btn sm onClick={() => handleSaveGrade(grade.course)}>Save Grade</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
