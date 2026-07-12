-- ╔══════════════════════════════════════════════════════════════════╗
-- ║        CAMPUS BRIDGE – SUPABASE DATABASE SCHEMA v2.0            ║
-- ║   Run this in: Supabase Dashboard → SQL Editor → New Query       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 1: users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    email       TEXT        UNIQUE NOT NULL,
    password    TEXT        NOT NULL,
    role        TEXT        NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    department  TEXT,
    reset_otp   TEXT,
    reset_otp_expiry TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 2: students  (uses roll_number instead of enrollment_no)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    roll_number     TEXT    UNIQUE NOT NULL,
    semester        INTEGER DEFAULT 1,
    department      TEXT,
    section         TEXT,
    batch           TEXT,
    phone           TEXT,
    address         TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 3: faculty
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faculty (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_id     TEXT    UNIQUE NOT NULL,
    department      TEXT,
    designation     TEXT    DEFAULT 'Lecturer',
    office          TEXT,
    phone           TEXT,
    experience      TEXT,
    joining_date    DATE
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 4: departments
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.departments (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT    UNIQUE NOT NULL,
    short_name  TEXT,
    head_id     UUID    REFERENCES public.faculty(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 5: courses
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.courses (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT    NOT NULL,
    code        TEXT    UNIQUE NOT NULL,
    department  TEXT,
    faculty_id  UUID    REFERENCES public.faculty(id) ON DELETE SET NULL,
    semester    INTEGER DEFAULT 1,
    credits     INTEGER DEFAULT 3
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 6: student_courses
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_courses (
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id   UUID    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, course_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 7: academic_performance
-- Faculty creates/edits grades, students view only
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_performance (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id       UUID    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    semester        INTEGER NOT NULL,
    internal_marks  DECIMAL(5,2),
    external_marks  DECIMAL(5,2),
    total_marks     DECIMAL(5,2),
    grade           TEXT,
    grade_point     DECIMAL(3,2),
    credits_earned  INTEGER DEFAULT 0,
    remarks         TEXT,
    updated_by      UUID    REFERENCES public.users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (student_id, course_id, semester)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 8: attendance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id   UUID    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    date        DATE    NOT NULL,
    status      TEXT    NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    marked_by   UUID    REFERENCES public.users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (student_id, course_id, date)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 9: timetable
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timetable (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id   UUID    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time  TIME    NOT NULL,
    end_time    TIME    NOT NULL,
    room        TEXT,
    section     TEXT,
    semester    INTEGER DEFAULT 1,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 10: announcements
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,
    posted_by   UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    role_target TEXT    DEFAULT 'all' CHECK (role_target IN ('all', 'student', 'faculty')),
    type        TEXT    DEFAULT 'notice' CHECK (type IN ('notice', 'event', 'exam', 'urgent')),
    pinned      BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 11: events
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    event_date  DATE    NOT NULL,
    start_time  TIME,
    end_time    TIME,
    venue       TEXT,
    organizer   TEXT,
    category    TEXT    DEFAULT 'general',
    created_by  UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 12: channels
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    created_by  UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 13: channel_messages
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_messages (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id  UUID    NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    message     TEXT    NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 14: lost_found
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lost_found (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    category    TEXT    NOT NULL CHECK (category IN ('lost', 'found')),
    image_url   TEXT,
    posted_by   UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    status      TEXT    DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 15: applications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID    REFERENCES public.students(id) ON DELETE CASCADE,
    name        TEXT,
    email       TEXT,
    password    TEXT,
    role        TEXT,
    roll_number TEXT,
    department  TEXT,
    type        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    status      TEXT    DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 16: placement_drives
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_drives (
    id                  UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name        TEXT    NOT NULL,
    company_logo        TEXT,
    role_title          TEXT    NOT NULL,
    description         TEXT    DEFAULT '',
    package_lpa         DECIMAL(5,2),
    location            TEXT,
    job_type            TEXT    DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'internship', 'contract')),
    eligible_departments TEXT[],
    min_cgpa            DECIMAL(3,2) DEFAULT 0,
    deadline            DATE,
    drive_date          DATE,
    status              TEXT    DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by          UUID    REFERENCES public.users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 17: placement_applications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.placement_applications (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    drive_id    UUID    NOT NULL REFERENCES public.placement_drives(id) ON DELETE CASCADE,
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status      TEXT    DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'placed', 'rejected')),
    resume_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (drive_id, student_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 18: social_links
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.social_links (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    platform    TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    username    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 19: notifications
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    type        TEXT    DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read     BOOLEAN DEFAULT false,
    link        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 20: admin_logs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    action          TEXT    NOT NULL,
    performed_by    UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    target_user     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    details         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email             ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role              ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id        ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number    ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id         ON public.faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id      ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_sc_student_id           ON public.student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_sc_course_id            ON public.student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_academic_student_id     ON public.academic_performance(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_course_id      ON public.academic_performance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id   ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course_id    ON public.attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date         ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_anns_created_at         ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date             ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_cm_channel_id           ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_lf_created_at           ON public.lost_found(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_student_id         ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_pd_status               ON public.placement_drives(status);
CREATE INDEX IF NOT EXISTS idx_pa_drive_id             ON public.placement_applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_pa_student_id           ON public.placement_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_social_student_id       ON public.social_links(student_id);
CREATE INDEX IF NOT EXISTS idx_notif_user_id           ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read              ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_logs_performed_by       ON public.admin_logs(performed_by);

-- ════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Rename enrollment_no to roll_number (if upgrading from v1)
-- ════════════════════════════════════════════════════════════════════════════
-- ALTER TABLE public.students RENAME COLUMN enrollment_no TO roll_number;
