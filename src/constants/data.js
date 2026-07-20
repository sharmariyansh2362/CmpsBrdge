import { C } from "./colors";

// ─── Demo Users ───────────────────────────────────────────────────────────────
export const DEMO_USERS = {
  student: {
    name: "Arjun Mehta", role: "student", rollNo: "2022CSE047", id: "2022CSE047",
    email: "2022cse047@krmu.edu.in", department: "Computer Science & Engineering",
    semester: "5th Semester", batch: "2022–2026", section: "B", avatar: "AM",
    phone: "+91 98765 43210", gpa: "8.74", credits: "82/144",
    address: "Gurugram, Haryana",
  },
  faculty: {
    name: "Dr. Priya Sharma", role: "faculty", id: "FAC2020011",
    email: "priya.sharma@krmu.edu.in", department: "Computer Science & Engineering",
    designation: "Associate Professor", avatar: "PS",
    phone: "+91 98100 12345", office: "Block A, Room 204",
    joiningDate: "Aug 2020", experience: "9 years",
  },
  admin: {
    name: "Raj Kumar", role: "admin", id: "ADM2018003",
    email: "admin@krmu.edu.in", department: "Administration",
    designation: "System Administrator", avatar: "RK",
    phone: "+91 98001 23456", access: "Super Admin",
  },
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const COURSES = [
  {
    code: "CS501", name: "Data Structures & Algorithms", credits: 4,
    faculty: "Dr. Priya Sharma", progress: 78, grade: "A",
    attendance: 91, color: C.primary, soft: C.primarySoft,
    description: "Advanced data structures including trees, graphs, hashing, and algorithmic paradigms.",
    modules: [
      { title: "Arrays & Linked Lists",       done: true,  lectures: 6, resources: 3 },
      { title: "Stacks, Queues & Deques",     done: true,  lectures: 5, resources: 2 },
      { title: "Trees & BSTs",                done: true,  lectures: 8, resources: 4 },
      { title: "Graphs & Shortest Path",      done: false, lectures: 7, resources: 3 },
      { title: "Hashing & Dynamic Programming", done: false, lectures: 6, resources: 2 },
    ],
    students: 62, sem: "Sem 5", pending: 8,
  },
  {
    code: "MATH303", name: "Discrete Mathematics", credits: 3,
    faculty: "Prof. Anil Gupta", progress: 65, grade: "B+",
    attendance: 85, color: C.orange, soft: C.orangeSoft,
    description: "Logic, set theory, combinatorics, graph theory, and mathematical reasoning.",
    modules: [
      { title: "Propositional Logic", done: true,  lectures: 5, resources: 2 },
      { title: "Sets & Relations",    done: true,  lectures: 5, resources: 3 },
      { title: "Combinatorics",       done: false, lectures: 6, resources: 2 },
      { title: "Graph Theory",        done: false, lectures: 7, resources: 3 },
    ],
    students: 70, sem: "Sem 5", pending: 5,
  },
  {
    code: "CS502", name: "Operating Systems", credits: 4,
    faculty: "Dr. Rahul Verma", progress: 54, grade: "B",
    attendance: 76, color: C.teal, soft: C.tealSoft,
    description: "Process management, memory management, file systems, and OS internals.",
    modules: [
      { title: "Process & Thread Management", done: true,  lectures: 7, resources: 3 },
      { title: "CPU Scheduling",              done: true,  lectures: 6, resources: 2 },
      { title: "Memory Management",           done: false, lectures: 8, resources: 4 },
      { title: "File Systems",                done: false, lectures: 5, resources: 2 },
    ],
    students: 58, sem: "Sem 5", pending: 12,
  },
  {
    code: "ENG201", name: "Technical Communication", credits: 2,
    faculty: "Ms. Ananya Singh", progress: 92, grade: "A+",
    attendance: 96, color: C.success, soft: C.successSoft,
    description: "Professional writing, technical reports, presentations, and communication skills.",
    modules: [
      { title: "Technical Writing Basics",  done: true,  lectures: 4, resources: 2 },
      { title: "Report Writing",            done: true,  lectures: 5, resources: 3 },
      { title: "Presentations & Seminars",  done: true,  lectures: 4, resources: 2 },
      { title: "Research Paper Writing",    done: false, lectures: 4, resources: 2 },
    ],
    students: 75, sem: "Sem 5", pending: 3,
  },
];

// ─── Announcements ────────────────────────────────────────────────────────────
export const ANNOUNCEMENTS = [
  {
    id: 1, type: "event", pinned: true,
    title: "Annual Tech Fest – TechNova 2025",
    body: "Registration open for KRMU's biggest annual tech festival. Participate in hackathon, coding contest, robotics and more. Prizes worth ₹5 Lakhs!",
    date: "Jun 28, 2025", author: "Student Affairs Cell", color: C.primary, bg: C.primarySoft,
  },
  {
    id: 2, type: "exam", pinned: true,
    title: "Internal Assessment – III Schedule Released",
    body: "IA-III for all Semester 5 courses will be conducted from July 14–18. Detailed timetable available on the academic portal.",
    date: "Jun 25, 2025", author: "Academic Office", color: C.danger, bg: C.dangerSoft,
  },
  {
    id: 3, type: "event", pinned: false,
    title: "Guest Lecture: AI in Healthcare",
    body: "Dr. Sangeeta Rao from AIIMS Delhi will deliver a special lecture on applications of AI in modern healthcare. Open to all students.",
    date: "Jun 27, 2025", author: "CSE Department", color: C.orange, bg: C.orangeSoft,
  },
  {
    id: 4, type: "notice", pinned: false,
    title: "Library Book Return Deadline",
    body: "All borrowed library books must be returned by June 30, 2025. Late returns will incur fines of ₹5 per day.",
    date: "Jun 24, 2025", author: "Central Library", color: C.warning, bg: C.warningSoft,
  },
  {
    id: 5, type: "event", pinned: false,
    title: "Sports Day – Inter-Department Cricket Tournament",
    body: "Register your department team by June 26. Matches will be held every Saturday. Contact Sports Secretary for details.",
    date: "Jun 23, 2025", author: "Sports Committee", color: C.success, bg: C.successSoft,
  },
  {
    id: 6, type: "notice", pinned: false,
    title: "Scholarship Application Deadline – Merit Scholarship",
    body: "Applications for KR Mangalam University Merit Scholarship 2025-26 are open. Apply before July 5 via the student portal.",
    date: "Jun 22, 2025", author: "Scholarship Cell", color: C.purple, bg: C.purpleSoft,
  },
  {
    id: 7, type: "event", pinned: false,
    title: "Placement Drive: Infosys & TCS – Pre-placement Talk",
    body: "Infosys and TCS will conduct a pre-placement orientation for final year students on July 2, 2025. Attendance mandatory.",
    date: "Jun 21, 2025", author: "Training & Placement Cell", color: C.teal, bg: C.tealSoft,
  },
];

// ─── Channels ─────────────────────────────────────────────────────────────────
export const CHANNEL_DATA = [
  {
    id: "CS501", label: "CS501 – Data Structures", color: C.primary, soft: C.primarySoft,
    faculty: "Dr. Priya Sharma", members: 62,
    messages: [
      { from: "Dr. Priya Sharma", role: "Faculty",  text: "Lab 4 solutions uploaded. Please review before Thursday's session.", time: "10:05 AM", color: C.orange },
      { from: "Rohan G.",         role: "Student",  text: "Ma'am, will there be a quiz next week on Trees?",                   time: "10:18 AM", color: C.primary },
      { from: "Dr. Priya Sharma", role: "Faculty",  text: "Yes, a short 15-min quiz on BSTs and AVL Trees. Prepare Chapter 7.", time: "10:20 AM", color: C.orange },
      { from: "Arjun M.",         role: "Student",  text: "Got it. Thank you ma'am!",                                          time: "10:28 AM", color: C.teal },
    ],
  },
  {
    id: "MATH303", label: "MATH303 – Discrete Maths", color: C.orange, soft: C.orangeSoft,
    faculty: "Prof. Anil Gupta", members: 70,
    messages: [
      { from: "Prof. Anil Gupta", role: "Faculty",  text: "Assignment 3 on Combinatorics is due this Friday. No extensions.", time: "9:00 AM", color: C.orange },
      { from: "Ayesha K.",        role: "Student",  text: "Sir, can we submit handwritten or only typed?",                    time: "9:15 AM", color: C.pink },
      { from: "Prof. Anil Gupta", role: "Faculty",  text: "Both formats accepted. Scan handwritten if submitting online.",    time: "9:17 AM", color: C.orange },
    ],
  },
  {
    id: "CS502", label: "CS502 – Operating Systems", color: C.teal, soft: C.tealSoft,
    faculty: "Dr. Rahul Verma", members: 58,
    messages: [
      { from: "Dr. Rahul Verma", role: "Faculty",  text: "Memory Management notes uploaded. Please go through before Friday.", time: "8:30 AM", color: C.orange },
      { from: "Karan S.",        role: "Student",  text: "Will the IA cover virtual memory as well?",                         time: "8:50 AM", color: C.success },
      { from: "Dr. Rahul Verma", role: "Faculty",  text: "Yes, virtual memory and paging will be included.",                  time: "8:52 AM", color: C.orange },
    ],
  },
];

// ─── Students ─────────────────────────────────────────────────────────────────
export const ALL_STUDENTS = [
  { id: "2022CSE047", name: "Arjun Mehta",  email: "2022cse047@krmu.edu.in", section: "B", gpa: "8.74", attendance: 91, status: "active"  },
  { id: "2022CSE031", name: "Rohan Gupta",  email: "2022cse031@krmu.edu.in", section: "B", gpa: "7.92", attendance: 85, status: "active"  },
  { id: "2022CSE028", name: "Nisha Verma",  email: "2022cse028@krmu.edu.in", section: "A", gpa: "9.12", attendance: 95, status: "active"  },
  { id: "2022CSE055", name: "Karan Singh",  email: "2022cse055@krmu.edu.in", section: "B", gpa: "6.80", attendance: 68, status: "warning" },
  { id: "2022CSE010", name: "Priya Tiwari", email: "2022cse010@krmu.edu.in", section: "A", gpa: "8.45", attendance: 88, status: "active"  },
  { id: "2022CSE019", name: "Ayesha Khan",  email: "2022cse019@krmu.edu.in", section: "B", gpa: "7.55", attendance: 79, status: "active"  },
  { id: "2022CSE003", name: "Dev Patel",    email: "2022cse003@krmu.edu.in", section: "A", gpa: "5.90", attendance: 61, status: "at-risk" },
  { id: "2022CSE040", name: "Sneha Rao",    email: "2022cse040@krmu.edu.in", section: "A", gpa: "9.30", attendance: 98, status: "active"  },
];

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const ADMIN_USERS = [
  { id: "USR001", name: "Arjun Mehta",       email: "2022cse047@krmu.edu.in",    role: "student", dept: "CSE",  status: "active",    joined: "Aug 2022" },
  { id: "USR002", name: "Dr. Priya Sharma",  email: "priya.sharma@krmu.edu.in",  role: "faculty", dept: "CSE",  status: "active",    joined: "Aug 2020" },
  { id: "USR003", name: "Karan Singh",       email: "2022cse055@krmu.edu.in",    role: "student", dept: "CSE",  status: "warning",   joined: "Aug 2022" },
  { id: "USR004", name: "Prof. Anil Gupta",  email: "anil.gupta@krmu.edu.in",    role: "faculty", dept: "MATH", status: "active",    joined: "Jun 2018" },
  { id: "USR005", name: "Dev Patel",         email: "2022cse003@krmu.edu.in",    role: "student", dept: "CSE",  status: "suspended", joined: "Aug 2022" },
  { id: "USR006", name: "Sneha Rao",         email: "2022cse040@krmu.edu.in",    role: "student", dept: "CSE",  status: "active",    joined: "Aug 2022" },
];

// ─── Applications ─────────────────────────────────────────────────────────────
export const APPLICATIONS = [
  { id: "APP001", name: "Riya Desai",      type: "student", email: "riya.d@gmail.com",    dept: "MBA",     date: "Jun 22, 2025", status: "pending",      docs: "Complete"   },
  { id: "APP002", name: "Vikram Nair",     type: "student", email: "vikram.n@gmail.com",  dept: "CSE",     date: "Jun 21, 2025", status: "pending",      docs: "Incomplete" },
  { id: "APP003", name: "Dr. Meena Reddy",type: "faculty", email: "meena.r@gmail.com",   dept: "Physics", date: "Jun 20, 2025", status: "under_review", docs: "Complete"   },
  { id: "APP004", name: "Harsh Tanwar",   type: "student", email: "harsh.t@gmail.com",   dept: "LAW",     date: "Jun 19, 2025", status: "approved",     docs: "Complete"   },
  { id: "APP005", name: "Aisha Siddiqui", type: "student", email: "aisha.s@gmail.com",   dept: "CSE",     date: "Jun 18, 2025", status: "rejected",     docs: "Incomplete" },
];

// ─── System Logs ──────────────────────────────────────────────────────────────
export const LOGS = [
  { id: 1, action: "Student registered",       detail: "2022CSE048 – Riya Desai enrolled successfully",          time: "10:32 AM", date: "Jun 23", color: C.success, type: "info"  },
  { id: 2, action: "Failed login attempt",     detail: "3 failed attempts – IP 192.168.1.45",                    time: "10:15 AM", date: "Jun 23", color: C.danger,  type: "alert" },
  { id: 3, action: "Faculty profile updated",  detail: "Dr. Priya Sharma updated office hours",                  time: "9:50 AM",  date: "Jun 23", color: C.primary, type: "info"  },
  { id: 4, action: "Lost & Found posted",      detail: "Item #LF007 added by Arjun Mehta",                       time: "9:30 AM",  date: "Jun 23", color: C.purple,  type: "info"  },
  { id: 5, action: "Course material uploaded", detail: "CS501 – Lab 4 notes uploaded by Dr. Priya Sharma",       time: "9:05 AM",  date: "Jun 23", color: C.teal,    type: "info"  },
  { id: 6, action: "Attendance alert",         detail: "CS502 – 8 students below 75%",                           time: "8:45 AM",  date: "Jun 23", color: C.warning, type: "alert" },
  { id: 7, action: "Application approved",     detail: "APP004 – Harsh Tanwar (LAW) approved",                   time: "Yesterday",date: "Jun 22", color: C.success, type: "info"  },
  { id: 8, action: "Application rejected",     detail: "APP005 – Aisha Siddiqui (CSE) – docs incomplete",        time: "Yesterday",date: "Jun 22", color: C.danger,  type: "alert" },
  { id: 9, action: "System maintenance",       detail: "Scheduled downtime completed at 3:15 AM",                 time: "3:15 AM",  date: "Jun 22", color: C.sub,     type: "info"  },
];

// ─── Lost & Found ─────────────────────────────────────────────────────────────
export const LOST_FOUND_ITEMS = [
  { id: 1, type: "lost",  title: "Blue Water Bottle",         desc: "Hydra steel bottle, blue colour, near Cafeteria Block B.",               postedBy: "Rohan Gupta",  rollNo: "2022CSE031", date: "Jun 22", color: C.warning, found: false },
  { id: 2, type: "found", title: "Student ID Card – Priya T.", desc: "Found near Library gate. Name: Priya T., 2021MBA.",                      postedBy: "James P.",     rollNo: "2021MBA019", date: "Jun 22", color: C.success, found: false },
  { id: 3, type: "lost",  title: "Calculus Textbook (Thomas)", desc: "Left in Seminar Hall 3, LT Block. Has handwritten notes inside.",        postedBy: "Ayesha Khan",  rollNo: "2022CSE047", date: "Jun 21", color: C.warning, found: false },
  { id: 4, type: "found", title: "Wireless Earbuds – Black",  desc: "Found in the parking area near Block A.",                                 postedBy: "Arjun M.",     rollNo: "2022CSE010", date: "Jun 20", color: C.success, found: false },
  { id: 5, type: "lost",  title: "Grey KRMU Hoodie",          desc: "Left in Lab 204, CSE Department after OS lab session.",                   postedBy: "Karan Singh",  rollNo: "2022CSE055", date: "Jun 20", color: C.warning, found: true  },
  { id: 6, type: "found", title: "Scientific Calculator – Casio", desc: "Found in Room 301 after Discrete Maths class.",                       postedBy: "Nisha V.",     rollNo: "2022CSE028", date: "Jun 19", color: C.success, found: false },
]; 

// ─── Navigation config ────────────────────────────────────────────────────────
export const NAV_ITEMS = {
  student: [
    { id: "dashboard",     label: "Dashboard",             icon: "Dashboard",  badge: null },
    { id: "announcements", label: "Announcements & Events",icon: "Bell",       badge: 2    },
    { id: "courses",       label: "My Courses",            icon: "BookOpen",   badge: null },
    { id: "academic",      label: "Academic Performance",  icon: "BarChart",   badge: null },
    { id: "attendance",    label: "Attendance",             icon: "CheckCircle",badge: null },
    { id: "timetable",     label: "Timetable",             icon: "Calendar",   badge: null },
    { id: "channels",      label: "Classroom Channels",    icon: "Hash",       badge: 1    },
    { id: "placements",    label: "Placement Cell",        icon: "Briefcase",  badge: null },
    { id: "lost-found",    label: "Lost & Found",          icon: "Package",    badge: null },
    { id: "applications",  label: "Applications",          icon: "FileText",   badge: null },
    { id: "profile",       label: "My Profile",            icon: "User",       badge: null },
    { id: "settings",      label: "Settings",              icon: "Settings",   badge: null },
  ],
  faculty: [
    { id: "dashboard",     label: "Dashboard",             icon: "Dashboard",  badge: null },
    { id: "announcements", label: "Announcements",         icon: "Bell",       badge: null },
    { id: "courses",       label: "My Courses",            icon: "BookMark",   badge: 8    },
    { id: "students",      label: "All Students",          icon: "Users",      badge: null },
    { id: "attendance",    label: "Attendance",             icon: "CheckCircle",badge: null },
    { id: "academic", label: "Academic Performance", icon: "BarChart", badge: null },
    { id: "timetable",     label: "Timetable",             icon: "Calendar",   badge: null },
    { id: "channels",      label: "Class Channels",        icon: "Hash",       badge: null },
    { id: "placements",    label: "Placement Cell",        icon: "Briefcase",  badge: null },
    { id: "lost-found",    label: "Lost & Found",          icon: "Package",    badge: null },
    { id: "profile",       label: "My Profile",            icon: "User",       badge: null },
    { id: "settings",      label: "Settings",              icon: "Settings",   badge: null },
  ],
  admin: [
    { id: "timetable", label: "Timetable", icon: "Calendar", badge: null },
    { id: "dashboard",     label: "Dashboard",             icon: "Dashboard",  badge: null },
    { id: "users",         label: "Manage Users",          icon: "Users",      badge: null },
    { id: "applications",  label: "Applications",          icon: "FileText",   badge: 3    },
    { id: "announcements", label: "Announcements",         icon: "Bell",       badge: null },
    { id: "academic",      label: "Academic Performance",  icon: "BarChart",   badge: null },
    { id: "placements",    label: "Placement Cell",        icon: "Briefcase",  badge: null },
    { id: "channels",      label: "Channels",              icon: "Hash",       badge: null },
    { id: "lost-found",    label: "Lost & Found (Mod.)",   icon: "Package",    badge: null },
    { id: "logs",          label: "System Logs",           icon: "Activity",   badge: null },
    { id: "settings",      label: "Settings",              icon: "Settings",   badge: null },
  ],
};

// ─── Placement Demo Data ──────────────────────────────────────────────────────
export const PLACEMENT_DRIVES = [
  {
    id: "PD001", company: "Google", logo: "G", role: "SDE Intern",
    package: "₹45 LPA", type: "Internship", deadline: "Jul 15, 2025",
    status: "upcoming", eligible: ["CSE", "IT", "ECE"], minCGPA: 8.0,
    description: "Google Summer Internship 2025. 6-month internship in Bangalore office.",
    color: "#4285F4",
  },
  {
    id: "PD002", company: "Microsoft", logo: "M", role: "Software Engineer",
    package: "₹38 LPA", type: "Full-time", deadline: "Jul 20, 2025",
    status: "upcoming", eligible: ["CSE", "IT"], minCGPA: 7.5,
    description: "Full-time SDE role at Microsoft India Development Center, Hyderabad.",
    color: "#00A4EF",
  },
  {
    id: "PD003", company: "Infosys", logo: "I", role: "Systems Engineer",
    package: "₹6.5 LPA", type: "Full-time", deadline: "Jul 10, 2025",
    status: "ongoing", eligible: ["CSE", "IT", "ECE", "ME"], minCGPA: 6.0,
    description: "Infosys campus hiring for B.Tech graduates across all branches.",
    color: "#007CC3",
  },
  {
    id: "PD004", company: "TCS", logo: "T", role: "Digital Engineer",
    package: "₹7.5 LPA", type: "Full-time", deadline: "Jul 5, 2025",
    status: "completed", eligible: ["CSE", "IT", "ECE"], minCGPA: 6.5,
    description: "TCS Digital hiring. Aptitude test followed by technical + HR interview.",
    color: "#1A73E8",
  },
  {
    id: "PD005", company: "Amazon", logo: "A", role: "SDE-1",
    package: "₹32 LPA", type: "Full-time", deadline: "Jul 25, 2025",
    status: "upcoming", eligible: ["CSE", "IT"], minCGPA: 7.0,
    description: "Amazon SDE-1 hiring. Online assessment + 3 technical rounds.",
    color: "#FF9900",
  },
];

// ─── Academic Performance Demo Data ───────────────────────────────────────────
export const ACADEMIC_SEMESTERS = [
  { semester: 1, sgpa: 8.2, totalCredits: 24 },
  { semester: 2, sgpa: 8.5, totalCredits: 24 },
  { semester: 3, sgpa: 7.9, totalCredits: 22 },
  { semester: 4, sgpa: 8.8, totalCredits: 22 },
  { semester: 5, sgpa: 8.7, totalCredits: 0 },
];

export const ACADEMIC_GRADES = [
  { course: "CS501", name: "Data Structures & Algorithms", credits: 4, grade: "A", gradePoint: 9, internal: 38, external: 72, total: 110, semester: 5 },
  { course: "MATH303", name: "Discrete Mathematics", credits: 3, grade: "B+", gradePoint: 8, internal: 34, external: 60, total: 94, semester: 5 },
  { course: "CS502", name: "Operating Systems", credits: 4, grade: "B", gradePoint: 7, internal: 30, external: 52, total: 82, semester: 5 },
  { course: "ENG201", name: "Technical Communication", credits: 2, grade: "A+", gradePoint: 10, internal: 42, external: 88, total: 130, semester: 5 },
  { course: "CS401", name: "Database Management", credits: 4, grade: "A", gradePoint: 9, internal: 36, external: 70, total: 106, semester: 4 },
  { course: "CS402", name: "Computer Networks", credits: 4, grade: "A+", gradePoint: 10, internal: 40, external: 82, total: 122, semester: 4 },
  { course: "MATH301", name: "Linear Algebra", credits: 3, grade: "A", gradePoint: 9, internal: 37, external: 68, total: 105, semester: 4 },
];

// ─── Social Links Platforms ───────────────────────────────────────────────────
export const SOCIAL_PLATFORMS = [
  { key: "github",   label: "GitHub",     color: "#333",     icon: "GitHub" },
  { key: "linkedin", label: "LinkedIn",   color: "#0A66C2",  icon: "Linkedin" },
  { key: "twitter",  label: "Twitter/X",  color: "#1DA1F2",  icon: "Twitter" },
  { key: "leetcode", label: "LeetCode",   color: "#FFA116",  icon: "Code" },
  { key: "portfolio",label: "Portfolio",   color: "#6C63FF",  icon: "Globe" },
  { key: "kaggle",   label: "Kaggle",     color: "#20BEFF",  icon: "Database" },
];

export const DEMO_SOCIAL_LINKS = [
  { platform: "github",   url: "https://github.com/arjunmehta",   username: "arjunmehta" },
  { platform: "linkedin", url: "https://linkedin.com/in/arjunmehta", username: "arjunmehta" },
  { platform: "leetcode", url: "https://leetcode.com/arjunmehta",  username: "arjunmehta" },
  { platform: "portfolio", url: "https://arjunmehta.dev",          username: "arjunmehta.dev" },
];

