import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";
import { Input, Btn } from "../../Components/ui";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const sendOTP = async () => {
    if (!email) return setError("Email required");
    setLoading(true);
    setError("");
    try {
const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/auth/forgot-password`, {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(2);
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) return setError("All fields required");
    setLoading(true);
    setError("");
    try {
const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/auth/reset-password`, {        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-login-page">
      <div className="cb-login-form">
        <div className="cb-login-form-inner">
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, marginBottom: 4 }}>
            Forgot Password
          </h2>
          <p style={{ fontSize: 13.5, color: C.sub, marginBottom: 24 }}>
            {step === 1 ? "Enter your email to receive OTP" : "Enter OTP and new password"}
          </p>

          {error && (
            <div style={{ background: "#FFF0F0", color: "#E53E3E", padding: 10, borderRadius: 8, marginBottom: 12 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: "#F0FFF4", color: "#38A169", padding: 10, borderRadius: 8, marginBottom: 12 }}>
              {success}
            </div>
          )}

          {step === 1 ? (
            <>
              <Input label="Email" type="email" value={email} onChange={setEmail} />
              <Btn onClick={sendOTP} disabled={loading} color={C.primary} full>
                {loading ? "Sending..." : "Send OTP"}
              </Btn>
            </>
          ) : (
            <>
              <Input label="OTP" value={otp} onChange={setOtp} placeholder="Enter 6 digit OTP" />
              <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} />
              <Btn onClick={resetPassword} disabled={loading} color={C.primary} full>
                {loading ? "Resetting..." : "Reset Password"}
              </Btn>
            </>
          )}

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => navigate("/login")} style={{ color: C.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
