// Profile service — handles user profiles with social links
const supabase = require('../supabaseClient');
const { AppError } = require('../utils/response');

class ProfileService {
  async getProfile(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) throw new AppError('User not found', 404);

    let profile = { ...user };

    if (user.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*, social_links(*)')
        .eq('user_id', userId)
        .single();
      if (student) {
        profile = { ...profile, ...student, social_links: student.social_links || [] };
      }
    } else if (user.role === 'faculty') {
      const { data: faculty } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (faculty) profile = { ...profile, ...faculty };
    }

    return profile;
  }

  async getStudentProfile(studentId) {
    const { data, error } = await supabase
      .from('students')
      .select('*, users(id, name, email, department, created_at), social_links(*)')
      .eq('id', studentId)
      .single();

    if (error || !data) throw new AppError('Student not found', 404);
    return data;
  }

  async updateProfile(userId, updates) {
    // Only admin can update profiles
    const { data, error } = await supabase
      .from('users')
      .update({ name: updates.name, department: updates.department })
      .eq('id', userId)
      .select('id, name, email, role, department')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Update role-specific table
    if (updates.role === 'student' && updates.roll_number) {
      await supabase
        .from('students')
        .update({
          roll_number: updates.roll_number,
          semester: updates.semester,
          section: updates.section,
          batch: updates.batch,
          phone: updates.phone,
        })
        .eq('user_id', userId);
    }

    if (updates.role === 'faculty') {
      await supabase
        .from('faculty')
        .update({
          designation: updates.designation,
          office: updates.office,
          phone: updates.phone,
        })
        .eq('user_id', userId);
    }

    return data;
  }

  async updateSocialLinks(studentId, links) {
    // Delete existing links
    await supabase
      .from('social_links')
      .delete()
      .eq('student_id', studentId);

    // Insert new links
    if (links && links.length > 0) {
      const linksData = links.map(link => ({
        student_id: studentId,
        platform: link.platform,
        url: link.url,
        username: link.username,
      }));

      const { data, error } = await supabase
        .from('social_links')
        .insert(linksData)
        .select();

      if (error) throw new AppError(error.message, 400);
      return data;
    }

    return [];
  }

  async getSocialLinks(studentId) {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw new AppError(error.message, 400);
    return data || [];
  }
}

module.exports = new ProfileService();
