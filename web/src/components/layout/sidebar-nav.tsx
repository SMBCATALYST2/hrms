import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  Briefcase,
  Target,
  CheckSquare,
  Settings,
  ChevronLeft,
  Building2,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "People",
    items: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Org Chart", href: "/employees/org-chart", icon: Network },
    ],
  },
  {
    title: "Time & Leave",
    items: [
      { title: "My Attendance", href: "/attendance", icon: Clock },
      { title: "Attendance List", href: "/attendance/all", icon: Clock },
      { title: "Shifts", href: "/attendance/shifts", icon: Clock },
      { title: "My Leaves", href: "/leaves", icon: CalendarDays },
      { title: "Leave Applications", href: "/leaves/all", icon: CalendarDays },
      { title: "Leave Policies", href: "/leaves/policies", icon: CalendarDays },
    ],
  },
  {
    title: "Payroll",
    items: [
      { title: "Payroll", href: "/payroll", icon: Wallet },
      { title: "Salary Structures", href: "/payroll/structures", icon: Wallet },
      { title: "Run Payroll", href: "/payroll/run", icon: Wallet },
      { title: "Payslips", href: "/payroll/payslips", icon: Wallet },
      { title: "Tax Declaration", href: "/payroll/tax", icon: Wallet },
    ],
  },
  {
    title: "Recruitment",
    items: [
      { title: "Job Openings", href: "/recruitment/jobs", icon: Briefcase },
      { title: "Applications", href: "/recruitment/applications", icon: Briefcase },
      { title: "Interviews", href: "/recruitment/interviews", icon: Briefcase },
      { title: "Offer Letters", href: "/recruitment/offers", icon: Briefcase },
      { title: "JD Creator", href: "/recruitment/jd-creator", icon: Briefcase },
    ],
  },
  {
    title: "Performance",
    items: [
      { title: "OKRs", href: "/performance/okrs", icon: Target },
      { title: "Review Cycles", href: "/performance/reviews", icon: Target },
      { title: "My Review", href: "/performance/my-review", icon: Target },
      { title: "PMS Dashboard", href: "/performance/dashboard", icon: Target },
    ],
  },
  {
    title: "Tasks",
    items: [
      { title: "Task Board", href: "/tasks", icon: CheckSquare },
      { title: "Task List", href: "/tasks/list", icon: CheckSquare },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Company", href: "/settings/company", icon: Building2 },
      { title: "Profile", href: "/settings/profile", icon: Settings },
    ],
  },
];

export function SidebarNav({ collapsed, onToggle }: SidebarNavProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex h-full flex-col border-r bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <span className="text-sm font-bold text-sidebar-primary-foreground">HR</span>
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">HRMS</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sm font-bold text-sidebar-primary-foreground">H</span>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={onToggle}
        >
          <ChevronLeft
            className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")}
          />
        </Button>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {navSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                    {section.title}
                  </p>
                )}
                {collapsed && <Separator className="my-2" />}
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.href);

                  const linkContent = (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
