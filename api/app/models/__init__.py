"""Import all models so Alembic can discover them."""

from app.models.base import AuditMixin, Base, TimestampMixin
from app.models.user import Role, User, UserRole
from app.models.employee import Employee
from app.models.company import Company
from app.models.department import Department
from app.models.designation import Designation
from app.models.attendance import (
    AttendancePunch,
    AttendanceRecord,
    AttendanceRegularization,
    OvertimeEntry,
    OvertimePolicy,
    Shift,
    ShiftAssignment,
)
from app.models.leave import (
    CompensatoryOff,
    LeaveApplication,
    LeaveBalance,
    LeavePolicy,
    LeavePolicyDetail,
    LeaveType,
)
from app.models.holiday import Holiday, HolidayCalendar
from app.models.payroll import (
    AdditionalSalary,
    PayrollEntry,
    SalaryComponent,
    SalarySlip,
    SalarySlipItem,
    SalaryStructure,
    SalaryStructureAssignment,
    SalaryStructureDetail,
)
from app.models.tax import IncomeTaxSlab, TaxDeclaration, TaxDeclarationItem, TaxSlabRate
from app.models.recruitment import JobApplication, JobOpening
from app.models.interview import Interview, InterviewFeedback, InterviewRound
from app.models.offer import JDTemplate, JobOffer, OfferTemplate
from app.models.okr import KeyResult, Objective, OKRCheckIn, OKRCycle
from app.models.performance import (
    Competency,
    CompetencyFramework,
    Feedback360,
    PIP,
    PerformanceReview,
    ReviewCycle,
    ReviewRating,
)
from app.models.task import Task, TaskComment
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    AssessmentSubmission,
    Question,
    QuestionBank,
)
from app.models.notification import AuditLog, Notification

__all__ = [
    "Base",
    "TimestampMixin",
    "AuditMixin",
    "User",
    "Role",
    "UserRole",
    "Employee",
    "Company",
    "Department",
    "Designation",
    "Shift",
    "ShiftAssignment",
    "AttendanceRecord",
    "AttendancePunch",
    "AttendanceRegularization",
    "OvertimePolicy",
    "OvertimeEntry",
    "LeaveType",
    "LeavePolicy",
    "LeavePolicyDetail",
    "LeaveBalance",
    "LeaveApplication",
    "CompensatoryOff",
    "HolidayCalendar",
    "Holiday",
    "SalaryComponent",
    "SalaryStructure",
    "SalaryStructureDetail",
    "SalaryStructureAssignment",
    "PayrollEntry",
    "SalarySlip",
    "SalarySlipItem",
    "AdditionalSalary",
    "IncomeTaxSlab",
    "TaxSlabRate",
    "TaxDeclaration",
    "TaxDeclarationItem",
    "JobOpening",
    "JobApplication",
    "InterviewRound",
    "Interview",
    "InterviewFeedback",
    "OfferTemplate",
    "JDTemplate",
    "JobOffer",
    "OKRCycle",
    "Objective",
    "KeyResult",
    "OKRCheckIn",
    "CompetencyFramework",
    "Competency",
    "ReviewCycle",
    "PerformanceReview",
    "ReviewRating",
    "Feedback360",
    "PIP",
    "Task",
    "TaskComment",
    "QuestionBank",
    "Question",
    "Assessment",
    "AssessmentSubmission",
    "AssessmentAnswer",
    "Notification",
    "AuditLog",
]
