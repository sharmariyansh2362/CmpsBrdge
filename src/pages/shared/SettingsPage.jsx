import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { C } from "../../constants/colors";
import { Card, Btn, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function SettingsPage() {
  const { user } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    alert("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "700px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Account Settings</h2>

      {/* Notifications Card */}
      <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="cb-flex" style={{ gap: 10 }}>
          <Icons.Bell size={18} color={C.primary} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Notification Preferences</h3>
        </div>
        <p style={{ fontSize: 13, color: C.sub }}>Configure how you receive updates and announcements.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          {[
            { label: "Email Notifications", desc: "Receive automated alerts, grades, and fee updates via registered email.", val: emailNotif, set: setEmailNotif },
            { label: "SMS Alerts", desc: "Get critical notifications (exams/results/holidays) directly on your mobile phone.", val: smsNotif, set: setSmsNotif },
            { label: "Push Notifications", desc: "In-app real-time notifications for messages and announcements.", val: pushNotif, set: setPushNotif }
          ].map((item, idx) => (
            <div key={idx} className="cb-flex-between" style={{ paddingBottom: 12, borderBottom: idx !== 2 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{item.label}</div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={item.val}
                onChange={(e) => item.set(e.target.checked)}
                style={{
                  width: 36, height: 18, borderRadius: 10, cursor: "pointer", accentColor: C.primary
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Security Card */}
      <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="cb-flex" style={{ gap: 10 }}>
          <Icons.Lock size={18} color={C.primary} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Change Password</h3>
        </div>
        <p style={{ fontSize: 13, color: C.sub }}>Update your password to keep your campus account secure.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={setNewPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>
          <Btn onClick={handlePasswordChange} style={{ alignSelf: "flex-end", marginTop: 8 }}>
            Update Password
          </Btn>
        </div>
      </Card>
    </div>
  );
}
