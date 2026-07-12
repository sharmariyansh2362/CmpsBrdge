// Profile controller
const profileService = require('../services/profileService');

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) { next(err); }
};

const getStudentProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getStudentProfile(req.params.studentId);
    res.json(profile);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    // Only admin can update
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update profiles' });
    }
    const profile = await profileService.updateProfile(req.params.userId, req.body);
    res.json(profile);
  } catch (err) { next(err); }
};

const updateSocialLinks = async (req, res, next) => {
  try {
    const links = await profileService.updateSocialLinks(req.params.studentId, req.body.links);
    res.json(links);
  } catch (err) { next(err); }
};

const getSocialLinks = async (req, res, next) => {
  try {
    const links = await profileService.getSocialLinks(req.params.studentId);
    res.json(links);
  } catch (err) { next(err); }
};

module.exports = { getProfile, getStudentProfile, updateProfile, updateSocialLinks, getSocialLinks };
