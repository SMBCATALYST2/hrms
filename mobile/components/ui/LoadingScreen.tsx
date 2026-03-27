import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
      {message && (
        <Text className="text-neutral-500 mt-3 text-sm">{message}</Text>
      )}
    </View>
  );
}
