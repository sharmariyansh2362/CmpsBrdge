import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card } from "../../Components/ui";

export default function AdminLogs() {
  const { apiCall } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await apiCall("/api/admin/logs");
        setLogs(data);
      } catch (err) {
        console.error("Failed to load logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [apiCall]);

  if (loading) return <div style={{ padding: 40 }}>Loading audit logs...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Admin System Audit Logs</h2>
      <Card p={20}>
        {logs.length === 0 ? (
          <div style={{ padding: 12, color: C.sub }}>No logs available.</div>
        ) : (
          <table className="cb-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #EEE' }}>
                <th style={{ padding: 12 }}>Timestamp</th>
                <th style={{ padding: 12 }}>Performed By</th>
                <th style={{ padding: 12 }}>Action Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #FAFAFA' }}>
                  <td style={{ padding: 12, color: C.sub, fontSize: 13 }}>
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: 12, fontWeight: 600 }}>
                    {l.users?.name || 'System Admin'} ({l.users?.email})
                  </td>
                  <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 13, color: '#DB2777' }}>
                    {l.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
