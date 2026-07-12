// Academic Performance service
const supabase = require('../supabaseClient');
const { AppError } = require('../utils/response');

class AcademicService {
  async getStudentPerformance(studentId) {
    const { data, error } = await supabase
      .from('academic_performance')
      .select('*, courses(name, code, credits)')
      .eq('student_id', studentId)
      .order('semester', { ascending: true });

    if (error) throw new AppError(error.message, 400);
    return data || [];
  }

  async getPerformanceByCourse(courseId) {
    const { data, error } = await supabase
      .from('academic_performance')
      .select('*, students(roll_number, users(name, email))')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 400);
    return data || [];
  }

  async upsertGrade(performanceData) {
    const { student_id, course_id, semester } = performanceData;

    // Check if record exists
    const { data: existing } = await supabase
      .from('academic_performance')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .eq('semester', semester)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('academic_performance')
        .update(performanceData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new AppError(error.message, 400);
      return data;
    } else {
      const { data, error } = await supabase
        .from('academic_performance')
        .insert(performanceData)
        .select()
        .single();
      if (error) throw new AppError(error.message, 400);
      return data;
    }
  }

  async bulkUpsertGrades(grades) {
    const results = [];
    for (const grade of grades) {
      const result = await this.upsertGrade(grade);
      results.push(result);
    }
    return results;
  }

  async getSemesterSummary(studentId) {
    const { data, error } = await supabase
      .from('academic_performance')
      .select('semester, grade_point, courses(credits)')
      .eq('student_id', studentId);

    if (error) throw new AppError(error.message, 400);
    if (!data || data.length === 0) return { semesters: [], cgpa: 0 };

    // Group by semester and calculate SGPA
    const semesterMap = {};
    for (const record of data) {
      const sem = record.semester;
      if (!semesterMap[sem]) semesterMap[sem] = [];
      semesterMap[sem].push({
        gradePoint: record.grade_point || 0,
        credits: record.courses?.credits || 0,
      });
    }

    const semesters = Object.entries(semesterMap)
      .map(([sem, records]) => {
        const totalCredits = records.reduce((s, r) => s + r.credits, 0);
        const weightedSum = records.reduce((s, r) => s + r.gradePoint * r.credits, 0);
        const sgpa = totalCredits > 0 ? (weightedSum / totalCredits) : 0;
        return { semester: parseInt(sem), sgpa: parseFloat(sgpa.toFixed(2)), totalCredits };
      })
      .sort((a, b) => a.semester - b.semester);

    // Calculate CGPA
    const allCredits = semesters.reduce((s, sem) => s + sem.totalCredits, 0);
    const allWeighted = semesters.reduce((s, sem) => s + sem.sgpa * sem.totalCredits, 0);
    const cgpa = allCredits > 0 ? parseFloat((allWeighted / allCredits).toFixed(2)) : 0;

    return { semesters, cgpa };
  }
}

module.exports = new AcademicService();
