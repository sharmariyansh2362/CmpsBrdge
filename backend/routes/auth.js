const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");
const { verifyToken } = require("../middleware/authMiddleware");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("---------------- LOGIN REQUEST ----------------");
    console.log("Identifier received:", email);
    console.log("Password received (length):", password ? password.length : 0);

    if (!email || !password) {
      console.log("Error: Missing credentials");
      return res.status(400).json({ error: "Credentials required" });
    }

    const isEmail = email.includes("@");
    let user = null;

    if (isEmail) {
      console.log("Searching user by email:", email);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      
      if (error) {
        console.error("Supabase user email query error:", error);
      }
      user = data;
    } else {
      console.log("Searching student by enrollment_no:", email);
      const { data: student, error } = await supabase
        .from("students")
        .select("*, users(*)")
        .ilike("enrollment_no", email)
        .single();

      if (error) {
        console.error("Supabase student enrollment query error:", error);
      }
      console.log("Student query returned data:", JSON.stringify(student, null, 2));
      user = student?.users;
    }

    console.log("Resolved User Object:", JSON.stringify(user, null, 2));

    if (!user) {
      console.log("Error: User record not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Comparing password hashes...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("bcrypt.compare result:", isMatch);

    if (!isMatch) {
      console.log("Error: Password hash did not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Authentication successful! Generating token...");
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    console.log("Sending response payload for:", userWithoutPassword.email);
    res.json({ token, user: userWithoutPassword });

  } catch (err) {
    console.error("Login error exception:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, enrollment_no } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    const existing = await supabase.from('users').select('id').eq('email', email).single();
    if (existing.data) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error: userErr } = await supabase.from('users').insert({ name, email, password: hashed, role: role || 'student' }).single();
    if (userErr) return res.status(500).json({ error: userErr.message });
    if ((role || 'student') === 'student' && enrollment_no) {
      await supabase.from('students').insert({ user_id: user.id, enrollment_no });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get("/me", verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, department, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;