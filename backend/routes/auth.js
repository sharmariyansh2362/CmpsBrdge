const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { loginRules, registerRules, forgotPasswordRules, resetPasswordRules } = require('../validators/authValidator');
const { validate } = require('../middleware/validator');

// POST /api/auth/login
router.post('/login', loginRules, validate, authCtrl.login);

// POST /api/auth/register
router.post('/register', registerRules, validate, authCtrl.register);

// GET /api/auth/me
router.get('/me', verifyToken, authCtrl.getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPasswordRules, validate, authCtrl.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPasswordRules, validate, authCtrl.resetPassword);

// POST /api/auth/logout
router.post('/logout', verifyToken, authCtrl.logout);

module.exports = router;