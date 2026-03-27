import React from "react";
import { useMyAttendance, useAttendanceSummary, useCheckIn, useCheckOut } from "@/hooks/use-attendance";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from "date-fns";
import type { AttendanceRecord } from "@/types";

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());

  const { data: attendance, isLoading } = useMyAttendance({ month, year });
  const { data: summary } = useAttendanceSummary({ month, year });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const todayRecord = attendance?.find((r) => isSameDay(new Date(r.date), now));
  const isCheckedIn = todayRecord?.check_in && !todayRecord?.check_out;
  const hasCheckedOut = !!todayRecord?.check_out;

  const handleCheckIn = () => {
    checkIn.mutate({ source: "web" });
  };

  const handleCheckOut = () => {
    checkOut.mutate({ source: "web" });
  };

  // Calendar heat map
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (record?: AttendanceRecord) => {
    if (!record) return "bg-muted";
    switch (record.status) {
      case "present": return "bg-green-500";
      case "absent": return "bg-red-500";
      case "half_day": return "bg-amber-500";
      case "on_leave": return "bg-blue-500";
      case "holiday": return "bg-purple-500";
      case "week_off": return "bg-gray-400";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance"
        description="Track your daily attendance"
      />

      {/* Check In/Out */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left flex-1">
              <p className="text-3xl font-bold">{format(now, "hh:mm a")}</p>
              <p className="text-sm text-muted-foreground">{format(now, "EEEE, MMMM d, yyyy")}</p>
              {todayRecord?.check_in && (
                <p className="text-sm mt-2">
                  Checked in at <span className="font-medium">{todayRecord.check_in}</span>
                  {todayRecord.check_out && (
                    <> | Checked out at <span className="font-medium">{todayRecord.check_out}</span></>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCheckIn}
                disabled={isCheckedIn || hasCheckedOut || checkIn.isPending}
                className="min-w-32"
              >
                <LogIn className="mr-2 h-4 w-4" />
                {checkIn.isPending ? "Checking in..." : "Check In"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckOut}
                disabled={!isCheckedIn || checkOut.isPending}
                className="min-w-32"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {checkOut.isPending ? "Checking out..." : "Check Out"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Days Present" value={summary?.days_present ?? 0} icon={CheckCircle2} />
        <StatCard title="Days Absent" value={summary?.days_absent ?? 0} icon={XCircle} />
        <StatCard title="Late Days" value={summary?.days_late ?? 0} icon={AlertTriangle} />
        <StatCard title="Overtime Hours" value={`${summary?.total_overtime_hours ?? 0}h`} icon={Timer} />
      </div>

      {/* Calendar Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(monthStart, "MMMM yyyy")} Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding */}
            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10" />
            ))}
            {daysInMonth.map((day) => {
              const record = attendance?.find((r) => isSameDay(new Date(r.date), day));
              const isFuture = day > now;
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "h-10 rounded-md flex items-center justify-center text-xs",
                    isFuture ? "bg-muted/50" : getStatusColor(record),
                    !isFuture && record?.status === "present" && "text-white",
                    !isFuture && record?.status === "absent" && "text-white",
                    !isFuture && !record && "bg-muted"
                  )}
                  title={record ? `${record.status} - ${record.total_hours || 0}h` : "No record"}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { color: "bg-green-500", label: "Present" },
              { color: "bg-red-500", label: "Absent" },
              { color: "bg-amber-500", label: "Half Day" },
              { color: "bg-blue-500", label: "On Leave" },
              { color: "bg-purple-500", label: "Holiday" },
              { color: "bg-gray-400", label: "Week Off" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={cn("h-3 w-3 rounded-sm", color)} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
