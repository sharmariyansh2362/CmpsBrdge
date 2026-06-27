import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Input } from "../../components/ui";

export default function FacultyProfile() {
  const { apiCall } = useApp();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [desig, setDesig] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiCall("http://localhost:5000/api/faculty/profile");
      setProfile(data);
      setName(data.name);
      setDept(data.department);
      setDesig(data.designation);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [apiCall]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setSuccessMsg("");
      await apiCall("http://localhost:5000/api/faculty/profile", {
        method: "PUT",
        body: JSON.stringify({ name, department: dept, designation: desig })
      });
      setSuccessMsg("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading profile...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 16 }}>Faculty Profile Settings</h2>
      <Card p={24}>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {successMsg && (
            <div style={{ padding: '10px 14px', background: '#DEF7EC', color: '#03543F', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
              {successMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Employee ID</label>
              <input type="text" value={profile?.employee_id || ""} disabled style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', background: '#F8F9FA', color: '#9A9FA5', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Email</label>
              <input type="text" value={profile?.email || ""} disabled style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', background: '#F8F9FA', color: '#9A9FA5', outline: 'none' }} />
            </div>
          </div>

          <Input label="Full Name" value={name} onChange={setName} required />
          <Input label="Department" value={dept} onChange={setDept} required />
          <Input label="Designation" value={desig} onChange={setDesig} required />

          <Btn type="submit" color="#F57C00" full disabled={updating}>
            {updating ? "Saving Changes..." : "Save Settings"}
          </Btn>
        </form>
      </Card>
    </div>
  );
}
