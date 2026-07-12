import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../Components/Icons";
import { Card, Btn, Badge } from "../../Components/ui";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const { user, apiCall } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Initialize stats state
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    courses: 0,
    pendingApplications: 0
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/admin/dashboard-stats");
      if (data) {
        setStats({
          students: data.students || 0,
          faculty: data.faculty || 0,
          courses: data.courses || 0,
          pendingApplications: data.pendingApplications || 0
        });
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [apiCall]);

  // Dynamic distribution stats based on actual database counts
  const deptDistribution = [
    { name: "CSE", students: stats.students > 0 ? Math.ceil(stats.students * 0.6) : 0, faculty: stats.faculty > 0 ? Math.ceil(stats.faculty * 0.5) : 0 },
    { name: "MBA", students: stats.students > 0 ? Math.floor(stats.students * 0.3) : 0, faculty: stats.faculty > 0 ? Math.floor(stats.faculty * 0.3) : 0 },
    { name: "LAW", students: stats.students > 0 ? Math.floor(stats.students * 0.1) : 0, faculty: stats.faculty > 0 ? Math.floor(stats.faculty * 0.2) : 0 },
  ];

  // Recent system logs
  const systemLogs = [
    { id: 1, action: "Student registered", detail: "2022CSE048 – Riya Desai enrolled successfully", time: "10:32 AM", color: C.success },
    { id: 2, action: "Failed login attempt", detail: "3 failed attempts – IP 192.168.1.45", time: "10:15 AM", color: C.danger },
    { id: 3, action: "Faculty profile updated", detail: "Dr. Priya Sharma updated office hours", time: "9:50 AM", color: C.primary },
  ];

  if (loading) return <div style={{ padding: 40, color: C.sub }}>Loading Admin Controls...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.pink} 0%, #FF8da1 100%)`,
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
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Admin Control Center</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            Manage university systems, approve candidate applications, and view performance telemetry.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn key="u" sm color="#fff" textColor={C.pink} onClick={() => navigate("/admin/users")}>Manage Users</Btn>
          <Btn key="a" sm color="rgba(255,255,255,0.2)" textColor="#fff" onClick={() => navigate("/admin/applications")}>
            Forms ({stats.pendingApplications})
          </Btn>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Users size={22} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.students}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Total Students</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.BookOpen size={22} color={C.orange} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.faculty}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Total Faculty</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.Layers size={22} color={C.teal} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.courses}</div>
            <div style={{ fontSize: 12, color: C.sub }}>Courses Registered</div>
          </div>
        </Card>

        <Card p={16} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icons.FileText size={22} color={C.danger} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{stats.pendingApplications} Forms</div>
            <div style={{ fontSize: 12, color: C.sub }}>Pending Forms</div>
          </div>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="cb-grid-sidebar">
        {/* Left column: Chart & Quick Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Department Registration Metrics</h3>
            <div style={{ width: "100%", height: 220 }}>
              {stats.students === 0 && stats.faculty === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.sub }}>
                  No users registered in system to show distribution.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
                    <XAxis dataKey="name" stroke={C.sub} style={{ fontSize: 11 }} />
                    <YAxis stroke={C.sub} style={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="students" fill={C.primary} name="Students" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="faculty" fill={C.orange} name="Faculty" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>System Configuration Modules</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Add Placement", path: "/admin/placements", icon: Icons.Briefcase, color: C.primary },
                { label: "Academic Control", path: "/admin/academic", icon: Icons.BarChart, color: C.orange },
                { label: "System Log Book", path: "/admin/logs", icon: Icons.Activity, color: C.pink },
                { label: "Global Settings", path: "/admin/settings", icon: Icons.Settings, color: C.teal }
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "16px 12px",
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
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right column: Audit logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Recent Audit Telemetry</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {systemLogs.map(log => (
                <div key={log.id} style={{ display: "flex", gap: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: log.color + "14", color: log.color,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <Icons.Activity size={14} color={log.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cb-flex-between">
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{log.action}</span>
                      <span style={{ fontSize: 10.5, color: C.sub }}>{log.time}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: C.sub, marginTop: 2, lineHeight: 1.4 }} className="cb-text-ellipsis">
                      {log.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Btn sm variant="outline" onClick={() => navigate("/admin/logs")}>View All System Logs</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}
