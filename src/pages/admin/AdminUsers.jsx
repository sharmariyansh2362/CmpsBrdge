import { useState, useEffect, Fragment } from "react";
import { C } from "../../constants/colors";
import { useApp } from "../../context/AppContext";
import { Card, Btn, Input } from "../../Components/ui";

export default function AdminUsers() {
  const { apiCall } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [dept, setDept] = useState("CSE");
  const [extraId, setExtraId] = useState("");
  const [semester, setSemester] = useState("1");
  const [section, setSection] = useState("A");

  // Course states
  const [courses, setCourses] = useState([]);
  const [enrollUserId, setEnrollUserId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Add course form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseDept, setCourseDept] = useState("CSE");
  const [courseFaculty, setCourseFaculty] = useState("");
  const [courseSemester, setCourseSemester] = useState("1");
  const [courseCredits, setCourseCredits] = useState("4");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/admin/users");
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiCall("/api/admin/courses");
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, [apiCall]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiCall("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role, department: dept, extraId, semester, section })
      });
      setShowAddForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await apiCall(`/api/admin/users/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, role, department: dept, semester, section })
      });
      setEditId(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiCall(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEnroll = async (userId) => {
    if (!selectedCourse) return alert("Please select a course");
    try {
      await apiCall(`/api/admin/users/${userId}/enroll`, {
        method: "POST",
        body: JSON.stringify({ course_id: selectedCourse })
      });
      alert("Course assigned successfully!");
      setEnrollUserId(null);
      setSelectedCourse("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      await apiCall("/api/admin/courses", {
        method: "POST",
        body: JSON.stringify({
          name: courseName, code: courseCode, department: courseDept,
          faculty_id: courseFaculty, semester: courseSemester, credits: courseCredits
        })
      });
      setShowCourseForm(false);
      setCourseName(""); setCourseCode(""); setCourseFaculty("");
      fetchCourses();
      alert("Course added!");
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("student");
    setDept("CSE");
    setExtraId("");
    setSemester("1");
    setSection("A");
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setDept(u.department || "");
    setSemester(u.semester || "1");
    setSection(u.section || "A");
  };

  if (loading) return <div style={{ padding: 40 }}>Loading users directory...</div>;
  if (error) return <div style={{ padding: 40, color: '#E53E3E' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>System Users Directory</h2>
          <p style={{ color: C.sub, fontSize: 13, margin: '4px 0 0 0' }}>Manage student, faculty, and administrator accounts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!showCourseForm && (
            <Btn onClick={() => setShowCourseForm(true)} color="#10B981">Add Course</Btn>
          )}
          {!showAddForm && !editId && (
            <Btn onClick={() => setShowAddForm(true)} color="#EC4899">Add New User</Btn>
          )}
        </div>
      </div>

      {/* Add Course Form */}
      {showCourseForm && (
        <Card p={24} style={{ marginBottom: 24 }}>
          <h3>Add New Course</h3>
          <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Course Name" value={courseName} onChange={setCourseName} required />
              <Input label="Course Code" value={courseCode} onChange={setCourseCode} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Department" value={courseDept} onChange={setCourseDept} />
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Faculty</label>
                <select value={courseFaculty} onChange={(e) => setCourseFaculty(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', outline: 'none' }}>
                  <option value="">Select faculty</option>
                  {users.filter(u => u.role === 'faculty').map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Semester</label>
                <select value={courseSemester} onChange={(e) => setCourseSemester(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', outline: 'none' }}>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <Input label="Credits" type="number" value={courseCredits} onChange={setCourseCredits} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn type="submit" color="#10B981">Create Course</Btn>
              <Btn color="#6F767E" onClick={() => setShowCourseForm(false)}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Add/Edit User Form */}
      {(showAddForm || editId) && (
        <Card p={24} style={{ marginBottom: 24 }}>
          <h3>{editId ? "Edit User Account" : "Create New User Account"}</h3>
          <form onSubmit={editId ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Full Name" value={name} onChange={setName} required />
              <Input label="Email ID" type="email" value={email} onChange={setEmail} required />
            </div>

            {!editId && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Input label="Password" type="password" value={password} onChange={setPassword} required />
                <Input label="Enrollment / Employee ID" value={extraId} onChange={setExtraId} placeholder="Optional" />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', outline: 'none' }}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <Input label="Department" value={dept} onChange={setDept} />
            </div>

            {role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Semester</label>
                  <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', outline: 'none' }}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.sub, display: 'block', marginBottom: 6 }}>Section</label>
                  <select value={section} onChange={(e) => setSection(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1.5px solid #EAEAEA', outline: 'none' }}>
                    {["A","B","C","D"].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <Btn type="submit" color="#EC4899">{editId ? "Save Changes" : "Create Account"}</Btn>
              <Btn color="#6F767E" onClick={() => { setShowAddForm(false); setEditId(null); resetForm(); }}>Cancel</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Table */}
      <Card p={20}>
        <table className="cb-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #EEE' }}>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Email</th>
              <th style={{ padding: 12 }}>Role</th>
              <th style={{ padding: 12 }}>Department</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <Fragment key={u.id}>
                <tr style={{ borderBottom: '1px solid #FAFAFA' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: 12 }}>{u.email}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                      background: u.role === 'admin' ? '#FCE7F3' : u.role === 'faculty' ? '#FFF3E0' : '#F8F7FF',
                      color: u.role === 'admin' ? '#DB2777' : u.role === 'faculty' ? '#F57C00' : '#6C5CE7'
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: 12 }}>{u.department || '—'}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    {u.role === 'student' && (
                      <button onClick={() => setEnrollUserId(enrollUserId === u.id ? null : u.id)} style={{ marginRight: 12, background: 'none', border: 'none', color: '#10B981', fontWeight: 700, cursor: 'pointer' }}>Add Course</button>
                    )}
                    <button onClick={() => startEdit(u)} style={{ marginRight: 12, background: 'none', border: 'none', color: '#6C5CE7', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
                {enrollUserId === u.id && (
                  <tr>
                    <td colSpan={5} style={{ padding: 12, background: '#F8F9FA' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #EAEAEA', outline: 'none', flex: 1 }}>
                          <option value="">Select a course</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                          ))}
                        </select>
                        <Btn color="#10B981" onClick={() => handleEnroll(u.id)}>Assign</Btn>
                        <Btn color="#6F767E" onClick={() => { setEnrollUserId(null); setSelectedCourse(""); }}>Cancel</Btn>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}