import React from "react";
import { View, Text, Image } from "react-native";

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-14 h-14", text: "text-lg" },
  xl: { container: "w-20 h-20", text: "text-2xl" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic color from name
function getColor(name: string): string {
  const colors = [
    "bg-primary-500",
    "bg-success-500",
    "bg-warning-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ uri, name, size = "md" }: AvatarProps) {
  const sizeStyle = sizeClasses[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${sizeStyle.container} rounded-full`}
      />
    );
  }

  return (
    <View
      className={`${sizeStyle.container} rounded-full ${getColor(
        name
      )} items-center justify-center`}
    >
      <Text className={`${sizeStyle.text} font-semibold text-white`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
