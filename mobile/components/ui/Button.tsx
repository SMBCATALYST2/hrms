import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  View,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary-500 active:bg-primary-600",
    text: "text-white",
  },
  secondary: {
    container: "bg-neutral-100 active:bg-neutral-200",
    text: "text-neutral-800",
  },
  destructive: {
    container: "bg-danger-500 active:bg-danger-600",
    text: "text-white",
  },
  outline: {
    container: "border border-neutral-300 bg-white active:bg-neutral-50",
    text: "text-neutral-800",
  },
  ghost: {
    container: "bg-transparent active:bg-neutral-100",
    text: "text-neutral-700",
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: "px-3 py-2 rounded-lg",
    text: "text-sm",
  },
  md: {
    container: "px-4 py-3 rounded-xl",
    text: "text-base",
  },
  lg: {
    container: "px-6 py-4 rounded-xl",
    text: "text-lg",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantStyle = variantClasses[variant];
  const sizeStyle = sizeClasses[size];

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${sizeStyle.container} ${variantStyle.container} ${
        disabled || loading ? "opacity-50" : ""
      } ${className || ""}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "destructive" ? "#fff" : "#374151"}
          className="mr-2"
        />
      ) : icon ? (
        <View className="mr-2">{icon}</View>
      ) : null}
      <Text
        className={`font-semibold ${sizeStyle.text} ${variantStyle.text}`}
      >
        {typeof children === "string" ? children : children}
      </Text>
    </TouchableOpacity>
  );
}
