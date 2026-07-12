import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { COURSES, ANNOUNCEMENTS } from "../../constants/data";
import { Card, Badge } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StudentDashboard() {
  const { user } = useApp();

  // Local state with fallbacks to demo data if API is not fully configured
  const [profile, setProfile] = useState({
    name: user?.name || "Arjun Mehta",
    rollNo: "2022CSE047",
    semester: "5th Semester",
    department: "Computer Science & Engineering",
    gpa: "8.74",
    credits: "82/144",
    attendance: "88%"
  });

  const [courses, setCourses] = useState(COURSES);
  const [anns, setAnns] = useState(ANNOUNCEMENTS.slice(0, 3));

  // Today's classes schedule
  const todaysSchedule = [
    { time: "09:00 AM", code: "CS501", subject: "Data Structures & Algorithms", room: "Block A - 201" },
    { time: "10:15 AM", code: "CS502", subject: "Operating Systems", room: "Block A - 203" },
    { time: "11:30 AM", code: "MATH303", subject: "Discrete Mathematics", room: "Block B - 102" },
  ];

  // Recharts chart data
  const gpaData = [
    { semester: "Sem 1", gpa: 8.2 },
    { semester: "Sem 2", gpa: 8.5 },
    { semester: "Sem 3", gpa: 7.9 },
    { semester: "Sem 4", gpa: 8.8 },
    { semester: "Sem 5", gpa: 8.74 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px",
        borderRadius: "20px",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Welcome Back, {profile.name}!</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            Roll Number: <b>{profile.rollNo}</b> &bull; Semester: <b>{profile.semester}</b>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge label={profile.department} color="rgba(255, 255, 255, 0.2)" />
        </div>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.GradCap size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{profile.gpa}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Cumulative GPA</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.CheckCircle size={22} color={C.success} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{profile.attendance}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Average Attendance</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Layers size={22} color={C.orange} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{profile.credits}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Earned Credits</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Calendar size={22} color={C.teal} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>3 Lectures</div>
            <div style={{ fontSize: 12, color: C.sub }}>Scheduled Today</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Graph + Schedule / Announcements */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="cb-grid-sidebar">
        {/* Left Side: Course Progress & Performance Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Academic CGPA Trend</h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.primary} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={C.primary} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                  <XAxis dataKey="semester" stroke={C.sub} style={{ fontSize: 11 }} />
                  <YAxis domain={[5, 10]} stroke={C.sub} style={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="gpa" stroke={C.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Course Attendances & Grades</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map(course => (
                <div key={course.code} className="cb-flex-between" style={{ paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{course.name}</div>
                    <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{course.faculty}</div>
                  </div>
                  <div className="cb-flex" style={{ gap: 14 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: course.attendance >= 75 ? C.success : C.danger }}>
                        {course.attendance}% Attendance
                      </div>
                      <div style={{ fontSize: 11, color: C.sub }}>Target 75%</div>
                    </div>
                    <Badge label={`Grade ${course.grade}`} color={course.color} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Side: Today's Classes & Announcements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Today's Schedule */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Today's Classes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todaysSchedule.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: idx !== todaysSchedule.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, background: C.primarySoft, color: C.primary,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <Icons.Clock size={14} color={C.primary} />
                    <span style={{ fontSize: 9.5, fontWeight: 800, marginTop: 2 }}>{item.time.split(" ")[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub }}>{item.code} &bull; {item.room}</div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }} className="cb-text-ellipsis">
                      {item.subject}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Latest Announcements */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Recent Notices</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {anns.map((a, idx) => (
                <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: idx !== anns.length - 1 ? 12 : 0, borderBottom: idx !== anns.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <h5 style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</h5>
                    <p style={{ fontSize: 11.5, color: C.sub, marginTop: 4, lineHeight: 1.4 }}>
                      {a.body.substring(0, 70)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
