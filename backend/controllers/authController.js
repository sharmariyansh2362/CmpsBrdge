// Auth controller — thin route handlers that delegate to service
const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);
    res.json(result);
  } catch (err) { next(err); }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json(result);
  } catch (err) { next(err); }
};

const logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

module.exports = { login, register, getMe, forgotPassword, resetPassword, logout };
