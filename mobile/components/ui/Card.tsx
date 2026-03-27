import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: boolean;
}

export function Card({
  children,
  padding = true,
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl shadow-sm border border-neutral-100 ${
        padding ? "p-4" : ""
      } ${className || ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
