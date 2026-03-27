import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../hooks/use-auth";
import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { Divider } from "../../components/ui/Divider";
import { Button } from "../../components/ui/Button";

interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function ProfileMenuItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}: ProfileMenuItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-3"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View
        className={`w-9 h-9 rounded-lg items-center justify-center mr-3 ${
          danger ? "bg-danger-50" : "bg-neutral-100"
        }`}
      >
        <Ionicons
          name={icon}
          size={18}
          color={danger ? "#EF4444" : "#6B7280"}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${
            danger ? "text-danger-500" : "text-neutral-700"
          }`}
        >
          {label}
        </Text>
        {value && (
          <Text className="text-xs text-neutral-400 mt-0.5">{value}</Text>
        )}
      </View>
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const roleName = user?.role
    ?.split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="items-center mt-6 mb-6">
          <Avatar
            uri={user?.avatar_url}
            name={user?.full_name || "User"}
            size="xl"
          />
          <Text className="text-xl font-bold text-neutral-900 mt-3">
            {user?.full_name}
          </Text>
          <Text className="text-sm text-neutral-500 mt-0.5">{roleName}</Text>
        </View>

        {/* Info Card */}
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-neutral-800 mb-2">
            Employee Information
          </Text>
          <Divider />
          <ProfileMenuItem
            icon="id-card-outline"
            label="Employee ID"
            value={user?.employee_id || "N/A"}
            showChevron={false}
          />
          <ProfileMenuItem
            icon="mail-outline"
            label="Email"
            value={user?.email}
            showChevron={false}
          />
          <ProfileMenuItem
            icon="business-outline"
            label="Department"
            value="Engineering"
            showChevron={false}
          />
          <ProfileMenuItem
            icon="briefcase-outline"
            label="Designation"
            value={roleName}
            showChevron={false}
          />
        </Card>

        {/* Settings Card */}
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-neutral-800 mb-2">
            Settings
          </Text>
          <Divider />
          <ProfileMenuItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => {
              Alert.alert("Coming Soon", "Password change is not available yet.");
            }}
          />
          <ProfileMenuItem
            icon="finger-print"
            label="Biometric Login"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Biometric settings are not available yet."
              );
            }}
          />
          <ProfileMenuItem
            icon="notifications-outline"
            label="Notification Preferences"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Notification preferences are not available yet."
              );
            }}
          />
          <ProfileMenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() => {
              Alert.alert("HRMS Mobile", "Version 1.0.0\nBuilt with Expo + React Native");
            }}
          />
        </Card>

        {/* Logout */}
        <View className="mb-8">
          <Button
            variant="destructive"
            onPress={handleLogout}
            loading={isLoading}
            icon={<Ionicons name="log-out-outline" size={18} color="#fff" />}
          >
            Logout
          </Button>
        </View>

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
