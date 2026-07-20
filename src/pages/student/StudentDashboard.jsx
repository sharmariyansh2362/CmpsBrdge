import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C } from "../../constants/colors";
import { Card, Badge } from "../../Components/ui";
import { Icons } from "../../Components/Icons";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function StudentDashboard() {
  const { user, apiCall } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [anns, setAnns] = useState([]);
  useEffect(() => {
    Promise.all([
      apiCall("/api/student/dashboard-stats").catch(() => null),
      apiCall("/api/academic/me/summary").catch(() => ({ semesters: [], cgpa: 0 })),
      apiCall("/api/student/courses").catch(() => []),
      apiCall("/api/announcements").catch(() => [])
    ]).then(([dashData, summaryData, coursesData, annsData]) => {
      setStats(dashData);
      setSemesters(summaryData.semesters || []);
      setCourses(coursesData || []);
      setAnns((annsData || []).slice(0, 3));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (!stats) return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Could not load dashboard data.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px", borderRadius: "20px", color: "#fff",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Welcome Back, {stats.name}!</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            Roll Number: <b>{stats.roll_number}</b> &bull; Semester: <b>{stats.semester}</b> &bull; Section: <b>{stats.section}</b>
          </p>
        </div>
        <Badge label={stats.department} color="rgba(255, 255, 255, 0.2)" />
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.GradCap size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.cgpa}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Cumulative GPA</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.CheckCircle size={22} color={C.success} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.attendancePercent}%</div>
            <div style={{ fontSize: 12, color: C.sub }}>Average Attendance</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Layers size={22} color={C.orange} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.totalCredits}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Earned Credits</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Calendar size={22} color={C.teal} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.todayClasses.length} Lectures</div>
            <div style={{ fontSize: 12, color: C.sub }}>Scheduled Today</div>
          </div>
        </Card>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="cb-grid-sidebar">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Academic CGPA Trend</h3>
            <div style={{ width: "100%", height: 220 }}>
              {semesters.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.sub }}>
                  No grades recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={semesters} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                    <XAxis dataKey="semester" tickFormatter={v => `Sem ${v}`} stroke={C.sub} style={{ fontSize: 11 }} />
                    <YAxis domain={[0, 10]} stroke={C.sub} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sgpa" stroke={C.primary} strokeWidth={2.5} fillOpacity={1} fill="url(#colorGpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>My Enrolled Courses</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.length === 0 ? (
                <div style={{ textAlign: "center", color: C.sub, padding: 12 }}>No courses enrolled yet.</div>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="cb-flex-between" style={{ paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{course.name}</div>
                      <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{course.faculty_name}</div>
                    </div>
                    <Badge label={course.code} color={C.primary} />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Today's Classes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stats.todayClasses.length === 0 ? (
                <div style={{ textAlign: "center", color: C.sub, padding: 12 }}>No classes scheduled today.</div>
              ) : (
                stats.todayClasses.map((item, idx) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: idx !== stats.todayClasses.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 10, background: C.primarySoft, color: C.primary,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icons.Clock size={14} color={C.primary} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub }}>{item.code} &bull; {item.room}</div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 2 }}>{item.subject}</h4>
                      <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{item.time_slot}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Recent Announcements</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {anns.length === 0 ? (
                <div style={{ textAlign: "center", color: C.sub, padding: 12 }}>No announcements yet.</div>
              ) : (
                anns.map((a, idx) => (
                  <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: idx !== anns.length - 1 ? 12 : 0, borderBottom: idx !== anns.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <h5 style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{a.title}</h5>
                      <p style={{ fontSize: 11.5, color: C.sub, marginTop: 4, lineHeight: 1.4 }}>
                        {a.content?.length > 70 ? a.content.substring(0, 70) + "..." : a.content}
                      </p>
                      <p style={{ fontSize: 10, color: C.sub, marginTop: 2 }}>— {a.users?.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}