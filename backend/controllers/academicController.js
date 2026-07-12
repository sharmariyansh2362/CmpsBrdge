// Academic performance controller
const academicService = require('../services/academicService');

const getStudentPerformance = async (req, res, next) => {
  try {
    const data = await academicService.getStudentPerformance(req.params.studentId);
    res.json(data);
  } catch (err) { next(err); }
};

const getPerformanceByCourse = async (req, res, next) => {
  try {
    const data = await academicService.getPerformanceByCourse(req.params.courseId);
    res.json(data);
  } catch (err) { next(err); }
};

const upsertGrade = async (req, res, next) => {
  try {
    const data = await academicService.upsertGrade(req.body);
    res.json(data);
  } catch (err) { next(err); }
};

const bulkUpsertGrades = async (req, res, next) => {
  try {
    const data = await academicService.bulkUpsertGrades(req.body.grades);
    res.json(data);
  } catch (err) { next(err); }
};

const getSemesterSummary = async (req, res, next) => {
  try {
    const data = await academicService.getSemesterSummary(req.params.studentId);
    res.json(data);
  } catch (err) { next(err); }
};

module.exports = { getStudentPerformance, getPerformanceByCourse, upsertGrade, bulkUpsertGrades, getSemesterSummary };
