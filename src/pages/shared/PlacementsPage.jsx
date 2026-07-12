import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { PLACEMENT_DRIVES } from "../../constants/data";
import { Card, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function PlacementsPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState("drives"); // drives, applications, stats
  const [drives, setDrives] = useState(PLACEMENT_DRIVES);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [appliedDrives, setAppliedDrives] = useState(["PD003"]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating new drive
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPackage, setNewPackage] = useState("");
  const [newType, setNewType] = useState("Full-time");
  const [newMinCGPA, setNewMinCGPA] = useState("7.0");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleApply = (drive) => {
    setSelectedDrive(drive);
    setShowApplyModal(true);
  };

  const submitApplication = () => {
    if (!resumeUrl.trim()) return;
    setAppliedDrives([...appliedDrives, selectedDrive.id]);
    setShowApplyModal(false);
    setResumeUrl("");
    alert(`Successfully applied to ${selectedDrive.company} for the role of ${selectedDrive.role}!`);
  };

  const handleCreateDrive = () => {
    if (!newCompany || !newRole || !newPackage) return;
    const newDrive = {
      id: `PD00${drives.length + 1}`,
      company: newCompany,
      logo: newCompany[0],
      role: newRole,
      package: `₹${newPackage} LPA`,
      type: newType,
      deadline: newDeadline || "Jul 31, 2025",
      status: "upcoming",
      eligible: ["CSE", "IT", "ECE"],
      minCGPA: parseFloat(newMinCGPA),
      description: newDescription,
      color: C.primary,
    };
    setDrives([newDrive, ...drives]);
    setShowCreateModal(false);
    // Reset fields
    setNewCompany("");
    setNewRole("");
    setNewPackage("");
    setNewMinCGPA("7.0");
    setNewDeadline("");
    setNewDescription("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming": return <Badge label="Upcoming" color={C.primary} />;
      case "ongoing": return <Badge label="Ongoing" color={C.success} />;
      case "completed": return <Badge label="Completed" color={C.sub} />;
      default: return <Badge label={status} color={C.sub} />;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px",
        borderRadius: "20px",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Training & Placement Cell</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: "600px" }}>
            Explore career opportunities, register for active placement drives, and track your recruitment status all in one centralized hub.
          </p>
        </div>
        <div style={{
          position: "absolute",
          right: "20px",
          bottom: "-20px",
          opacity: 0.1,
          fontSize: 140,
          fontWeight: 900,
          userSelect: "none"
        }}>💼</div>
      </div>

      {/* Tabs / Actions */}
      <div className="cb-flex-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, background: "#fff", padding: 4, borderRadius: 12, border: `1.5px solid ${C.border}` }}>
          {[
            { id: "drives", label: "Placement Drives", icon: Icons.Briefcase },
            { id: "applications", label: "My Applications", icon: Icons.FileText, hide: user.role !== "student" },
            { id: "stats", label: "Placement Insights", icon: Icons.BarChart }
          ].map(tab => {
            if (tab.hide) return null;
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "none",
                  background: active ? ROLE_COLORS[user.role] : "transparent",
                  color: active ? "#fff" : C.sub,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                <Icon size={15} color={active ? "#fff" : C.sub} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {user.role !== "student" && (
          <Btn onClick={() => setShowCreateModal(true)} style={{ gap: 8 }}>
            <Icons.Plus size={16} /> New Placement Drive
          </Btn>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === "drives" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {drives.map(drive => {
            const hasApplied = appliedDrives.includes(drive.id);
            return (
              <Card key={drive.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="cb-flex-between">
                  <div className="cb-flex" style={{ gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: drive.color + "14",
                      color: drive.color || C.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800
                    }}>
                      {drive.logo}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{drive.company}</h4>
                      <p style={{ fontSize: 12, color: C.sub }}>{drive.type}</p>
                    </div>
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{drive.role}</div>
                  <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5, height: 38, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical" }}>
                    {drive.description}
                  </p>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.sub }}>Package</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{drive.package}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.sub }}>Min. CGPA</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{drive.minCGPA || "0.0"}</div>
                  </div>
                </div>

                <div className="cb-flex-between" style={{ marginTop: "auto", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.danger }}>
                    <Icons.Clock size={12} color={C.danger} />
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>Deadline: {drive.deadline}</span>
                  </div>
                  {user.role === "student" ? (
                    hasApplied ? (
                      <Badge label="Applied" color={C.success} />
                    ) : drive.status === "completed" ? (
                      <button disabled style={{ padding: "6px 12px", border: "none", background: C.bg, color: C.sub, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>
                        Closed
                      </button>
                    ) : (
                      <Btn sm onClick={() => handleApply(drive)}>Apply Now</Btn>
                    )
                  ) : (
                    <Btn sm variant="outline" onClick={() => { setSelectedDrive(drive); alert(`Edit functionality or viewing applications for ${drive.company}`); }}>
                      Manage Candidates
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "applications" && (
        <Card p={0}>
          <div style={{ overflowX: "auto" }}>
            <table className="cb-table" style={{ width: "100%", margin: 0 }}>
              <thead>
                <tr style={{ background: "#F8F7FF" }}>
                  <th style={{ padding: "16px 20px" }}>Company</th>
                  <th style={{ padding: "16px 20px" }}>Role</th>
                  <th style={{ padding: "16px 20px" }}>Type</th>
                  <th style={{ padding: "16px 20px" }}>Package</th>
                  <th style={{ padding: "16px 20px" }}>Applied Date</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {drives.filter(d => appliedDrives.includes(d.id)).map(drive => (
                  <tr key={drive.id}>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>
                      <div className="cb-flex" style={{ gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: drive.color + "14", color: drive.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                          {drive.logo}
                        </div>
                        {drive.company}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", color: C.text }}>{drive.role}</td>
                    <td style={{ padding: "16px 20px", color: C.sub }}>{drive.type}</td>
                    <td style={{ padding: "16px 20px", fontWeight: 700, color: C.text }}>{drive.package}</td>
                    <td style={{ padding: "16px 20px", color: C.sub }}>Today</td>
                    <td style={{ padding: "16px 20px" }}>
                      <Badge label={drive.status === "completed" ? "Placed" : "In Review"} color={drive.status === "completed" ? C.success : C.primary} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.primarySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Briefcase size={20} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{drives.length}</div>
                <div style={{ fontSize: 12, color: C.sub }}>Total Companies Visited</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.success, fontWeight: 700 }}>+12% increase from last semester</div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.CheckCircle size={20} color={C.success} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>87.4%</div>
                <div style={{ fontSize: 12, color: C.sub }}>Placement Percentage</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.primary, fontWeight: 700 }}>B.Tech CSE Leading (94.2%)</div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Award size={20} color={C.orange} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹45.0 LPA</div>
                <div style={{ fontSize: 12, color: C.sub }}>Highest Package Offered</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.sub }}>Offered by Google (SDE Role)</div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Activity size={20} color={C.teal} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹11.2 LPA</div>
                <div style={{ fontSize: 12, color: C.sub }}>Average Package Offered</div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.success, fontWeight: 700 }}>+8.4% growth year-on-year</div>
          </Card>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedDrive && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowApplyModal(false)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 440,
            display: "flex", flexDirection: "column", gap: 18
          }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Apply to {selectedDrive.company}</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>

            <div style={{ background: "#F8F7FF", padding: 12, borderRadius: 12, fontSize: 12.5, color: C.sub }}>
              <strong>Role:</strong> {selectedDrive.role} <br />
              <strong>Criteria:</strong> Min. CGPA {selectedDrive.minCGPA || "0.0"}
            </div>

            <Input
              label="Resume Link (Google Drive / GitHub)"
              placeholder="https://drive.google.com/..."
              value={resumeUrl}
              onChange={setResumeUrl}
            />

            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowApplyModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={submitApplication} disabled={!resumeUrl.trim()} style={{ flex: 1 }}>Submit Application</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Create Drive Modal (Admin/Faculty) */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 500,
            display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto"
          }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Add Placement Drive</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Company Name" placeholder="Google, Microsoft, etc." value={newCompany} onChange={setNewCompany} />
              <Input label="Job Role" placeholder="e.g. SDE Intern" value={newRole} onChange={setNewRole} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Package (LPA)" placeholder="e.g. 12" value={newPackage} onChange={setNewPackage} />
              <div className="cb-input-wrap">
                <label className="cb-label">Job Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  style={{
                    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                    padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                    fontFamily: "inherit", color: C.text
                  }}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Min. CGPA Criteria" placeholder="e.g. 7.5" value={newMinCGPA} onChange={setNewMinCGPA} />
              <Input label="Registration Deadline" type="date" value={newDeadline} onChange={setNewDeadline} />
            </div>

            <div className="cb-input-wrap">
              <label className="cb-label">Role Description</label>
              <textarea
                placeholder="Job description, expectations, eligibility..."
                rows={3}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12,
                  padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none",
                  fontFamily: "inherit", color: C.text, resize: "none"
                }}
              />
            </div>

            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleCreateDrive} style={{ flex: 1 }}>Create Drive</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
