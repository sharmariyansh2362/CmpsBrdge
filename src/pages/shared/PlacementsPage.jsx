import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { C, ROLE_COLORS } from "../../constants/colors";
import { Card, Btn, Badge, Input } from "../../Components/ui";
import { Icons } from "../../Components/Icons";

export default function PlacementsPage() {
  const { user, apiCall } = useApp();
  const [activeTab, setActiveTab] = useState("drives");
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ totalDrives: 0, activeDrives: 0, totalApplications: 0, placed: 0, avgPackage: 0 });
  const [studentId, setStudentId] = useState(null);

  const [selectedDrive, setSelectedDrive] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applicants, setApplicants] = useState([]);

  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPackage, setNewPackage] = useState("");
  const [newType, setNewType] = useState("Full-time");
  const [newMinCGPA, setNewMinCGPA] = useState("7.0");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadDrives = () => {
    apiCall("/api/placements/drives").then(data => setDrives(data || [])).catch(err => console.error(err));
  };
  const loadStats = () => {
    apiCall("/api/placements/stats").then(data => setStats(data)).catch(err => console.error(err));
  };
  const loadApplications = (sid) => {
    if (!sid) return;
    apiCall(`/api/placements/applications/${sid}`).then(data => setApplications(data || [])).catch(err => console.error(err));
  };

  useEffect(() => {
    setLoading(true);
    const tasks = [loadDrives(), loadStats()];
    if (user.role === "student") {
      apiCall("/api/student/profile").then(profile => {
        setStudentId(profile.id);
        loadApplications(profile.id);
      }).catch(err => console.error(err)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const appliedDriveIds = applications.map(a => a.drive_id);

  const handleApply = (drive) => {
    setSelectedDrive(drive);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!resumeUrl.trim() || !studentId) return;
    try {
      await apiCall(`/api/placements/drives/${selectedDrive.id}/apply`, {
        method: "POST",
        body: JSON.stringify({ student_id: studentId, resume_url: resumeUrl })
      });
      alert(`Successfully applied to ${selectedDrive.company} for the role of ${selectedDrive.role}!`);
      setShowApplyModal(false);
      setResumeUrl("");
      loadApplications(studentId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateDrive = async () => {
    if (!newCompany || !newRole || !newPackage) return;
    try {
      await apiCall("/api/placements/drives", {
        method: "POST",
        body: JSON.stringify({
          company: newCompany,
          role: newRole,
          package_lpa: parseFloat(newPackage),
          type: newType,
          deadline: newDeadline || null,
          status: "upcoming",
          eligible_departments: ["CSE", "IT", "ECE"],
          min_cgpa: parseFloat(newMinCGPA),
          description: newDescription
        })
      });
      setShowCreateModal(false);
      setNewCompany(""); setNewRole(""); setNewPackage(""); setNewMinCGPA("7.0"); setNewDeadline(""); setNewDescription("");
      loadDrives();
      loadStats();
    } catch (err) {
      alert(err.message);
    }
  };
  const viewApplicants = async (drive) => {
    setSelectedDrive(drive);
    try {
      const data = await apiCall(`/api/placements/drives/${drive.id}/applicants`);
      setApplicants(data || []);
      setShowApplicantsModal(true);
    } catch (err) {
      alert(err.message);
    }
  };
  const changeApplicantStatus = async (applicationId, status) => {
    try {
      await apiCall(`/api/placements/applications/${applicationId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      const data = await apiCall(`/api/placements/drives/${selectedDrive.id}/applicants`);
      setApplicants(data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming": return <Badge label="Upcoming" color={C.primary} />;
      case "ongoing": return <Badge label="Ongoing" color={C.success} />;
      case "completed": return <Badge label="Completed" color={C.sub} />;
      default: return <Badge label={status} color={C.sub} />;
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
        padding: "32px", borderRadius: "20px", color: "#fff"
      }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Training & Placement Cell</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", maxWidth: "600px" }}>
          Explore career opportunities, register for active placement drives, and track your recruitment status.
        </p>
      </div>

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
                  display: "flex", alignItems: "center", gap: 8, border: "none",
                  background: active ? ROLE_COLORS[user.role] : "transparent",
                  color: active ? "#fff" : C.sub, padding: "8px 16px", borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: "pointer"
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

      {activeTab === "drives" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {drives.length === 0 ? (
            <Card p={30} style={{ textAlign: "center", color: C.sub, gridColumn: "1 / -1" }}>No placement drives posted yet.</Card>
          ) : drives.map(drive => {
            const hasApplied = appliedDriveIds.includes(drive.id);
            return (
              <Card key={drive.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="cb-flex-between">
                  <div className="cb-flex" style={{ gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: C.primarySoft, color: C.primary,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800
                    }}>
                      {drive.company?.[0]}
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
                  <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5, height: 38, overflow: "hidden", display: "-webkit-box", WebKitLineClamp: 2, WebKitBoxOrient: "vertical" }}>
                    {drive.description}
                  </p>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.sub }}>Package</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>₹{drive.package_lpa} LPA</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.sub }}>Min. CGPA</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{drive.min_cgpa || "0.0"}</div>
                  </div>
                </div>

                <div className="cb-flex-between" style={{ marginTop: "auto", borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: C.danger }}>
                    <Icons.Clock size={12} color={C.danger} />
                    <span style={{ fontSize: 11.5, fontWeight: 700 }}>Deadline: {drive.deadline || "N/A"}</span>
                  </div>
                  {user.role === "student" ? (
                    hasApplied ? (
                      <Badge label="Applied" color={C.success} />
                    ) : drive.status === "completed" ? (
                      <button disabled style={{ padding: "6px 12px", border: "none", background: C.bg, color: C.sub, borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Closed</button>
                    ) : (
                      <Btn sm onClick={() => handleApply(drive)}>Apply Now</Btn>
                    )
                  ) : (
                    <Btn sm variant="outline" onClick={() => viewApplicants(drive)}>View Applicants</Btn>
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
                  <th style={{ padding: "16px 20px" }}>Package</th>
                  <th style={{ padding: "16px 20px" }}>Applied Date</th>
                  <th style={{ padding: "16px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: 32, textAlign: "center", color: C.sub }}>No applications yet.</td></tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id}>
                      <td style={{ padding: "16px 20px", fontWeight: 700 }}>{app.placement_drives?.company}</td>
                      <td style={{ padding: "16px 20px" }}>{app.placement_drives?.role}</td>
                      <td style={{ padding: "16px 20px", fontWeight: 700 }}>₹{app.placement_drives?.package_lpa} LPA</td>
                      <td style={{ padding: "16px 20px", color: C.sub }}>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: "16px 20px" }}>
                        <Badge
                          label={
                            app.status === "placed" ? "Placed" :
                              app.status === "shortlisted" ? "Shortlisted" :
                                app.status === "rejected" ? "Rejected" : "In Review"
                          }
                          color={
                            app.status === "placed" ? C.success :
                              app.status === "shortlisted" ? C.orange :
                                app.status === "rejected" ? C.danger : C.primary
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
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
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{stats.totalDrives}</div>
                <div style={{ fontSize: 12, color: C.sub }}>Total Companies</div>
              </div>
            </div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.successSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.CheckCircle size={20} color={C.success} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{stats.placed}</div>
                <div style={{ fontSize: 12, color: C.sub }}>Students Placed</div>
              </div>
            </div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Award size={20} color={C.orange} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{stats.totalApplications}</div>
                <div style={{ fontSize: 12, color: C.sub }}>Total Applications</div>
              </div>
            </div>
          </Card>

          <Card p={20}>
            <div className="cb-flex" style={{ gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icons.Activity size={20} color={C.teal} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>₹{stats.avgPackage} LPA</div>
                <div style={{ fontSize: 12, color: C.sub }}>Average Package</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showApplyModal && selectedDrive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowApplyModal(false)}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", gap: 18 }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Apply to {selectedDrive.company}</h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>
            <div style={{ background: "#F8F7FF", padding: 12, borderRadius: 12, fontSize: 12.5, color: C.sub }}>
              <strong>Role:</strong> {selectedDrive.role} <br />
              <strong>Criteria:</strong> Min. CGPA {selectedDrive.min_cgpa || "0.0"}
            </div>
            <Input label="Resume Link (Google Drive / GitHub)" placeholder="https://drive.google.com/..." value={resumeUrl} onChange={setResumeUrl} />
            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowApplyModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={submitApplication} disabled={!resumeUrl.trim()} style={{ flex: 1 }}>Submit Application</Btn>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 500, display: "flex", flexDirection: "column", gap: 18, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
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
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none" }}>
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
              <textarea placeholder="Job description, expectations, eligibility..." rows={3} value={newDescription} onChange={e => setNewDescription(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 12, padding: 10, fontSize: 13.5, background: "#F8F7FF", outline: "none", resize: "none" }} />
            </div>
            <div className="cb-flex-between" style={{ gap: 12, marginTop: 8 }}>
              <Btn variant="outline" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={handleCreateDrive} style={{ flex: 1 }}>Create Drive</Btn>
            </div>
          </div>
        </div>
      )}
      {showApplicantsModal && selectedDrive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowApplicantsModal(false)}>
          <div style={{ background: "#fff", padding: 28, borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }} onClick={e => e.stopPropagation()}>
            <div className="cb-flex-between">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Applicants for {selectedDrive.company}</h3>
              <button onClick={() => setShowApplicantsModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Icons.X size={18} color={C.sub} />
              </button>
            </div>
            {applicants.length === 0 ? (
              <div style={{ textAlign: "center", color: C.sub, padding: 20 }}>No applicants yet.</div>
            ) : (
              <table className="cb-table" style={{ width: "100%" }}>
                <thead>
                  <tr style={{ background: "#F8F7FF" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Roll No</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Resume</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map(a => (
                    <tr key={a.id}>
                      <td style={{ padding: "10px 14px" }}>{a.students?.enrollment_no}</td>
                      <td style={{ padding: "10px 14px" }}>{a.students?.users?.name}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <a href={a.resume_url} target="_blank" rel="noreferrer" style={{ color: C.primary, fontWeight: 700 }}>View Resume</a>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <select
                          value={a.status}
                          onChange={e => changeApplicantStatus(a.id, e.target.value)}
                          style={{ border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="placed">Placed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}