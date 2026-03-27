import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card } from "./ui/Card";
import { Avatar } from "./ui/Avatar";
import { Badge, getStatusBadgeVariant } from "./ui/Badge";
import { format } from "date-fns";

interface ApprovalItemProps {
  id: string;
  requesterName: string;
  requesterAvatar?: string;
  type: string; // "Leave" | "Attendance Regularization"
  subtitle: string; // e.g., "Casual Leave - 2 days"
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approving?: boolean;
  rejecting?: boolean;
}

export function ApprovalItem({
  id,
  requesterName,
  requesterAvatar,
  type,
  subtitle,
  fromDate,
  toDate,
  reason,
  status,
  onApprove,
  onReject,
  approving,
  rejecting,
}: ApprovalItemProps) {
  const isPending = status === "pending";

  return (
    <Card className="mb-3">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <Avatar name={requesterName} uri={requesterAvatar} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-neutral-800">
            {requesterName}
          </Text>
          <Text className="text-sm text-neutral-500">{type}</Text>
        </View>
        <Badge
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          variant={getStatusBadgeVariant(status)}
        />
      </View>

      {/* Details */}
      <View className="bg-neutral-50 rounded-lg p-3 mb-3">
        <Text className="text-sm font-medium text-neutral-700 mb-1">
          {subtitle}
        </Text>
        <Text className="text-xs text-neutral-500 mb-1">
          {format(new Date(fromDate), "dd MMM yyyy")} -{" "}
          {format(new Date(toDate), "dd MMM yyyy")}
        </Text>
        <Text className="text-xs text-neutral-500" numberOfLines={2}>
          {reason}
        </Text>
      </View>

      {/* Actions */}
      {isPending && (
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg border border-danger-500 bg-white"
            onPress={() => onReject(id)}
            disabled={rejecting || approving}
            activeOpacity={0.7}
          >
            {rejecting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text className="text-danger-500 font-semibold text-sm">
                Reject
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-lg bg-success-500"
            onPress={() => onApprove(id)}
            disabled={approving || rejecting}
            activeOpacity={0.7}
          >
            {approving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">
                Approve
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}
