const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Faculty → Get students for a course
router.get("/course/:courseId/students", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_courses")
      .select("students(id, enrollment_no, users(name))")
      .eq("course_id", req.params.courseId);

    if (error) return res.status(400).json({ error: error.message });
    const students = data.map(d => d.students);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Faculty → Mark attendance
router.post("/mark", async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Only faculty can mark attendance" });
    }

    const { course_id, date, attendance } = req.body;
    // attendance = [{ student_id, status }]

    const records = attendance.map(a => ({
      student_id: a.student_id,
      course_id,
      date,
      status: a.status,
      marked_by: req.user.id
    }));

    const { error } = await supabase
      .from("attendance")
      .upsert(records, { onConflict: "student_id,course_id,date" });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Attendance saved!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Student → Get own attendance
router.get("/my", async (req, res) => {
  try {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    const { data, error } = await supabase
      .from("attendance")
      .select("*, courses(name, code)")
      .eq("student_id", student.id)
      .order("date", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Student → Get attendance summary per course
router.get("/summary", async (req, res) => {
  try {
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    const { data, error } = await supabase
      .from("attendance")
      .select("status, courses(name, code)")
      .eq("student_id", student.id);

    if (error) return res.status(400).json({ error: error.message });

    // Group by course
    const summary = {};
    data.forEach(a => {
      const code = a.courses.code;
      if (!summary[code]) {
        summary[code] = { name: a.courses.name, code, total: 0, present: 0 };
      }
      summary[code].total++;
      if (a.status === "present") summary[code].present++;
    });

    const result = Object.values(summary).map(s => ({
      ...s,
      percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;