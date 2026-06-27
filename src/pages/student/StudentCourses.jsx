import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Card, Badge, ProgressBar } from "../../components/ui";

export default function StudentCourses() {
  const { apiCall } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await apiCall("http://localhost:5000/api/student/courses");
        setCourses(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>Loading enrolled courses...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E', fontWeight: 600 }}>Error: {error}</div>;

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <div className="cb-space-5" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: '0 0 6px 0' }}>My Enrolled Courses</h2>
        <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
          {courses.length} Enrolled Courses · {totalCredits} Total Credits
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {courses.map((c) => (
          <div key={c.id} style={{ background: '#fff', border: '1.5px solid #F4F4F4', borderRadius: 16, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, background: '#F8F7FF',
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 15, color: '#6C5CE7',
              }}>
                {c.code?.slice(0, 2) || 'CS'}
              </div>
              <Badge label={`Sem ${c.semester}`} color="#6C5CE7" />
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.text, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 13, color: C.sub, marginBottom: 14 }}>Faculty: <b>{c.faculty_name}</b> · {c.credits} Credits</div>
            
            <div style={{ borderTop: '1px solid #F4F4F4', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.sub }}>Department: {c.department}</span>
              <span style={{ fontSize: 12, color: '#6C5CE7', fontWeight: 700 }}>Code: {c.code}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
