import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";

export const mapCourseStats = (course) => {
  const soft = "#F8F7FF";
  const color = "#6C5CE7";
  const code = course.code || "CS";
  const name = course.name || "Unnamed Course";
  const faculty = course.faculty_name || "Faculty";
  const credits = course.credits ?? 0;
  return { soft, color, code, name, faculty, credits, ...course };
};

const StudentDashboard = () => {
  const { apiCall } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profData, coursesData, annsData] = await Promise.all([
          apiCall("http://localhost:5000/api/student/profile"),
          apiCall("http://localhost:5000/api/student/courses"),
          apiCall("http://localhost:5000/api/announcements")
        ]);
        setProfile(profData);
        setCourses(coursesData);
        setAnns(annsData);
        setError(null);
      } catch (e) {
        setError(e.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 24, fontSize: 16 }}>Loading Student Dashboard...</div>;
  if (error) return <div style={{ padding: 24, color: '#E53E3E', fontWeight: 600 }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24, fontFamily: 'inherit' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1D1F', margin: 0 }}>Welcome back, {profile?.name}!</h1>
        <p style={{ color: '#6F767E', margin: '8px 0 0 0', fontSize: 14 }}>
          Enrollment No: <b>{profile?.enrollment_no}</b> | Semester: <b>{profile?.semester}</b> | Dept: <b>{profile?.department}</b>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Enrolled Courses */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D1F', marginBottom: 16 }}>Your Enrolled Courses ({courses.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {courses.length === 0 ? (
              <div style={{ padding: 20, background: '#F4F4F4', borderRadius: 12, color: '#6F767E' }}>No courses enrolled yet.</div>
            ) : (
              courses.map(c => (
                <div key={c.id} style={{ background: '#fff', border: '1.5px solid #F4F4F4', borderRadius: 16, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#F3E8FF', color: '#7E3AF2', padding: '4px 8px', borderRadius: 6 }}>{c.code}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px 0' }}>{c.name}</h3>
                    <p style={{ fontSize: 13, color: '#6F767E', margin: 0 }}>Faculty: {c.faculty_name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1A1D1F' }}>{c.credits} Credits</div>
                    <div style={{ fontSize: 12, color: '#6F767E', marginTop: 2 }}>Semester {c.semester}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1D1F', marginBottom: 16 }}>Latest Announcements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {anns.length === 0 ? (
              <div style={{ padding: 20, background: '#F4F4F4', borderRadius: 12, color: '#6F767E' }}>No announcements.</div>
            ) : (
              anns.map(a => (
                <div key={a.id} style={{ background: '#fff', border: '1.5px solid #F4F4F4', borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, background: '#E0F2FE', color: '#0369A1', padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase' }}>Target: {a.role_target}</span>
                    <span style={{ fontSize: 11, color: '#9A9FA5' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px 0', color: '#1A1D1F' }}>{a.title}</h4>
                  <p style={{ fontSize: 13, color: '#6F767E', margin: 0, lineHeight: 1.5 }}>{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
