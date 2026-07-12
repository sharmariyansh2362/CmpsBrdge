// Auth service — business logic for authentication
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');
const config = require('../config');
const { AppError } = require('../utils/response');

class AuthService {
  async login(email, password, role) {
    const isEmail = email.includes('@');
    let user = null;

    if (isEmail) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (error) console.error('User email query error:', error);
      user = data;
    } else {
      // Search by roll number (try roll_number first, fallback to enrollment_no)
      let student = null;
      let { data: rData, error: rErr } = await supabase
        .from('students')
        .select('*, users(*)')
        .ilike('roll_number', email)
        .single();

      if (!rErr) {
        student = rData;
      } else {
        const { data: eData, error: eErr } = await supabase
          .from('students')
          .select('*, users(*)')
          .ilike('enrollment_no', email)
          .single();
        if (!eErr) {
          student = eData;
        } else {
          console.error('Student query error (both roll_number and enrollment_no failed):', rErr.message, eErr.message);
        }
      }
      user = student?.users;
    }

    if (!user) throw new AppError('Invalid credentials', 401);
    if (role && user.role !== role) throw new AppError('Invalid credentials for this role', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  async register(data) {
    const { name, email, password, role, roll_number, department } = data;

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);

    const { error } = await supabase
      .from('applications')
      .insert({
        name, email, password: hashedPassword,
        role: role || 'student', roll_number, department,
        type: 'registration',
        description: `New ${role || 'student'} registration request`,
        status: 'pending',
      });

    if (error) throw new AppError(error.message, 400);
    return { message: 'Registration submitted! Wait for admin approval.' };
  }

  async getMe(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) throw new AppError('User not found', 404);
    return user;
  }

  async forgotPassword(email) {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (!user) throw new AppError('Email not found', 404);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await supabase
      .from('users')
      .update({
        reset_otp: otp,
        reset_otp_expiry: (Date.now() + 10 * 60 * 1000).toString(),
      })
      .eq('id', user.id);

    // Send OTP via Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Campus Bridge - Password Reset OTP',
      html: `
        <h2>Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Your OTP is: <h1>${otp}</h1></p>
        <p>Valid for 10 minutes only.</p>
      `,
    });

    return { message: 'OTP sent!' };
  }

  async resetPassword(email, otp, newPassword) {
    const { data: user } = await supabase
      .from('users')
      .select('id, reset_otp, reset_otp_expiry')
      .eq('email', email)
      .single();

    if (!user) throw new AppError('User not found', 404);
    if (user.reset_otp !== otp) throw new AppError('Invalid OTP', 400);

    const now = Date.now();
    const expiry = parseInt(user.reset_otp_expiry);
    if (now > expiry) throw new AppError('OTP expired', 400);

    const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds);

    await supabase
      .from('users')
      .update({ password: hashedPassword, reset_otp: null, reset_otp_expiry: null })
      .eq('id', user.id);

    return { message: 'Password reset successfully!' };
  }
}

module.exports = new AuthService();
