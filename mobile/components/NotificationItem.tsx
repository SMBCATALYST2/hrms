import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "action_required" | "success" | "error";
  isRead: boolean;
  createdAt: string;
  onPress?: (id: string) => void;
}

const typeConfig: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  info: { icon: "information-circle", color: "#3B82F6" },
  warning: { icon: "warning", color: "#F59E0B" },
  action_required: { icon: "alert-circle", color: "#EF4444" },
  success: { icon: "checkmark-circle", color: "#22C55E" },
  error: { icon: "close-circle", color: "#EF4444" },
};

export function NotificationItem({
  id,
  title,
  message,
  type,
  isRead,
  createdAt,
  onPress,
}: NotificationItemProps) {
  const config = typeConfig[type] || typeConfig.info;

  return (
    <TouchableOpacity
      className={`flex-row p-4 border-b border-neutral-100 ${
        !isRead ? "bg-primary-50" : "bg-white"
      }`}
      onPress={() => onPress?.(id)}
      activeOpacity={0.7}
    >
      {/* Unread dot */}
      {!isRead && (
        <View className="absolute top-5 left-2 w-2 h-2 rounded-full bg-primary-500" />
      )}

      <View className="mr-3 mt-0.5">
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>

      <View className="flex-1">
        <Text
          className={`text-sm ${
            !isRead ? "font-semibold" : "font-medium"
          } text-neutral-800 mb-0.5`}
        >
          {title}
        </Text>
        <Text className="text-sm text-neutral-500" numberOfLines={2}>
          {message}
        </Text>
        <Text className="text-xs text-neutral-400 mt-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
