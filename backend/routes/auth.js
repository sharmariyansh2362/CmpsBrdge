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

    if (req.body.role && user.role !== req.body.role) {
      return res.status(401).json({ error: "Invalid credentials for this role" });
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
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, enrollment_no, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to applications table as pending
    const { error } = await supabase
      .from("applications")
      .insert({
        name,
        email,
        password: hashedPassword,
        role: role || "student",
        enrollment_no,
        department,
        type: "registration",
        description: `New ${role} registration request`,
        status: "pending"
      });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: "Registration submitted! Wait for admin approval." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
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

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with timestamp as plain number
    await supabase
      .from("users")
      .update({ 
        reset_otp: otp, 
        reset_otp_expiry: (Date.now() + 10 * 60 * 1000).toString()
      })
      .eq("id", user.id);

    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Campus Bridge - Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Your OTP is: <h1>${otp}</h1></p>
        <p>Valid for 10 minutes only.</p>
      `
    });

    res.json({ message: "OTP sent!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("id, reset_otp, reset_otp_expiry")
      .eq("email", email)
      .single();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check OTP
    if (user.reset_otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check expiry using plain number comparison
    const now = Date.now();
    const expiry = parseInt(user.reset_otp_expiry);

    console.log("Now:", now);
    console.log("Expiry:", expiry);
    console.log("Diff (seconds):", (expiry - now) / 1000);

    if (now > expiry) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await supabase
      .from("users")
      .update({ 
        password: hashedPassword,
        reset_otp: null,
        reset_otp_expiry: null
      })
      .eq("id", user.id);

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;