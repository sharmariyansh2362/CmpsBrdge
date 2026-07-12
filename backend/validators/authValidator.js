const { body } = require('../middleware/validator');

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email or Roll Number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'faculty']).withMessage('Invalid role'),
  body('roll_number').optional().trim(),
  body('department').optional().trim(),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
];

const resetPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

module.exports = { loginRules, registerRules, forgotPasswordRules, resetPasswordRules };
