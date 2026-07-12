import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C, ROLE_COLORS, ROLE_LABELS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Icons } from "../../Components/Icons";
import { Input, Btn, Modal } from "../../Components/ui";

const ROLES = [
  { key: "student", label: "Student", desc: "Login with Roll Number", I: Icons.User, color: C.primary },
  { key: "faculty", label: "Faculty", desc: "Login with College Email", I: Icons.BookOpen, color: C.orange },
  { key: "admin", label: "Admin", desc: "System Administration", I: Icons.Shield, color: C.pink },
];

const DEPTS = ["CSE", "MBA", "LAW", "MED", "MECH", "CIVIL", "ECE", "PHARMACY"];

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/roll number and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const data = await login(identifier.trim(), password.trim(), role);
      if (data.user) {
        navigate(`/${data.user.role}/dashboard`);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cb-login-page">
      {/* ── Left branding panel ── */}
      <div
        className="cb-login-panel"
        style={{ background: `linear-gradient(155deg, ${C.primary} 0%, #8B7FFF 100%)` }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "rgba(255,255,255,0.2)", display: "flex",
          alignItems: "center", justifyContent: "center", marginBottom: 20,
        }}>
          <Icons.GradCap size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 6 }}>
          KR Mangalam University
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 32 }}>
          Campus Bridge — Unified Student Portal
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          {[["12,000+", "Students"], ["100+", "Programs"], ["800+", "Faculty"], ["NAAC A", "Ranked"]].map(([v, l]) => (
            <div key={l} style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 14,
              padding: "14px 12px", textAlign: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 36, textAlign: "center" }}>
          © 2025 KR Mangalam University · Gurugram, Haryana
        </p>
      </div>

      {/* ── Right form ── */}
      <div className="cb-login-form">
        <div className="cb-login-form-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icons.GradCap size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Campus Bridge</span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4 }}>Welcome back!</h2>
          <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 24 }}>Sign in to your campus account</p>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sign in as</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {ROLES.map(({ key, label, I, color }) => (
                <button key={key} onClick={() => setRole(key)} style={{
                  border: `2px solid ${role === key ? color : C.border}`,
                  borderRadius: 12, padding: "12px 8px", cursor: "pointer",
                  background: role === key ? color + "14" : C.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.18s",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: role === key ? color + "22" : C.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <I size={16} color={role === key ? color : C.sub} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: role === key ? color : C.sub }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              borderRadius: 10, background: "#FFF0F0", marginBottom: 16,
              border: "1.5px solid #FFD6D6",
            }}>
              <Icons.Info size={14} color="#E53E3E" />
              <span style={{ fontSize: 12, color: "#E53E3E", fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            <Input
              label={role === "student" ? "Roll Number" : "College Email ID"}
              placeholder={role === "student" ? "e.g. 2022CSE047" : `${role}@krmu.edu.in`}
              value={identifier} onChange={setIdentifier}
              icon={role === "student"
                ? <Icons.User size={14} color={C.sub} />
                : <Icons.Mail size={14} color={C.sub} />}
            />
            <Input label="Password" type="password" placeholder="••••••••"
              value={password} onChange={setPassword}
              icon={<Icons.Lock size={14} color={C.sub} />} />
            <div style={{ textAlign: "right" }}>
              <button onClick={() => navigate("/forgot-password")} style={{ fontSize: 12, fontWeight: 700, color: C.primary, background: "none", border: "none", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              width: "100%", padding: "13px", borderRadius: 13, border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              background: isLoading
                ? "#A0A0A0"
                : `linear-gradient(90deg, ${ROLE_COLORS[role]}, ${ROLE_COLORS[role]}cc)`,
              color: "#fff", fontSize: 14, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: isLoading ? 0.8 : 1, transition: "all 0.2s",
            }}
          >
            {isLoading ? "Signing in…" : `Sign In as ${ROLE_LABELS[role]}`}
            {!isLoading && <Icons.ArrowRight size={16} color="#fff" />}
          </button>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.sub }}>
            <button onClick={() => navigate("/register")} style={{ color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              Register New User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
