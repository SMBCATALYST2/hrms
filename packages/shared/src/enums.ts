// ─── Authentication & Authorization ─────────────────────────────
export enum Role {
  SUPER_ADMIN = "super_admin",
  HR_ADMIN = "hr_admin",
  HR_MANAGER = "hr_manager",
  DEPARTMENT_HEAD = "department_head",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

// ─── Employee ───────────────────────────────────────────────────
export enum EmployeeStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  RESIGNED = "resigned",
  RELIEVED = "relieved",
  TERMINATED = "terminated",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  NON_BINARY = "non_binary",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
}

export enum EmploymentType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERN = "intern",
  PROBATION = "probation",
  FREELANCE = "freelance",
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

// ─── Attendance ─────────────────────────────────────────────────
export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  HALF_DAY = "half_day",
  ON_LEAVE = "on_leave",
  HOLIDAY = "holiday",
  WEEKLY_OFF = "weekly_off",
  WORK_FROM_HOME = "work_from_home",
}

export enum CheckinType {
  CHECK_IN = "check_in",
  CHECK_OUT = "check_out",
}

// ─── Leave ──────────────────────────────────────────────────────
export enum LeaveStatus {
  AVAILABLE = "available",
  EXHAUSTED = "exhausted",
  NOT_APPLICABLE = "not_applicable",
}

export enum LeaveApplicationStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

// ─── Payroll ────────────────────────────────────────────────────
export enum PayrollFrequency {
  MONTHLY = "monthly",
  BI_WEEKLY = "bi_weekly",
  WEEKLY = "weekly",
}

export enum SalaryComponentType {
  EARNING = "earning",
  DEDUCTION = "deduction",
}

export enum SalarySlipStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  CANCELLED = "cancelled",
}

export enum PayrollEntryStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// ─── Recruitment ────────────────────────────────────────────────
export enum JobOpeningStatus {
  DRAFT = "draft",
  OPEN = "open",
  ON_HOLD = "on_hold",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

export enum ApplicationStage {
  APPLIED = "applied",
  SCREENING = "screening",
  SHORTLISTED = "shortlisted",
  INTERVIEW = "interview",
  ASSESSMENT = "assessment",
  OFFER = "offer",
  HIRED = "hired",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

export enum InterviewStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
  RESCHEDULED = "rescheduled",
}

export enum InterviewResult {
  STRONG_HIRE = "strong_hire",
  HIRE = "hire",
  NO_HIRE = "no_hire",
  STRONG_NO_HIRE = "strong_no_hire",
  UNDECIDED = "undecided",
}

export enum FeedbackRecommendation {
  STRONGLY_RECOMMEND = "strongly_recommend",
  RECOMMEND = "recommend",
  NEUTRAL = "neutral",
  DO_NOT_RECOMMEND = "do_not_recommend",
}

export enum OfferStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  SENT = "sent",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
  WITHDRAWN = "withdrawn",
}

export enum EmploymentSource {
  CAREERS_PAGE = "careers_page",
  LINKEDIN = "linkedin",
  NAUKRI = "naukri",
  INDEED = "indeed",
  REFERRAL = "referral",
  AGENCY = "agency",
  CAMPUS = "campus",
  SOCIAL_MEDIA = "social_media",
  OTHER = "other",
}

// ─── OKR ────────────────────────────────────────────────────────
export enum OKRStatus {
  NOT_STARTED = "not_started",
  ON_TRACK = "on_track",
  AT_RISK = "at_risk",
  BEHIND = "behind",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ObjectiveLevel {
  COMPANY = "company",
  DEPARTMENT = "department",
  TEAM = "team",
  INDIVIDUAL = "individual",
}

// ─── Performance ────────────────────────────────────────────────
export enum ReviewCycleType {
  ANNUAL = "annual",
  SEMI_ANNUAL = "semi_annual",
  QUARTERLY = "quarterly",
  PROBATION = "probation",
}

export enum ReviewCycleStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  SELF_REVIEW = "self_review",
  MANAGER_REVIEW = "manager_review",
  CALIBRATION = "calibration",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ReviewType {
  SELF = "self",
  MANAGER = "manager",
  PEER = "peer",
  SKIP_LEVEL = "skip_level",
  EXTERNAL = "external",
}

export enum ReviewStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  ACKNOWLEDGED = "acknowledged",
}

export enum FeedbackRelationship {
  SELF = "self",
  MANAGER = "manager",
  DIRECT_REPORT = "direct_report",
  PEER = "peer",
  SKIP_LEVEL = "skip_level",
  EXTERNAL = "external",
}

// ─── Task ───────────────────────────────────────────────────────
export enum TaskPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  IN_REVIEW = "in_review",
  BLOCKED = "blocked",
  DONE = "done",
  CANCELLED = "cancelled",
}

// ─── Assessment ─────────────────────────────────────────────────
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  MULTI_SELECT = "multi_select",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  LONG_ANSWER = "long_answer",
  CODING = "coding",
  FILE_UPLOAD = "file_upload",
}

export enum AssessmentType {
  SCREENING = "screening",
  TECHNICAL = "technical",
  APTITUDE = "aptitude",
  PERSONALITY = "personality",
  CUSTOM = "custom",
}

export enum SubmissionStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  TIMED_OUT = "timed_out",
  EVALUATED = "evaluated",
}

// ─── Notifications ──────────────────────────────────────────────
export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  ACTION_REQUIRED = "action_required",
  SUCCESS = "success",
  ERROR = "error",
}
