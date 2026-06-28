import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../components/Icons";
import { Input, Btn } from "../../components/ui";

const ROLES = [
  { key: "student", label: "Student", color: C.primary },
  { key: "faculty", label: "Faculty", color: C.orange },
  { key: "admin",   label: "Admin",   color: C.pink }
];

export default function RegisterPage() {
  const { apiCall } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enrollment, setEnrollment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError("All fields are required");
    if (role === "student" && !enrollment) return setError("Enrollment number required for students");
    try {
      setLoading(true);
      const body = { name, email, password, role };
      if (role === "student") body.enrollment_no = enrollment;
      await apiCall("http://localhost:5000/api/auth/register", { method: "POST", body: JSON.stringify(body) });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-login-page">
      <div className="cb-login-form">
        <div className="cb-login-form-inner">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Create Account</h2>
            <p style={{ fontSize: 13.5, color: C.sub }}>Register as a new user</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 8 }}>Register as</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {ROLES.map(({ key, label, color }) => (
                <button key={key} onClick={() => setRole(key)} style={{
                  border: `2px solid ${role === key ? color : C.border}`,
                  borderRadius: 12,
                  padding: "12px 8px",
                  background: role === key ? color + "14" : C.surface,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer"
                }}>
                  <Icons.User size={20} color={role === key ? color : C.sub} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: role === key ? color : C.sub }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: "#FFF0F0", color: "#E53E3E", padding: 10, borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <Input label="Name" value={name} onChange={setName} />
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <Input label="Password" type="password" value={password} onChange={setPassword} />
          {role === "student" && (
            <Input label="Enrollment No" value={enrollment} onChange={setEnrollment} />
          )}

          <Btn onClick={handleRegister} disabled={loading} color={C.primary} full>
            {loading ? "Registering..." : "Create Account"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
