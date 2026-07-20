import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../Components/Icons";
import { Card, Btn, Badge, Avatar } from "../../Components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function FacultyDashboard() {
  const { user, apiCall } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: user?.name || "Faculty Member",
    designation: "Lecturer",
    department: user?.department || "Computer Science",
    employee_id: "FAC" + String(user?.id || "").slice(-6),
    email: user?.email || "",
    experience: "5 years",
    office: "Office Room 102"
  });

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ coursesCount: 0, studentsCount: 0, attendancePercent: 0, atRiskCount: 0, gradeDistribution: [] });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileData, coursesData, statsData] = await Promise.all([
        apiCall("/api/profiles/me").catch(() => null),
        apiCall("/api/faculty/courses").catch(() => []),
        apiCall("/api/faculty/dashboard-stats").catch(() => ({ coursesCount: 0, studentsCount: 0 }))
      ]);

      if (profileData) {
        setProfile({
          name: profileData.name || user?.name,
          designation: profileData.designation || "Lecturer",
          department: profileData.department || user?.department,
          employee_id: profileData.employee_id || "FAC" + String(profileData.id || "").slice(-6),
          email: profileData.email || user?.email,
          experience: profileData.experience || "5 years",
          office: profileData.office || "Office Room 102"
        });
      }
      if (coursesData) setCourses(coursesData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiCall]);


  if (loading) return <div style={{ padding: 40, color: C.sub }}>Loading Dashboard Telemetry...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.orange} 0%, #FFA726 100%)`,
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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Good Day, {profile.name}! 👋</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            {profile.designation} &bull; Department of {profile.department}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge label={profile.office} color="rgba(255, 255, 255, 0.2)" />
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.BookOpen size={22} color={C.orange} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.coursesCount}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Assigned Courses</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Users size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.studentsCount} Students</div>
            <div style={{ fontSize: 12, color: C.sub }}>Total Enrolled</div>
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
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Warning size={22} color={C.danger} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.atRiskCount} Students</div>
            <div style={{ fontSize: 12, color: C.sub }}>At Academic Risk</div>
          </div>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="cb-grid-sidebar">
        {/* Left column: Chart & Courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Student Grade Distribution</h3>
            <div style={{ width: "100%", height: 220 }}>
              {stats.studentsCount === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.sub }}>
                  No students enrolled to calculate grade distribution.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                    <XAxis dataKey="grade" stroke={C.sub} style={{ fontSize: 11 }} />
                    <YAxis stroke={C.sub} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill={C.orange} radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Assigned Courses Overview</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.length === 0 ? (
                <div style={{ padding: 12, color: C.sub, textAlign: "center" }}>
                  No courses assigned to your profile yet.
                </div>
              ) : (
                courses.map(course => (
                  <div key={course.code} className="cb-flex-between" style={{ paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{course.name}</div>
                      <div style={{ fontSize: 11.5, color: C.sub, marginTop: 2 }}>{course.code} &bull; Semester {course.semester}</div>
                    </div>
                    <div className="cb-flex" style={{ gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>Active Course</div>
                        <div style={{ fontSize: 11, color: C.sub }}>{course.credits} Credits</div>
                      </div>
                      <Btn sm onClick={() => navigate("/faculty/students")}>Students List</Btn>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right column: At-risk students & Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* At Risk List */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>At-Risk Students Alerts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, color: C.sub, textAlign: "center", padding: "12px 0" }}>
                {stats.atRiskCount === 0
                  ? "All students are currently performing above the warning threshold."
                  : `${stats.atRiskCount} student(s) have attendance below 75%.`}              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Quick Management Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Attendance Sheet", path: "/faculty/attendance", icon: Icons.CheckCircle, color: C.success },
                { label: "Publish Notice", path: "/faculty/announcements", icon: Icons.Bell, color: C.primary },
                { label: "Class Channels", path: "/faculty/channels", icon: Icons.Hash, color: C.teal }
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "16px 8px",
                      background: "#fff",
                      cursor: "pointer",
                      transition: "transform 0.1s, box-shadow 0.15s"
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(108, 99, 255, 0.06)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: action.color + "14", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={action.color} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: C.text, textAlign: "center" }}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
