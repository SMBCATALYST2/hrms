import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, type DateData } from "react-native-calendars";
import { format, differenceInMinutes } from "date-fns";

import {
  useMyAttendance,
  useMonthlyAttendance,
  useCheckIn,
  useCheckOut,
} from "../../hooks/use-attendance";
import { Badge, getStatusBadgeVariant } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

const statusColors: Record<string, string> = {
  present: "#22C55E",
  absent: "#EF4444",
  half_day: "#F59E0B",
  on_leave: "#3B82F6",
  holiday: "#8B5CF6",
  weekly_off: "#9CA3AF",
  work_from_home: "#06B6D4",
};

export default function AttendanceScreen() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: attendanceData,
    refetch: refetchAttendance,
  } = useMyAttendance({ limit: 1 });
  const { data: monthlyData, refetch: refetchMonthly } =
    useMonthlyAttendance({ month, year });

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const todayRecord = attendanceData?.data?.[0];
  const isToday = todayRecord?.date === format(now, "yyyy-MM-dd");
  const isCheckedIn =
    isToday && !!todayRecord?.check_in_time && !todayRecord?.check_out_time;
  const hasCheckedOut = isToday && !!todayRecord?.check_out_time;

  // Live working hours counter
  const [workingTime, setWorkingTime] = useState("0h 0m");

  useEffect(() => {
    if (!isCheckedIn || !todayRecord?.check_in_time) return;

    const update = () => {
      const mins = differenceInMinutes(
        new Date(),
        new Date(todayRecord.check_in_time!)
      );
      setWorkingTime(`${Math.floor(mins / 60)}h ${mins % 60}m`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [isCheckedIn, todayRecord?.check_in_time]);

  // Build calendar marked dates
  const markedDates: Record<string, any> = {};
  if (monthlyData?.records) {
    monthlyData.records.forEach((record) => {
      markedDates[record.date] = {
        marked: true,
        dotColor: statusColors[record.status] || "#9CA3AF",
        customStyles: {
          container: {
            backgroundColor: statusColors[record.status]
              ? statusColors[record.status] + "20"
              : undefined,
            borderRadius: 8,
          },
        },
      };
    });
  }
  // Highlight today
  const todayStr = format(now, "yyyy-MM-dd");
  markedDates[todayStr] = {
    ...markedDates[todayStr],
    selected: true,
    selectedColor: "#3B82F6",
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAttendance(), refetchMonthly()]);
    setRefreshing(false);
  };

  const handleCheckIn = () => {
    checkIn.mutate(undefined, {
      onError: (error: any) => {
        Alert.alert(
          "Check-in Failed",
          error?.response?.data?.message || "Unable to check in. Please try again."
        );
      },
    });
  };

  const handleCheckOut = () => {
    Alert.alert("Check Out", "Are you sure you want to check out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Check Out",
        style: "destructive",
        onPress: () => {
          checkOut.mutate(undefined, {
            onError: (error: any) => {
              Alert.alert(
                "Check-out Failed",
                error?.response?.data?.message ||
                  "Unable to check out. Please try again."
              );
            },
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Large Check-in Button */}
        <View className="items-center mt-4 mb-6">
          <TouchableOpacity
            className={`w-36 h-36 rounded-full items-center justify-center shadow-lg ${
              hasCheckedOut
                ? "bg-neutral-300"
                : isCheckedIn
                ? "bg-danger-500"
                : "bg-primary-500"
            }`}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={
              hasCheckedOut || checkIn.isPending || checkOut.isPending
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                hasCheckedOut
                  ? "checkmark-done"
                  : isCheckedIn
                  ? "log-out-outline"
                  : "log-in-outline"
              }
              size={40}
              color="#fff"
            />
            <Text className="text-white font-bold text-sm mt-1">
              {hasCheckedOut
                ? "Done"
                : isCheckedIn
                ? "Check Out"
                : "Check In"}
            </Text>
          </TouchableOpacity>

          {/* Status text */}
          <Text className="text-base font-medium text-neutral-700 mt-4">
            {hasCheckedOut
              ? `Checked out at ${format(
                  new Date(todayRecord!.check_out_time!),
                  "hh:mm a"
                )}`
              : isCheckedIn
              ? `Checked in at ${format(
                  new Date(todayRecord!.check_in_time!),
                  "hh:mm a"
                )}`
              : "Not checked in yet"}
          </Text>

          {/* Working hours counter */}
          {isCheckedIn && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-neutral-500 ml-1">
                Working: {workingTime}
              </Text>
            </View>
          )}
          {hasCheckedOut && todayRecord?.working_hours != null && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-sm text-neutral-500 ml-1">
                Total: {todayRecord.working_hours.toFixed(1)}h
              </Text>
            </View>
          )}
        </View>

        {/* Mini Calendar */}
        <Card className="mb-4" padding={false}>
          <Calendar
            current={`${year}-${String(month).padStart(2, "0")}-01`}
            markedDates={markedDates}
            onMonthChange={(monthData: DateData) => {
              setMonth(monthData.month);
              setYear(monthData.year);
            }}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#6B7280",
              selectedDayBackgroundColor: "#3B82F6",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#3B82F6",
              dayTextColor: "#111827",
              textDisabledColor: "#D1D5DB",
              arrowColor: "#3B82F6",
              monthTextColor: "#111827",
              textMonthFontWeight: "bold",
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
            style={{ borderRadius: 16, overflow: "hidden", padding: 8 }}
          />
          {/* Legend */}
          <View className="flex-row flex-wrap px-4 pb-3 gap-3">
            {Object.entries(statusColors)
              .slice(0, 5)
              .map(([status, color]) => (
                <View key={status} className="flex-row items-center">
                  <View
                    className="w-2.5 h-2.5 rounded-full mr-1"
                    style={{ backgroundColor: color }}
                  />
                  <Text className="text-xs text-neutral-500 capitalize">
                    {status.replace("_", " ")}
                  </Text>
                </View>
              ))}
          </View>
        </Card>

        {/* Monthly Summary */}
        {monthlyData?.summary && (
          <Card className="mb-4">
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Monthly Summary
            </Text>
            <View className="flex-row flex-wrap gap-y-2">
              <View className="w-1/2 flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-success-500 mr-2" />
                <Text className="text-sm text-neutral-600">
                  Present: {monthlyData.summary.present}
                </Text>
              </View>
              <View className="w-1/2 flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-danger-500 mr-2" />
                <Text className="text-sm text-neutral-600">
                  Absent: {monthlyData.summary.absent}
                </Text>
              </View>
              <View className="w-1/2 flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-warning-500 mr-2" />
                <Text className="text-sm text-neutral-600">
                  Half Day: {monthlyData.summary.half_day}
                </Text>
              </View>
              <View className="w-1/2 flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-primary-500 mr-2" />
                <Text className="text-sm text-neutral-600">
                  On Leave: {monthlyData.summary.on_leave}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Recent History */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-neutral-800">
            Recent Attendance
          </Text>
          <TouchableOpacity onPress={() => router.push("/attendance/history")}>
            <Text className="text-sm text-primary-500 font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {monthlyData?.records?.slice(0, 5).map((record) => (
          <View
            key={record.id}
            className="flex-row items-center bg-white rounded-xl p-3 mb-2 border border-neutral-100"
          >
            <View className="flex-1">
              <Text className="text-sm font-medium text-neutral-800">
                {format(new Date(record.date), "EEE, dd MMM")}
              </Text>
              <Text className="text-xs text-neutral-400 mt-0.5">
                {record.check_in_time
                  ? format(new Date(record.check_in_time), "hh:mm a")
                  : "--"}{" "}
                -{" "}
                {record.check_out_time
                  ? format(new Date(record.check_out_time), "hh:mm a")
                  : "--"}
              </Text>
            </View>
            <Badge
              label={record.status.replace("_", " ")}
              variant={getStatusBadgeVariant(record.status)}
            />
          </View>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
