import React from "react";
import { View, Text } from "react-native";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: "bg-neutral-100", text: "text-neutral-700" },
  primary: { bg: "bg-primary-100", text: "text-primary-700" },
  success: { bg: "bg-success-100", text: "text-success-600" },
  warning: { bg: "bg-warning-100", text: "text-warning-600" },
  danger: { bg: "bg-danger-100", text: "text-danger-600" },
  info: { bg: "bg-blue-100", text: "text-blue-700" },
};

export function Badge({ label, variant = "default", size = "sm" }: BadgeProps) {
  const style = variantClasses[variant];

  return (
    <View
      className={`self-start rounded-full ${style.bg} ${
        size === "sm" ? "px-2.5 py-0.5" : "px-3 py-1"
      }`}
    >
      <Text
        className={`font-medium ${style.text} ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

// Helper to map leave/attendance statuses to badge variants
export function getStatusBadgeVariant(
  status: string
): BadgeVariant {
  switch (status) {
    case "approved":
    case "present":
    case "active":
    case "completed":
      return "success";
    case "pending":
    case "half_day":
    case "in_progress":
      return "warning";
    case "rejected":
    case "absent":
    case "cancelled":
    case "terminated":
      return "danger";
    case "draft":
      return "default";
    case "on_leave":
    case "work_from_home":
      return "info";
    default:
      return "default";
  }
}
