import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { API_ROUTES, QUERY_KEYS } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Users,
  Clock,
  CalendarDays,
  Briefcase,
  Plus,
  UserPlus,
  ClipboardList,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  total_employees: number;
  present_today: number;
  pending_leaves: number;
  open_positions: number;
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const attendanceTrendData = [
  { day: "Mon", present: 45, absent: 3 },
  { day: "Tue", present: 47, absent: 1 },
  { day: "Wed", present: 44, absent: 4 },
  { day: "Thu", present: 46, absent: 2 },
  { day: "Fri", present: 43, absent: 5 },
];

const leaveDistributionData = [
  { name: "Casual Leave", value: 35 },
  { name: "Sick Leave", value: 20 },
  { name: "Earned Leave", value: 15 },
  { name: "Maternity", value: 5 },
  { name: "Others", value: 10 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS,
    queryFn: async () => {
      const res = await api.get<DashboardStats>(API_ROUTES.DASHBOARD.STATS);
      return res.data;
    },
  });

  const { data: recentHires } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.RECENT_HIRES,
    queryFn: async () => {
      const res = await api.get<
        Array<{ id: string; full_name: string; designation_name: string; photo_url?: string; date_of_joining: string }>
      >(API_ROUTES.DASHBOARD.RECENT_HIRES);
      return res.data;
    },
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.PENDING_APPROVALS,
    queryFn: async () => {
      const res = await api.get<
        Array<{ id: string; type: string; employee_name: string; status: string; created_at: string }>
      >(API_ROUTES.DASHBOARD.PENDING_APPROVALS);
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "User"}`}
        description="Here's what's happening with your organization today."
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Employees"
              value={stats?.total_employees ?? 0}
              icon={Users}
              trend={{ value: 4.5, isPositive: true }}
              description="vs last month"
            />
            <StatCard
              title="Present Today"
              value={stats?.present_today ?? 0}
              icon={Clock}
              trend={{ value: 2.1, isPositive: true }}
              description="attendance rate"
            />
            <StatCard
              title="Pending Leaves"
              value={stats?.pending_leaves ?? 0}
              icon={CalendarDays}
              description="awaiting approval"
            />
            <StatCard
              title="Open Positions"
              value={stats?.open_positions ?? 0}
              icon={Briefcase}
              description="active job openings"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/employees/new")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/leaves/apply")}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/recruitment/jobs")}>
              <Briefcase className="mr-2 h-4 w-4" />
              Post Job
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/tasks")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Create Task
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/payroll/run")}>
              <FileText className="mr-2 h-4 w-4" />
              Run Payroll
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leave Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveDistributionData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Hires */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Hires</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/employees")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentHires && recentHires.length > 0 ? (
                recentHires.slice(0, 5).map((hire) => (
                  <div key={hire.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={hire.photo_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(hire.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{hire.full_name}</p>
                      <p className="text-xs text-muted-foreground">{hire.designation_name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(hire.date_of_joining)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent hires</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Approvals</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/leaves/all")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals && pendingApprovals.length > 0 ? (
                pendingApprovals.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.employee_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending approvals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
