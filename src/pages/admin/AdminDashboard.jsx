import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Card, Btn, StatCard, HeroBanner } from "../../components/ui";

export default function AdminDashboard() {
  const { apiCall } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0, pendingApplications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await apiCall("http://localhost:5000/api/admin/dashboard-stats");
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40 }}>Loading Admin Portal...</div>;

  return (
    <div style={{ padding: 24 }}>
      <HeroBanner
        gradient="linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)"
        title="Admin Control Centre"
        subtitle={`Manage portal systems, review pending applications, and audit portal usage logs.`}
        actions={[
          <Btn key="u" sm color="#fff" textColor="#EC4899" onClick={() => navigate("/admin/users")}>Manage Users</Btn>,
          <Btn key="a" sm color="rgba(255,255,255,0.2)" textColor="#fff" onClick={() => navigate("/admin/applications")}>
            Applications ({stats.pendingApplications})
          </Btn>
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginTop: 24 }}>
        <StatCard label="Total Students" value={String(stats?.students || 0)} Icon={Icons.Users} color="#6C5CE7" soft="#F8F7FF" />
        <StatCard label="Total Faculty" value={String(stats?.faculty || 0)} Icon={Icons.BookOpen} color="#F57C00" soft="#FFF3E0" />
        <StatCard label="Courses Registered" value={String(stats?.courses || 0)} Icon={Icons.BookMark} color="#10B981" soft="#ECFDF5" />
        <StatCard label="Pending Forms" value={String(stats?.pendingApplications || 0)} Icon={Icons.FileText} color="#EF4444" soft="#FEF2F2" />
      </div>
    </div>
  );
}
