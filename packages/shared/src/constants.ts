// ─── API Routes ─────────────────────────────────────────────────
export const API_BASE_URL = "/api/v1";

export const API_ROUTES = {
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_REFRESH: `${API_BASE_URL}/auth/refresh`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_PASSWORD_RESET: `${API_BASE_URL}/auth/password-reset`,
  AUTH_MFA_SETUP: `${API_BASE_URL}/auth/mfa/setup`,
  AUTH_MFA_VERIFY: `${API_BASE_URL}/auth/mfa/verify`,

  // Users
  USERS: `${API_BASE_URL}/users`,

  // Companies
  COMPANIES: `${API_BASE_URL}/companies`,

  // Departments
  DEPARTMENTS: `${API_BASE_URL}/departments`,

  // Designations
  DESIGNATIONS: `${API_BASE_URL}/designations`,

  // Employees
  EMPLOYEES: `${API_BASE_URL}/employees`,

  // Attendance
  ATTENDANCE: `${API_BASE_URL}/attendance`,
  ATTENDANCE_CHECKIN: `${API_BASE_URL}/attendance/checkin`,
  ATTENDANCE_CHECKOUT: `${API_BASE_URL}/attendance/checkout`,
  SHIFTS: `${API_BASE_URL}/shifts`,

  // Leave
  LEAVE_TYPES: `${API_BASE_URL}/leave-types`,
  LEAVE_POLICIES: `${API_BASE_URL}/leave-policies`,
  LEAVE_ALLOCATIONS: `${API_BASE_URL}/leave-allocations`,
  LEAVE_APPLICATIONS: `${API_BASE_URL}/leave-applications`,

  // Payroll
  SALARY_COMPONENTS: `${API_BASE_URL}/salary-components`,
  SALARY_STRUCTURES: `${API_BASE_URL}/salary-structures`,
  SALARY_SLIPS: `${API_BASE_URL}/salary-slips`,
  PAYROLL_ENTRIES: `${API_BASE_URL}/payroll-entries`,
  TAX_DECLARATIONS: `${API_BASE_URL}/tax-declarations`,

  // Recruitment
  JOB_OPENINGS: `${API_BASE_URL}/job-openings`,
  JOB_APPLICATIONS: `${API_BASE_URL}/job-applications`,
  INTERVIEWS: `${API_BASE_URL}/interviews`,
  OFFER_LETTERS: `${API_BASE_URL}/offer-letters`,
  JD_TEMPLATES: `${API_BASE_URL}/jd/templates`,
  JD_GENERATE: `${API_BASE_URL}/jd/generate`,

  // OKR
  OKR_CYCLES: `${API_BASE_URL}/okr/cycles`,
  OKR_OBJECTIVES: `${API_BASE_URL}/okr/objectives`,
  OKR_KEY_RESULTS: `${API_BASE_URL}/okr/key-results`,

  // Performance
  REVIEW_CYCLES: `${API_BASE_URL}/pms/review-cycles`,
  PERFORMANCE_REVIEWS: `${API_BASE_URL}/pms/reviews`,

  // Tasks
  TASKS: `${API_BASE_URL}/tasks`,

  // Assessments
  ASSESSMENTS: `${API_BASE_URL}/assessments`,
  QUESTION_BANKS: `${API_BASE_URL}/question-banks`,

  // Notifications
  NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  PUSH_REGISTER: `${API_BASE_URL}/notifications/register`,

  // Files
  FILES: `${API_BASE_URL}/files`,

  // Dashboard & Reports
  DASHBOARD: `${API_BASE_URL}/dashboard`,
  REPORTS: `${API_BASE_URL}/reports`,

  // Search
  SEARCH: `${API_BASE_URL}/search`,

  // Settings
  SETTINGS: `${API_BASE_URL}/settings`,

  // Careers (public)
  CAREERS: `${API_BASE_URL}/careers`,
} as const;

// ─── App Constants ──────────────────────────────────────────────
export const APP_NAME = "HRMS";
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/csv",
] as const;

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_MINUTES: 15,
  REFRESH_TOKEN_DAYS: 7,
} as const;

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  HISTORY_COUNT: 5,
  EXPIRY_DAYS: 90,
} as const;

export const ACCOUNT_LOCKOUT = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 30,
} as const;
