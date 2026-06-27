-- ╔══════════════════════════════════════════════════════════════════╗
-- ║        CAMPUS BRIDGE – SUPABASE DATABASE SCHEMA                  ║
-- ║   Run this in: Supabase Dashboard → SQL Editor → New Query       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 1: users
-- Core authentication table. All roles share this table.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT        NOT NULL,
    email       TEXT        UNIQUE NOT NULL,
    password    TEXT        NOT NULL,     -- bcrypt hashed (never plain text)
    role        TEXT        NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    department  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 2: students
-- Extended profile for users with role = 'student'
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrollment_no   TEXT    UNIQUE NOT NULL,
    semester        INTEGER DEFAULT 1,
    department      TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 3: faculty
-- Extended profile for users with role = 'faculty'
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faculty (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_id     TEXT    UNIQUE NOT NULL,
    department      TEXT,
    designation     TEXT    DEFAULT 'Lecturer'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 4: courses
-- Academic courses linked to a faculty member
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
-- TABLE 5: student_courses
-- Junction table — which student is enrolled in which course
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_courses (
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id   UUID    NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, course_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 6: announcements
-- College-wide or targeted announcements
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.announcements (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,
    posted_by   UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    role_target TEXT    DEFAULT 'all' CHECK (role_target IN ('all', 'student', 'faculty')),
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 7: channels
-- Course/topic-specific messaging channels
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channels (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    created_by  UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 8: channel_messages
-- Messages posted inside channels
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.channel_messages (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id  UUID    NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    message     TEXT    NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 9: lost_found
-- Campus lost and found bulletin board
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
-- TABLE 10: applications
-- Student applications (bonafide, fee waiver, leave, etc.)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
    id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id  UUID    NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type        TEXT    NOT NULL,   -- e.g. 'bonafide', 'fee_waiver', 'leave'
    description TEXT    DEFAULT '',
    status      TEXT    DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE 11: admin_logs
-- Audit trail of all admin actions
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
    action          TEXT    NOT NULL,
    performed_by    UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    target_user     UUID    REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email         ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role          ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_students_user_id    ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_user_id     ON public.faculty(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id  ON public.courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_sc_student_id       ON public.student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_sc_course_id        ON public.student_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_anns_created_at     ON public.announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cm_channel_id       ON public.channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_lf_created_at       ON public.lost_found(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_student_id     ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_logs_performed_by   ON public.admin_logs(performed_by);

-- ════════════════════════════════════════════════════════════════════════════
-- SEED DATA
-- Run this SEPARATELY after the schema above is created.
-- ════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS (passwords are bcrypt hashes)
-- Plain text passwords for testing:
--   Students & Faculty: Password@123
--   Admin:              Admin@12345
-- Generate your own at: https://bcrypt-generator.com (rounds: 12)
-- OR run in Node.js:  require('bcryptjs').hashSync('Password@123', 12)
-- ─────────────────────────────────────────────────────────────────────────────

-- ⚠️  IMPORTANT: Replace the password hashes below with real bcrypt hashes.
-- The strings below are PLACEHOLDERS — they will NOT work for login.
-- Use the Node.js command above to generate real hashes.

INSERT INTO public.users (id, name, email, password, role, department) VALUES

-- Student 1
('11111111-0000-0000-0000-000000000001',
 'Arjun Mehta',
 '2022cse047@krmu.edu.in',
 '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_Password@123',
 'student', 'Computer Science & Engineering'),

-- Student 2
('11111111-0000-0000-0000-000000000002',
 'Priya Tiwari',
 '2022cse010@krmu.edu.in',
 '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_Password@123',
 'student', 'Computer Science & Engineering'),

-- Faculty 1
('22222222-0000-0000-0000-000000000001',
 'Dr. Priya Sharma',
 'priya.sharma@krmu.edu.in',
 '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_Password@123',
 'faculty', 'Computer Science & Engineering'),

-- Faculty 2
('22222222-0000-0000-0000-000000000002',
 'Prof. Anil Gupta',
 'anil.gupta@krmu.edu.in',
 '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_Password@123',
 'faculty', 'Mathematics'),

-- Admin
('33333333-0000-0000-0000-000000000001',
 'Raj Kumar',
 'admin@krmu.edu.in',
 '$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_Admin@12345',
 'admin', 'Administration');

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.students (user_id, enrollment_no, semester, department) VALUES
('11111111-0000-0000-0000-000000000001', '2022CSE047', 5, 'Computer Science & Engineering'),
('11111111-0000-0000-0000-000000000002', '2022CSE010', 5, 'Computer Science & Engineering');

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.faculty (user_id, employee_id, department, designation) VALUES
('22222222-0000-0000-0000-000000000001', 'FAC2020011', 'Computer Science & Engineering', 'Associate Professor'),
('22222222-0000-0000-0000-000000000002', 'FAC2018005', 'Mathematics', 'Professor');

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES (using faculty IDs from the faculty table)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.courses (name, code, department, faculty_id, semester, credits)
SELECT 'Data Structures & Algorithms', 'CS501', 'CSE', id, 5, 4
FROM public.faculty WHERE employee_id = 'FAC2020011';

INSERT INTO public.courses (name, code, department, faculty_id, semester, credits)
SELECT 'Operating Systems', 'CS502', 'CSE', id, 5, 4
FROM public.faculty WHERE employee_id = 'FAC2020011';

INSERT INTO public.courses (name, code, department, faculty_id, semester, credits)
SELECT 'Discrete Mathematics', 'MATH303', 'CSE', id, 5, 3
FROM public.faculty WHERE employee_id = 'FAC2018005';

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENT COURSE ENROLLMENTS
-- ─────────────────────────────────────────────────────────────────────────────
-- Enroll both students in all 3 courses
INSERT INTO public.student_courses (student_id, course_id)
SELECT s.id, c.id
FROM public.students s, public.courses c
WHERE s.enrollment_no IN ('2022CSE047', '2022CSE010')
  AND c.code IN ('CS501', 'CS502', 'MATH303');

-- ─────────────────────────────────────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.announcements (title, content, posted_by, role_target)
SELECT
  'Annual Tech Fest – TechNova 2025',
  'Registration open for KRMU''s biggest annual tech festival. Participate in hackathon, coding contest, robotics and more. Prizes worth ₹5 Lakhs!',
  id, 'all'
FROM public.users WHERE email = 'admin@krmu.edu.in';

INSERT INTO public.announcements (title, content, posted_by, role_target)
SELECT
  'Internal Assessment III Schedule Released',
  'IA-III for all Semester 5 courses will be conducted from July 14–18. Detailed timetable available on the academic portal.',
  id, 'student'
FROM public.users WHERE email = 'admin@krmu.edu.in';

-- ─────────────────────────────────────────────────────────────────────────────
-- CHANNELS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.channels (name, description, created_by)
SELECT 'CS501 – Data Structures', 'Course channel for Data Structures & Algorithms (CS501)', id
FROM public.users WHERE email = 'priya.sharma@krmu.edu.in';

INSERT INTO public.channels (name, description, created_by)
SELECT 'MATH303 – Discrete Maths', 'Course channel for Discrete Mathematics (MATH303)', id
FROM public.users WHERE email = 'anil.gupta@krmu.edu.in';

-- ─────────────────────────────────────────────────────────────────────────────
-- LOST & FOUND
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.lost_found (title, description, category, posted_by, status)
SELECT 'Blue Water Bottle', 'Hydra steel bottle, blue colour, near Cafeteria Block B.', 'lost', id, 'active'
FROM public.users WHERE email = '2022cse047@krmu.edu.in';

INSERT INTO public.lost_found (title, description, category, posted_by, status)
SELECT 'Student ID Card – Priya T.', 'Found near Library gate. Name: Priya T., 2021MBA.', 'found', id, 'active'
FROM public.users WHERE email = '2022cse010@krmu.edu.in';

-- ─────────────────────────────────────────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.applications (student_id, type, description, status)
SELECT s.id, 'bonafide', 'Requesting bonafide certificate for bank account opening.', 'pending'
FROM public.students s WHERE s.enrollment_no = '2022CSE047';

INSERT INTO public.applications (student_id, type, description, status)
SELECT s.id, 'fee_waiver', 'Applying for merit-based fee waiver for current semester.', 'pending'
FROM public.students s WHERE s.enrollment_no = '2022CSE010';
