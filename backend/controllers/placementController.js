// Placement controller
const placementService = require('../services/placementService');

const getDrives = async (req, res, next) => {
  try {
    const drives = await placementService.getDrives(req.query);
    res.json(drives);
  } catch (err) { next(err); }
};

const getDriveById = async (req, res, next) => {
  try {
    const drive = await placementService.getDriveById(req.params.id);
    res.json(drive);
  } catch (err) { next(err); }
};

const createDrive = async (req, res, next) => {
  try {
    const drive = await placementService.createDrive(req.body);
    res.status(201).json(drive);
  } catch (err) { next(err); }
};

const updateDrive = async (req, res, next) => {
  try {
    const drive = await placementService.updateDrive(req.params.id, req.body);
    res.json(drive);
  } catch (err) { next(err); }
};

const applyToDrive = async (req, res, next) => {
  try {
    const application = await placementService.applyToDrive(req.params.id, req.body.student_id);
    res.status(201).json(application);
  } catch (err) { next(err); }
};

const getStudentApplications = async (req, res, next) => {
  try {
    const applications = await placementService.getStudentApplications(req.params.studentId);
    res.json(applications);
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await placementService.getStats();
    res.json(stats);
  } catch (err) { next(err); }
};

module.exports = { getDrives, getDriveById, createDrive, updateDrive, applyToDrive, getStudentApplications, getStats };
