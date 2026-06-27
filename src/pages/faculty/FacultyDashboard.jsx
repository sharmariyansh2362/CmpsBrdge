import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Card, Btn, StatCard, HeroBanner, Avatar } from "../../components/ui";

export default function FacultyDashboard() {
  const { user, apiCall } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ coursesCount: 0, studentsCount: 0 });
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, coursesData, profileData] = await Promise.all([
          apiCall("http://localhost:5000/api/faculty/dashboard-stats"),
          apiCall("http://localhost:5000/api/faculty/courses"),
          apiCall("http://localhost:5000/api/faculty/profile")
        ]);
        setStats(statsData);
        setCourses(coursesData);
        setProfile(profileData);
      } catch (err) {
        console.error("Error loading faculty dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40 }}>Loading Faculty Dashboard...</div>;

  return (
    <div className="cb-space-5" style={{ padding: 24 }}>
      <HeroBanner
        gradient="linear-gradient(120deg, #F57C00 0%, #FFB74D 100%)"
        title={`Good day, ${profile?.name || 'Professor'}! 👋`}
        subtitle={`Welcome back to KR Mangalam Faculty Portal. You have ${courses.length} active courses assigned.`}
        actions={[
          <Btn key="c" sm color="#fff" textColor="#F57C00" onClick={() => navigate("/faculty/courses")}>View My Courses</Btn>,
          <Btn key="a" sm color="rgba(255,255,255,0.2)" textColor="#fff" onClick={() => navigate("/faculty/announcements")}>Announcements</Btn>
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        <div>
          {/* Stats Grid */}
          <div className="cb-grid-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <StatCard label="Assigned Courses" value={String(stats?.coursesCount || 0)} Icon={Icons.BookOpen} color="#F57C00" soft="#FFF3E0" />
            <StatCard label="Total Class Students" value={String(stats?.studentsCount || 0)} Icon={Icons.Users} color="#6C5CE7" soft="#F8F7FF" />
          </div>

          {/* Assigned Courses List */}
          <Card p={22}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: '0 0 16px 0' }}>Assigned Courses</h3>
            {courses.length === 0 ? (
              <div style={{ padding: 12, color: C.sub }}>No courses assigned.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {courses.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#F8F9FA', borderRadius: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, background: '#FFF3E0', color: '#F57C00', padding: '3px 8px', borderRadius: 5 }}>{c.code}</span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: '6px 0 2px 0' }}>{c.name}</h4>
                      <p style={{ fontSize: 12, color: C.sub, margin: 0 }}>Sem {c.semester} · {c.credits} Credits · {c.department}</p>
                    </div>
                    <Icons.ArrowRight size={16} color={C.sub} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Profile Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card p={20} style={{ textAlign: "center" }}>
            <Avatar name={profile?.name || "P"} size={64} color="#F57C00" />
            <h4 style={{ fontWeight: 800, fontSize: 16, color: C.text, marginTop: 12, marginBottom: 2 }}>{profile?.name}</h4>
            <p style={{ fontSize: 13, color: C.sub, margin: '0 0 14px 0' }}>{profile?.designation}</p>
            
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.sub }}>Dept.</span>
                <span style={{ fontWeight: 700 }}>{profile?.department}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.sub }}>ID No</span>
                <span style={{ fontWeight: 700 }}>{profile?.employee_id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.sub }}>Email</span>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{profile?.email}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
