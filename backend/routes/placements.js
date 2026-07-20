// Placement routes
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/authMiddleware');
const placementCtrl = require('../controllers/placementController');

// Public-ish routes (still need auth)
router.get('/drives', verifyToken, placementCtrl.getDrives);
router.get('/drives/:id', verifyToken, placementCtrl.getDriveById);
router.get('/stats', verifyToken, placementCtrl.getStats);

// Student routes
router.post('/drives/:id/apply', verifyToken, permit('student'), placementCtrl.applyToDrive);
router.get('/applications/:studentId', verifyToken, placementCtrl.getStudentApplications);

// Admin/Faculty routes
router.post('/drives', verifyToken, permit('admin', 'faculty'), placementCtrl.createDrive);
router.put('/drives/:id', verifyToken, permit('admin', 'faculty'), placementCtrl.updateDrive);
router.get('/drives/:id/applicants', verifyToken, permit('admin', 'faculty'), placementCtrl.getDriveApplicants);
router.put('/applications/:id/status', verifyToken, permit('admin', 'faculty'), placementCtrl.updateApplicationStatus);

module.exports = router;