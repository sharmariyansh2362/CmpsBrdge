import { useState } from "react";
import { C, ROLE_COLORS } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { DEMO_USERS, DEMO_SOCIAL_LINKS } from "../../constants/data";
import { Card, Badge, Input, Btn } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function FacultyProfile() {
  const { user } = useApp();
  const [profile, setProfile] = useState(DEMO_USERS.faculty);
  const [socialLinks, setSocialLinks] = useState([
    { platform: "linkedin", url: "https://linkedin.com/in/priyasharma", username: "priyasharma" },
    { platform: "portfolio", url: "https://priyasharma.academic.net", username: "priyasharma.net" }
  ]);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  // Edit social links form state
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("priyasharma");
  const [twitter, setTwitter] = useState("");
  const [portfolio, setPortfolio] = useState("priyasharma.net");

  const handleSaveSocials = () => {
    const updatedLinks = [
      { platform: "github", url: `https://github.com/${github}`, username: github },
      { platform: "linkedin", url: `https://linkedin.com/in/${linkedin}`, username: linkedin },
      { platform: "twitter", url: `https://twitter.com/${twitter}`, username: twitter },
      { platform: "portfolio", url: portfolio.startsWith("http") ? portfolio : `https://${portfolio}`, username: portfolio },
    ].filter(link => link.username.trim() !== "");

    setSocialLinks(updatedLinks);
    setIsEditingSocials(false);
    alert("Profile social links updated successfully!");
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "github": return <Icons.GitHub size={16} color="#333" />;
      case "linkedin": return <Icons.Linkedin size={16} color="#0A66C2" />;
      case "twitter": return <Icons.Twitter size={16} color="#1DA1F2" />;
      case "portfolio": return <Icons.Globe size={16} color={C.orange} />;
      default: return <Icons.ExternalLink size={16} color={C.sub} />;
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }} className="cb-grid-sidebar">
      {/* Profile Details Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Modern minimal header card */}
        <Card p={24} style={{ display: "flex", alignItems: "center", gap: 20, borderLeft: `5px solid ${C.orange}` }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: C.orange + "18", color: C.orange, fontSize: 26,
            fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {profile.name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{profile.name}</h3>
            <p style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
              {profile.designation} &bull; {profile.department}
            </p>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Badge label={profile.experience} color={C.orange} />
              <Badge label={`Joined ${profile.joiningDate}`} color={C.teal} />
            </div>
          </div>
        </Card>

        {/* Detailed Info Card */}
        <Card p={24} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Official Directory Profile</h4>
          <p style={{ fontSize: 12.5, color: C.sub, marginTop: -8 }}>
            Note: Designation and academic profile records can only be updated by the administration office.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Employee ID</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Office Venue</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.office}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Department</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.department}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Designation</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.designation}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Email Address</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, textTransform: "uppercase" }}>Phone Number</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 4 }}>{profile.phone}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Social Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card p={20}>
          <div className="cb-flex-between" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Social Profiles</h4>
            {!isEditingSocials ? (
              <button
                onClick={() => setIsEditingSocials(true)}
                style={{ background: "none", border: "none", color: C.orange, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
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
              <Input label="LinkedIn Username" placeholder="linkedin_username" value={linkedin} onChange={setLinkedin} />
              <Input label="GitHub Username" placeholder="github_username" value={github} onChange={setGithub} />
              <Input label="Twitter Handle" placeholder="twitter_handle" value={twitter} onChange={setTwitter} />
              <Input label="Academic Website" placeholder="website.net" value={portfolio} onChange={setPortfolio} />
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn sm variant="outline" onClick={() => setIsEditingSocials(false)} style={{ flex: 1 }}>Cancel</Btn>
                <Btn sm onClick={handleSaveSocials} style={{ flex: 1 }} color={C.orange}>Save</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
