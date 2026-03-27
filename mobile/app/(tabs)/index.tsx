import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

import { useAuth } from "../../hooks/use-auth";
import { useMyAttendance, useCheckIn, useCheckOut } from "../../hooks/use-attendance";
import { useLeaveBalance } from "../../hooks/use-leaves";
import { AttendanceCard } from "../../components/AttendanceCard";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/ui/Card";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isManager } = useAuth();
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useMyAttendance({ limit: 1 });
  const { data: leaveBalance, refetch: refetchLeaves } = useLeaveBalance();

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const [refreshing, setRefreshing] = React.useState(false);

  const todayRecord = attendanceData?.data?.[0];
  const isToday =
    todayRecord?.date === format(new Date(), "yyyy-MM-dd");
  const isCheckedIn = isToday && !!todayRecord?.check_in_time && !todayRecord?.check_out_time;

  const totalLeaveBalance = leaveBalance?.reduce(
    (sum, b) => sum + b.available,
    0
  ) ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchLeaves()]);
    setRefreshing(false);
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2 mb-5">
          <View className="flex-1">
            <Text className="text-sm text-neutral-500">
              {format(new Date(), "EEEE, dd MMMM yyyy")}
            </Text>
            <Text className="text-2xl font-bold text-neutral-900 mt-0.5">
              {getGreeting()}, {firstName}
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-full items-center justify-center border border-neutral-200"
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Today's Attendance Card */}
        <AttendanceCard
          isCheckedIn={isCheckedIn}
          checkInTime={isToday ? todayRecord?.check_in_time : null}
          checkOutTime={isToday ? todayRecord?.check_out_time : null}
          onCheckIn={() => checkIn.mutate()}
          onCheckOut={() => checkOut.mutate()}
          loading={checkIn.isPending || checkOut.isPending}
        />

        {/* Stats Row */}
        <View className="flex-row gap-3 mb-5">
          <StatCard
            icon="flame"
            iconColor="#F59E0B"
            iconBg="#FEF3C7"
            value="12"
            label="Day Streak"
          />
          <StatCard
            icon="calendar-outline"
            iconColor="#3B82F6"
            iconBg="#DBEAFE"
            value={totalLeaveBalance}
            label="Leave Balance"
            onPress={() => router.push("/(tabs)/leaves")}
          />
          {isManager && (
            <StatCard
              icon="hourglass-outline"
              iconColor="#EF4444"
              iconBg="#FEE2E2"
              value="3"
              label="Pending"
              onPress={() => router.push("/(tabs)/approvals")}
            />
          )}
        </View>

        {/* Quick Actions */}
        <Text className="text-base font-semibold text-neutral-800 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row gap-3 mb-5">
          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-neutral-100 items-center"
            onPress={() => router.push("/leaves/apply")}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="add-circle-outline" size={22} color="#3B82F6" />
            </View>
            <Text className="text-xs font-medium text-neutral-700">
              Apply Leave
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-neutral-100 items-center"
            onPress={() => router.push("/attendance/history")}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-success-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="receipt-outline" size={22} color="#22C55E" />
            </View>
            <Text className="text-xs font-medium text-neutral-700">
              View Payslip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-xl p-4 border border-neutral-100 items-center"
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 bg-warning-100 rounded-full items-center justify-center mb-2">
              <Ionicons name="clipboard-outline" size={22} color="#F59E0B" />
            </View>
            <Text className="text-xs font-medium text-neutral-700">
              My Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming */}
        <Text className="text-base font-semibold text-neutral-800 mb-3">
          Upcoming
        </Text>
        <Card className="mb-6">
          <View className="flex-row items-center mb-3">
            <Ionicons name="gift-outline" size={18} color="#EC4899" />
            <Text className="text-sm font-medium text-neutral-700 ml-2">
              Birthdays This Week
            </Text>
          </View>
          <Text className="text-sm text-neutral-500">
            No upcoming birthdays this week.
          </Text>

          <View className="h-px bg-neutral-100 my-3" />

          <View className="flex-row items-center mb-3">
            <Ionicons name="flag-outline" size={18} color="#8B5CF6" />
            <Text className="text-sm font-medium text-neutral-700 ml-2">
              Upcoming Holidays
            </Text>
          </View>
          <Text className="text-sm text-neutral-500">
            No upcoming holidays this month.
          </Text>
        </Card>

        {/* Bottom spacer for tab bar */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
}
