// Profile routes
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/authMiddleware');
const profileCtrl = require('../controllers/profileController');

// Get own profile
router.get('/me', verifyToken, profileCtrl.getProfile);

// View a student's profile (any authenticated user)
router.get('/student/:studentId', verifyToken, profileCtrl.getStudentProfile);

// Update profile (admin only)
router.put('/:userId', verifyToken, permit('admin'), profileCtrl.updateProfile);

// Social links (student can manage their own)
router.get('/social-links/:studentId', verifyToken, profileCtrl.getSocialLinks);
router.put('/social-links/:studentId', verifyToken, profileCtrl.updateSocialLinks);

module.exports = router;
