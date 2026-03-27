import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({
  icon = "document-text-outline",
  title,
  message,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-full bg-neutral-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="#9CA3AF" />
      </View>
      <Text className="text-base font-semibold text-neutral-700 text-center mb-1">
        {title}
      </Text>
      {message && (
        <Text className="text-sm text-neutral-400 text-center">{message}</Text>
      )}
    </View>
  );
}
