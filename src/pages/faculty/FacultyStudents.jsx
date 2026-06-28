import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Avatar } from "../../components/ui";

export default function FacultyStudents() {
  const { apiCall } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await apiCall("http://localhost:5000/api/faculty/students");
        setStudents(data);
      } catch (err) {
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40 }}>Loading students list...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Class Enrollments</h2>
      <Card p={20}>
        {students.length === 0 ? (
          <div style={{ padding: 12, color: C.sub }}>No students enrolled.</div>
        ) : (
          <table className="cb-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #EEE' }}>
                <th style={{ padding: 12 }}>Name</th>
                <th style={{ padding: 12 }}>Enrollment No</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Department</th>
                <th style={{ padding: 12 }}>Semester</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #FAFAFA' }}>
                  <td style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={s.name} size={30} color="#6C5CE7" />
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                  </td>
                  <td style={{ padding: 12 }}>{s.enrollment_no}</td>
                  <td style={{ padding: 12 }}>{s.email}</td>
                  <td style={{ padding: 12 }}>{s.department}</td>
                  <td style={{ padding: 12 }}>Sem {s.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
