import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType =
  | "active"
  | "inactive"
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "present"
  | "absent"
  | "on_leave"
  | "half_day"
  | "holiday"
  | "week_off"
  | "on_duty"
  | "open"
  | "closed"
  | "on_hold"
  | "processing"
  | "processed"
  | "paid"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "on_track"
  | "at_risk"
  | "behind"
  | "completed"
  | "scheduled"
  | "no_show"
  | "sent"
  | "accepted"
  | "expired"
  | "revoked"
  | "withdrawn"
  | "hired"
  | "applied"
  | "screening"
  | "interview"
  | "assessment"
  | "offer"
  | string;

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  present: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  hired: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  on_track: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",

  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  screening: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  interview: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  assessment: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  offer: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",

  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  behind: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  no_show: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  revoked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",

  at_risk: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  on_hold: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",

  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",

  on_leave: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  half_day: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  holiday: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  week_off: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
  on_duty: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  processed: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn("border-0 font-medium", colorClass, className)}
    >
      {label}
    </Badge>
  );
}
