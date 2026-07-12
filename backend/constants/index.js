// Constants used across the backend
module.exports = {
  ROLES: {
    STUDENT: 'student',
    FACULTY: 'faculty',
    ADMIN: 'admin',
  },
  APPLICATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    UNDER_REVIEW: 'under_review',
  },
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
  },
  PLACEMENT_STATUS: {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
  },
  LOST_FOUND_CATEGORY: {
    LOST: 'lost',
    FOUND: 'found',
  },
};
