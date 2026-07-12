import { useState, useEffect } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { useApi, useMutation } from "../../hooks/useApi";
import { DEMO_USERS, SOCIAL_PLATFORMS, DEMO_SOCIAL_LINKS } from "../../constants/data";
import { Card, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function StudentProfile() {
  const { user } = useApp();
  
  // Use local state fallback to demo data if api data is not available
  const [profile, setProfile] = useState(DEMO_USERS.student);
  const [socialLinks, setSocialLinks] = useState(DEMO_SOCIAL_LINKS);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  
  // Edit social links form state
  const [github, setGithub] = useState("arjunmehta");
  const [linkedin, setLinkedin] = useState("arjunmehta");
  const [leetcode, setLeetcode] = useState("arjunmehta");
  const [portfolio, setPortfolio] = useState("arjunmehta.dev");

  const handleSaveSocials = () => {
    const updatedLinks = [
      { platform: "github", url: `https://github.com/${github}`, username: github },
      { platform: "linkedin", url: `https://linkedin.com/in/${linkedin}`, username: linkedin },
      { platform: "leetcode", url: `https://leetcode.com/${leetcode}`, username: leetcode },
      { platform: "portfolio", url: portfolio.startsWith("http") ? portfolio : `https://${portfolio}`, username: portfolio },
    ].filter(link => link.username.trim() !== "");

    setSocialLinks(updatedLinks);
    setIsEditingSocials(false);
    alert("Social links updated successfully!");
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "github": return <Icons.GitHub size={16} color="#333" />;
      case "linkedin": return <Icons.Linkedin size={16} color="#0A66C2" />;
      case "leetcode": return <Icons.Code size={16} color="#FFA116" />;
      case "portfolio": return <Icons.Globe size={16} color={C.primary} />;
      default: return <Icons.ExternalLink size={16} color={C.sub} />;
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }} className="cb-grid-sidebar">
      {/* Main Profile Info */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card p={24} style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: C.primary + "18", color: C.primary, fontSize: 26,
            fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {profile.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{profile.name}</h3>
            <p style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
              Student · {profile.department}
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Badge label={profile.semester} color={C.primary} />
              <Badge label={`Batch ${profile.batch}`} color={C.orange} />
            </div>
          </div>
        </Card>

        {/* Profile details */}
        <Card p={24} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Academic Details</h4>
          <p style={{ fontSize: 12.5, color: C.sub, marginTop: -8 }}>
            Note: Academic profile records can only be updated by the administration office.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Roll Number</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.rollNo}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Department</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.department}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Section</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>Section {profile.section}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>GPA / CGPA</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.gpa}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Registered Email</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Mobile Number</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.phone}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar: Social Links & Accounts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card p={20}>
          <div className="cb-flex-between" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Social Profiles</h4>
            {!isEditingSocials ? (
              <button
                onClick={() => setIsEditingSocials(true)}
                style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
              >
                Edit
              </button>
            ) : null}
          </div>

          {!isEditingSocials ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {socialLinks.length === 0 ? (
                <div style={{ fontSize: 12, color: C.sub, textAlign: "center", padding: "12px 0" }}>
                  No social profiles linked yet.
                </div>
              ) : (
                socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textDecoration: "none",
                      color: C.text,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "#F8F7FF",
                      fontSize: 12.5,
                      fontWeight: 600,
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#EEEEFF"}
                    onMouseLeave={e => e.currentTarget.style.background = "#F8F7FF"}
                  >
                    {getPlatformIcon(link.platform)}
                    <span style={{ flex: 1 }} className="cb-text-ellipsis">{link.username}</span>
                    <Icons.ExternalLink size={12} color={C.sub} />
                  </a>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="GitHub Username" placeholder="github_username" value={github} onChange={setGithub} />
              <Input label="LinkedIn Username" placeholder="linkedin_username" value={linkedin} onChange={setLinkedin} />
              <Input label="LeetCode Username" placeholder="leetcode_username" value={leetcode} onChange={setLeetcode} />
              <Input label="Portfolio Link" placeholder="portfolio.dev" value={portfolio} onChange={setPortfolio} />
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn sm variant="outline" onClick={() => setIsEditingSocials(false)} style={{ flex: 1 }}>Cancel</Btn>
                <Btn sm onClick={handleSaveSocials} style={{ flex: 1 }}>Save</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
