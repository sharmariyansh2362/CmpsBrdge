import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Badge } from "../../components/ui";

export default function AdminApplications() {
  const { apiCall } = useApp();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await apiCall("http://localhost:5000/api/admin/applications");
      setApps(data);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [apiCall]);

  const handleStatusChange = async (id, status) => {
    try {
      await apiCall(`http://localhost:5000/api/admin/applications/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      fetchApps();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading application forms...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Pending Student Applications</h2>
      
      {apps.length === 0 ? (
        <Card p={20} style={{ textAlign: 'center', color: C.sub }}>No applications submitted yet.</Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {apps.map(a => (
            <Card key={a.id} p={20}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>{String(a.type || "").toUpperCase()}</h3>
                  <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
                    Submitted by: <b>{a.students?.users?.name}</b> ({a.students?.enrollment_no})
                  </p>
                </div>
                <Badge label={a.status} color={a.status === 'approved' ? C.success : a.status === 'rejected' ? '#EF4444' : C.orange} />
              </div>
              
              <p style={{ fontSize: 14, background: '#F8F9FA', padding: 12, borderRadius: 10, border: '1px solid #EEE', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                {a.description}
              </p>

              {a.status === 'pending' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn onClick={() => handleStatusChange(a.id, 'approved')} color={C.success}>Approve</Btn>
                  <Btn onClick={() => handleStatusChange(a.id, 'rejected')} color="#EF4444">Reject</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
