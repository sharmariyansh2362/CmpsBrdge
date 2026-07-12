import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { COURSES, ALL_STUDENTS } from "../../constants/data";
import { Card, Btn, Badge } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function AttendancePage() {
  const { user } = useApp();
  const [courses, setCourses] = useState(COURSES);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].code);
  const [students, setStudents] = useState(
    ALL_STUDENTS.map(s => ({ ...s, attendanceStatus: "present" }))
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleStatusChange = (studentId, status) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, attendanceStatus: status } : s
    ));
  };

  const handleSaveAttendance = () => {
    alert(`Attendance marked successfully for ${selectedCourse} on ${date}!`);
  };

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
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Attendance Portal</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: "600px" }}>
            {user.role === "student"
              ? "Track your daily lecture presence rates and view detailed logs per enrolled course."
              : "Manage and record student classroom presence rates for lectures."}
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
        }}>📝</div>
      </div>

      {user.role === "student" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {courses.map(course => (
              <Card key={course.code} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="cb-flex-between">
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, background: course.soft, color: course.color, padding: "2px 8px", borderRadius: 4 }}>
                      {course.code}
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginTop: 6 }}>{course.name}</h4>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: `4px solid ${course.attendance >= 75 ? C.successSoft : C.dangerSoft}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: course.attendance >= 75 ? C.success : C.danger
                  }}>
                    {course.attendance}%
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div className="cb-flex-between" style={{ fontSize: 12, color: C.sub }}>
                    <span>Lectures Attended:</span>
                    <span style={{ fontWeight: 700, color: C.text }}>
                      {Math.round((course.attendance / 100) * 45)} / 45
                    </span>
                  </div>
                  {course.attendance < 75 && (
                    <div style={{ fontSize: 11, color: C.danger, fontWeight: 700, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                      <Icons.Info size={11} color={C.danger} /> Below minimum 75% requirement
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="cb-flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="cb-input-wrap">
                <label className="cb-label">Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  style={{
                    border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: "10px 14px", fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text
                  }}
                >
                  {courses.map(c => (
                    <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="cb-input-wrap">
                <label className="cb-label">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: "8px 12px", fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text
                  }}
                />
              </div>
            </div>

            <Btn onClick={handleSaveAttendance} style={{ gap: 8 }}>
              <Icons.Check size={16} /> Save Attendance
            </Btn>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="cb-table" style={{ width: "100%", margin: 0 }}>
              <thead>
                <tr style={{ background: "#F8F7FF" }}>
                  <th style={{ padding: "16px 20px" }}>Roll Number</th>
                  <th style={{ padding: "16px 20px" }}>Student Name</th>
                  <th style={{ padding: "16px 20px" }}>Section</th>
                  <th style={{ padding: "16px 20px", textAlign: "center" }}>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{student.id}</td>
                    <td style={{ padding: "16px 20px", color: C.text }}>{student.name}</td>
                    <td style={{ padding: "16px 20px", color: C.sub }}>{student.section}</td>
                    <td style={{ padding: "16px 20px", display: "flex", justifyContent: "center", gap: 8 }}>
                      {["present", "absent", "late"].map(status => {
                        const selected = student.attendanceStatus === status;
                        let btnBg = "transparent", btnColor = C.sub, borderCol = C.border;
                        if (selected) {
                          if (status === "present") { btnBg = C.successSoft; btnColor = C.success; borderCol = C.success; }
                          if (status === "absent") { btnBg = C.dangerSoft; btnColor = C.danger; borderCol = C.danger; }
                          if (status === "late") { btnBg = C.orangeSoft; btnColor = C.orange; borderCol = C.orange; }
                        }
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            style={{
                              border: `1.5px solid ${borderCol}`,
                              background: btnBg,
                              color: btnColor,
                              padding: "6px 14px",
                              borderRadius: 8,
                              fontSize: 11.5,
                              fontWeight: 700,
                              textTransform: "capitalize",
                              cursor: "pointer",
                              transition: "all 0.15s"
                            }}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
