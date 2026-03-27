import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  value: string | number;
  label: string;
  onPress?: () => void;
}

export function StatCard({
  icon,
  iconColor,
  iconBg,
  value,
  label,
  onPress,
}: StatCardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      className="flex-1 bg-white rounded-xl p-3 border border-neutral-100 shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        className={`w-9 h-9 rounded-lg items-center justify-center mb-2`}
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text className="text-xl font-bold text-neutral-900">{value}</Text>
      <Text className="text-xs text-neutral-500 mt-0.5" numberOfLines={1}>
        {label}
      </Text>
    </Container>
  );
}
