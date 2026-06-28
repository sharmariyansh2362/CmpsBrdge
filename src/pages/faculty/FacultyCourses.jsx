import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Badge } from "../../components/ui";

export default function FacultyCourses() {
  const { apiCall } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await apiCall("http://localhost:5000/api/faculty/courses");
        setCourses(data);
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40 }}>Loading courses...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>My Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {courses.map(c => (
          <Card key={c.id} p={20}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 800, background: '#FFF3E0', color: '#F57C00', padding: '4px 8px', borderRadius: 6 }}>{c.code}</span>
              <Badge label={`Sem ${c.semester}`} color="#F57C00" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{c.name}</h3>
            <p style={{ fontSize: 13, color: C.sub, margin: '0 0 12px 0' }}>Credits: {c.credits} · Dept: {c.department}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
