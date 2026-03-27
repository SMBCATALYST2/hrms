import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

// Auth pages (public)
const LoginPage = lazy(() => import("@/features/auth/login-page"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password-page"));

// Dashboard
const DashboardPage = lazy(() => import("@/features/dashboard/dashboard-page"));

// Employees
const EmployeeListPage = lazy(() => import("@/features/employees/employee-list-page"));
const EmployeeDetailPage = lazy(() => import("@/features/employees/employee-detail-page"));
const EmployeeCreatePage = lazy(() => import("@/features/employees/employee-create-page"));
const OrgChartPage = lazy(() => import("@/features/employees/org-chart-page"));

// Attendance
const AttendancePage = lazy(() => import("@/features/attendance/attendance-page"));
const AttendanceListPage = lazy(() => import("@/features/attendance/attendance-list-page"));
const ShiftManagementPage = lazy(() => import("@/features/attendance/shift-management-page"));

// Leaves
const LeaveDashboardPage = lazy(() => import("@/features/leaves/leave-dashboard-page"));
const LeaveListPage = lazy(() => import("@/features/leaves/leave-list-page"));
const LeaveApplyPage = lazy(() => import("@/features/leaves/leave-apply-page"));
const LeavePolicyPage = lazy(() => import("@/features/leaves/leave-policy-page"));

// Payroll
const PayrollDashboardPage = lazy(() => import("@/features/payroll/payroll-dashboard-page"));
const SalaryStructurePage = lazy(() => import("@/features/payroll/salary-structure-page"));
const PayrollRunPage = lazy(() => import("@/features/payroll/payroll-run-page"));
const PayslipPage = lazy(() => import("@/features/payroll/payslip-page"));
const TaxDeclarationPage = lazy(() => import("@/features/payroll/tax-declaration-page"));

// Recruitment
const JobOpeningsPage = lazy(() => import("@/features/recruitment/job-openings-page"));
const JobOpeningDetailPage = lazy(() => import("@/features/recruitment/job-opening-detail-page"));
const ApplicationsPage = lazy(() => import("@/features/recruitment/applications-page"));
const CandidateDetailPage = lazy(() => import("@/features/recruitment/candidate-detail-page"));
const InterviewSchedulePage = lazy(() => import("@/features/recruitment/interview-schedule-page"));
const OfferLetterPage = lazy(() => import("@/features/recruitment/offer-letter-page"));
const JDCreatorPage = lazy(() => import("@/features/recruitment/jd-creator-page"));

// Performance
const OKRPage = lazy(() => import("@/features/performance/okr-page"));
const OKRDetailPage = lazy(() => import("@/features/performance/okr-detail-page"));
const ReviewCyclesPage = lazy(() => import("@/features/performance/review-cycles-page"));
const MyReviewPage = lazy(() => import("@/features/performance/my-review-page"));
const PMSDashboardPage = lazy(() => import("@/features/performance/pms-dashboard-page"));

// Tasks
const TaskBoardPage = lazy(() => import("@/features/tasks/task-board-page"));
const TaskListPage = lazy(() => import("@/features/tasks/task-list-page"));

// Settings
const CompanySettingsPage = lazy(() => import("@/features/settings/company-settings-page"));
const ProfilePage = lazy(() => import("@/features/settings/profile-page"));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <SuspenseWrapper>
        <ForgotPasswordPage />
      </SuspenseWrapper>
    ),
  },
  // Protected routes
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      // Employees
      {
        path: "employees",
        element: (
          <SuspenseWrapper>
            <EmployeeListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "employees/new",
        element: (
          <SuspenseWrapper>
            <EmployeeCreatePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "employees/org-chart",
        element: (
          <SuspenseWrapper>
            <OrgChartPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "employees/:id",
        element: (
          <SuspenseWrapper>
            <EmployeeDetailPage />
          </SuspenseWrapper>
        ),
      },
      // Attendance
      {
        path: "attendance",
        element: (
          <SuspenseWrapper>
            <AttendancePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "attendance/all",
        element: (
          <SuspenseWrapper>
            <AttendanceListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "attendance/shifts",
        element: (
          <SuspenseWrapper>
            <ShiftManagementPage />
          </SuspenseWrapper>
        ),
      },
      // Leaves
      {
        path: "leaves",
        element: (
          <SuspenseWrapper>
            <LeaveDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "leaves/all",
        element: (
          <SuspenseWrapper>
            <LeaveListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "leaves/apply",
        element: (
          <SuspenseWrapper>
            <LeaveApplyPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "leaves/policies",
        element: (
          <SuspenseWrapper>
            <LeavePolicyPage />
          </SuspenseWrapper>
        ),
      },
      // Payroll
      {
        path: "payroll",
        element: (
          <SuspenseWrapper>
            <PayrollDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payroll/structures",
        element: (
          <SuspenseWrapper>
            <SalaryStructurePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payroll/run",
        element: (
          <SuspenseWrapper>
            <PayrollRunPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payroll/payslips",
        element: (
          <SuspenseWrapper>
            <PayslipPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "payroll/tax",
        element: (
          <SuspenseWrapper>
            <TaxDeclarationPage />
          </SuspenseWrapper>
        ),
      },
      // Recruitment
      {
        path: "recruitment/jobs",
        element: (
          <SuspenseWrapper>
            <JobOpeningsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/jobs/:id",
        element: (
          <SuspenseWrapper>
            <JobOpeningDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/applications",
        element: (
          <SuspenseWrapper>
            <ApplicationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/candidates/:id",
        element: (
          <SuspenseWrapper>
            <CandidateDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/interviews",
        element: (
          <SuspenseWrapper>
            <InterviewSchedulePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/offers",
        element: (
          <SuspenseWrapper>
            <OfferLetterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "recruitment/jd-creator",
        element: (
          <SuspenseWrapper>
            <JDCreatorPage />
          </SuspenseWrapper>
        ),
      },
      // Performance
      {
        path: "performance/okrs",
        element: (
          <SuspenseWrapper>
            <OKRPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "performance/okrs/:id",
        element: (
          <SuspenseWrapper>
            <OKRDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "performance/reviews",
        element: (
          <SuspenseWrapper>
            <ReviewCyclesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "performance/my-review",
        element: (
          <SuspenseWrapper>
            <MyReviewPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "performance/dashboard",
        element: (
          <SuspenseWrapper>
            <PMSDashboardPage />
          </SuspenseWrapper>
        ),
      },
      // Tasks
      {
        path: "tasks",
        element: (
          <SuspenseWrapper>
            <TaskBoardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "tasks/list",
        element: (
          <SuspenseWrapper>
            <TaskListPage />
          </SuspenseWrapper>
        ),
      },
      // Settings
      {
        path: "settings/company",
        element: (
          <SuspenseWrapper>
            <CompanySettingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "settings/profile",
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      // Catch all
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
