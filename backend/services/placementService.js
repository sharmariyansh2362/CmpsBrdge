// Placement service — business logic for placement cell
const supabase = require('../supabaseClient');
const { AppError } = require('../utils/response');

class PlacementService {
  async getDrives(filters = {}) {
    let query = supabase
      .from('placement_drives')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.department) query = query.contains('eligible_departments', [filters.department]);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 400);
    return data || [];
  }

  async getDriveById(id) {
    const { data, error } = await supabase
      .from('placement_drives')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new AppError('Placement drive not found', 404);
    return data;
  }

  async createDrive(driveData) {
    const { data, error } = await supabase
      .from('placement_drives')
      .insert(driveData)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

  async updateDrive(id, updates) {
    const { data, error } = await supabase
      .from('placement_drives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    return data;
  }

 async applyToDrive(driveId, studentId, resumeUrl) {
  const { data: existing } = await supabase
    .from('placement_applications')
    .select('id')
    .eq('drive_id', driveId)
    .eq('student_id', studentId)
    .single();

  if (existing) throw new AppError('Already applied to this drive', 409);

  const { data, error } = await supabase
    .from('placement_applications')
    .insert({ drive_id: driveId, student_id: studentId, status: 'applied', resume_url: resumeUrl })
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
}   

  async getStudentApplications(studentId) {
    const { data, error } = await supabase
      .from('placement_applications')
      .select('*, placement_drives(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);
    return data || [];
  }
  async getDriveApplicants(driveId) {
    const { data, error } = await supabase
      .from('placement_applications')
      .select('*, students(enrollment_no, users(name, email))')
      .eq('drive_id', driveId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);
    return data || [];
  }
  async updateApplicationStatus(applicationId, status) {
  const { data, error } = await supabase
    .from('placement_applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
}

  async getStats() {
    const { data: drives } = await supabase
      .from('placement_drives')
      .select('id, status, package_lpa'); 

    const { data: applications } = await supabase
      .from('placement_applications')
      .select('id, status');

    const totalDrives = drives?.length || 0;
    const activeDrives = drives?.filter(d => d.status === 'upcoming' || d.status === 'ongoing').length || 0;
    const totalApplications = applications?.length || 0;
    const placed = applications?.filter(a => a.status === 'placed').length || 0;
    const avgPackage = drives?.length
      ? (drives.reduce((sum, d) => sum + (d.package_lpa || 0), 0) / drives.length).toFixed(1)
      : '0';

    return { totalDrives, activeDrives, totalApplications, placed, avgPackage };
  }
}

module.exports = new PlacementService();
