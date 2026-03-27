import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  employees: "Employees",
  new: "New Employee",
  "org-chart": "Org Chart",
  attendance: "Attendance",
  all: "All",
  shifts: "Shifts",
  leaves: "Leaves",
  apply: "Apply Leave",
  policies: "Policies",
  payroll: "Payroll",
  structures: "Salary Structures",
  run: "Run Payroll",
  payslips: "Payslips",
  tax: "Tax Declaration",
  recruitment: "Recruitment",
  jobs: "Job Openings",
  applications: "Applications",
  candidates: "Candidates",
  interviews: "Interviews",
  offers: "Offer Letters",
  "jd-creator": "JD Creator",
  performance: "Performance",
  okrs: "OKRs",
  reviews: "Reviews",
  "my-review": "My Review",
  dashboard: "Dashboard",
  tasks: "Tasks",
  list: "List",
  settings: "Settings",
  company: "Company",
  profile: "Profile",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className={cn("font-medium text-foreground")}>{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
