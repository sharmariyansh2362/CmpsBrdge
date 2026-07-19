const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const { verifyToken, permit } = require("../middleware/authMiddleware");

router.use(verifyToken);

// Everyone → Get timetable for a semester+section
router.get("/", async (req, res) => {
  try {
    const { semester, section } = req.query;
    let query = supabase.from("timetable").select("*");
    if (semester) query = query.eq("semester", semester);
    if (section) query = query.eq("section", section);

    const { data, error } = await query.order("day").order("time_slot");
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin → Add a class
router.post("/", permit("admin"), async (req, res) => {
  try {
    const { semester, section, day, time_slot, subject, code, room, teacher } = req.body;
    const { data, error } = await supabase
      .from("timetable")
      .insert([{ semester, section, day, time_slot, subject, code, room, teacher }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin → Update a class
router.put("/:id", permit("admin"), async (req, res) => {
  try {
    const { semester, section, day, time_slot, subject, code, room, teacher } = req.body;
    const { data, error } = await supabase
      .from("timetable")
      .update({ semester, section, day, time_slot, subject, code, room, teacher })
      .eq("id", req.params.id)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin → Delete a class
router.delete("/:id", permit("admin"), async (req, res) => {
  try {
    const { error } = await supabase.from("timetable").delete().eq("id", req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;