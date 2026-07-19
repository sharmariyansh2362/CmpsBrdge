import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C } from "../../constants/colors";
import { Card, Btn } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

const BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AttendancePage() {
  const { user, apiCall } = useApp();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Faculty → Load courses
  useEffect(() => {
    if (user?.role === "faculty") {
      apiCall(`${BASE}/api/faculty/courses`)
        .then(data => {
          setCourses(data);
          if (data.length > 0) setSelectedCourse(data[0].id);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else if (user?.role === "student") {
      apiCall(`${BASE}/api/attendance/summary`)
        .then(data => setSummary(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Faculty → Load students when course changes
  useEffect(() => {
    if (user?.role === "faculty" && selectedCourse) {
      apiCall(`${BASE}/api/attendance/course/${selectedCourse}/students`)
        .then(data => {
          setStudents(data);
          const initial = {};
          data.forEach(s => initial[s.id] = "present");
          setAttendance(initial);
        })
        .catch(err => console.error(err));
    }
  }, [selectedCourse]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceList = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] || "present"
      }));

      await apiCall(`${BASE}/api/attendance/mark`, {
        method: "POST",
        body: JSON.stringify({
          course_id: selectedCourse,
          date,
          attendance: attendanceList
        })
      });
      alert("Attendance saved successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px", borderRadius: "20px", color: "#fff"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Attendance Portal</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
          {user?.role === "student"
            ? "Track your daily lecture presence rates."
            : "Mark and manage student attendance."}
        </p>
      </div>

      {/* Student View */}
      {user?.role === "student" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {summary.length === 0 ? (
            <Card p={20} style={{ textAlign: "center", color: C.sub }}>
              No attendance records yet.
            </Card>
          ) : (
            summary.map(course => (
              <Card key={course.code} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, background: C.primarySoft, color: C.primary, padding: "2px 8px", borderRadius: 4 }}>
                      {course.code}
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginTop: 6 }}>{course.name}</h4>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    border: `4px solid ${course.percentage >= 75 ? "#10B981" : "#EF4444"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800,
                    color: course.percentage >= 75 ? "#10B981" : "#EF4444"
                  }}>
                    {course.percentage}%
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.sub }}>
                    <span>Present / Total:</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{course.present} / {course.total}</span>
                  </div>
                  {course.percentage < 75 && (
                    <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 6 }}>
                      ⚠️ Below 75% requirement
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Faculty View */}
      {user?.role === "faculty" && (
        <Card style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Select Course</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, background: "#F8F7FF", outline: "none", fontFamily: "inherit", color: C.text }}
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} – {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "8px 12px", fontSize: 13.5, background: "#F8F7FF", outline: "none", fontFamily: "inherit", color: C.text }}
              />
            </div>

            <div style={{ marginTop: 20 }}>
              <Btn onClick={handleSaveAttendance} disabled={saving}>
                {saving ? "Saving..." : "Save Attendance"}
              </Btn>
            </div>
          </div>

          {students.length === 0 ? (
            <div style={{ textAlign: "center", color: C.sub, padding: 20 }}>
              No students enrolled in this course.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F7FF" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left" }}>Roll Number</th>
                  <th style={{ padding: "16px 20px", textAlign: "left" }}>Student Name</th>
                  <th style={{ padding: "16px 20px", textAlign: "center" }}>Mark Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "16px 20px", fontWeight: 700 }}>{student.enrollment_no}</td>
                    <td style={{ padding: "16px 20px" }}>{student.users?.name}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                        {["present", "absent", "late"].map(status => {
                          const selected = attendance[student.id] === status;
                          let bg = "transparent", color = C.sub, border = C.border;
                          if (selected) {
                            if (status === "present") { bg = "#D1FAE5"; color = "#10B981"; border = "#10B981"; }
                            if (status === "absent") { bg = "#FEE2E2"; color = "#EF4444"; border = "#EF4444"; }
                            if (status === "late") { bg = "#FEF3C7"; color = "#F59E0B"; border = "#F59E0B"; }
                          }
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              style={{
                                border: `1.5px solid ${border}`,
                                background: bg, color,
                                padding: "6px 14px", borderRadius: 8,
                                fontSize: 11.5, fontWeight: 700,
                                textTransform: "capitalize", cursor: "pointer"
                              }}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}