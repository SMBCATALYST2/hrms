import React from "react";
import { View, Text } from "react-native";
import { Card } from "./ui/Card";

interface LeaveBalanceCardProps {
  leaveType: string;
  used: number;
  total: number;
  pending?: number;
}

export function LeaveBalanceCard({
  leaveType,
  used,
  total,
  pending = 0,
}: LeaveBalanceCardProps) {
  const available = total - used - pending;
  const usedPercent = total > 0 ? (used / total) * 100 : 0;
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;

  return (
    <Card className="w-40 mr-3">
      <Text className="text-sm font-medium text-neutral-700 mb-2" numberOfLines={1}>
        {leaveType}
      </Text>

      <View className="flex-row items-baseline mb-2">
        <Text className="text-2xl font-bold text-neutral-900">{available}</Text>
        <Text className="text-sm text-neutral-400 ml-1">/ {total}</Text>
      </View>

      {/* Progress bar */}
      <View className="h-2 bg-neutral-100 rounded-full overflow-hidden flex-row">
        <View
          className="h-full bg-primary-500 rounded-full"
          style={{ width: `${usedPercent}%` }}
        />
        {pending > 0 && (
          <View
            className="h-full bg-warning-500 rounded-full"
            style={{ width: `${pendingPercent}%` }}
          />
        )}
      </View>

      <View className="flex-row justify-between mt-1.5">
        <Text className="text-xs text-neutral-400">
          {used} used
        </Text>
        {pending > 0 && (
          <Text className="text-xs text-warning-500">
            {pending} pending
          </Text>
        )}
      </View>
    </Card>
  );
}
