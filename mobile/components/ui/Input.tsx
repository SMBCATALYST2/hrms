import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  isPassword,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 ${className || ""}`}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-white border rounded-xl px-3 ${
          error ? "border-danger-500" : "border-neutral-300"
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className="flex-1 py-3 text-base text-neutral-900"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-danger-500 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-neutral-400 mt-1">{hint}</Text>
      )}
    </View>
  );
}
