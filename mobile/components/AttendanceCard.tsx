import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { format, differenceInMinutes } from "date-fns";

interface AttendanceCardProps {
  isCheckedIn: boolean;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loading?: boolean;
}

export function AttendanceCard({
  isCheckedIn,
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
  loading,
}: AttendanceCardProps) {
  const [elapsed, setElapsed] = useState("");

  // Live timer while checked in
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) {
      setElapsed("");
      return;
    }

    const updateElapsed = () => {
      const minutes = differenceInMinutes(new Date(), new Date(checkInTime));
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      setElapsed(`${hours}h ${mins}m`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  return (
    <Card className="mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-neutral-800">
          Today's Attendance
        </Text>
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-1.5 ${
              isCheckedIn ? "bg-success-500" : "bg-neutral-300"
            }`}
          />
          <Text className="text-sm text-neutral-500">
            {isCheckedIn ? "Checked In" : checkOutTime ? "Checked Out" : "Not Checked In"}
          </Text>
        </View>
      </View>

      {/* Time Info */}
      <View className="flex-row mb-4">
        <View className="flex-1">
          <Text className="text-xs text-neutral-400 mb-0.5">Check In</Text>
          <Text className="text-sm font-medium text-neutral-700">
            {checkInTime ? format(new Date(checkInTime), "hh:mm a") : "--:--"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-neutral-400 mb-0.5">Check Out</Text>
          <Text className="text-sm font-medium text-neutral-700">
            {checkOutTime ? format(new Date(checkOutTime), "hh:mm a") : "--:--"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-neutral-400 mb-0.5">Working Hrs</Text>
          <Text className="text-sm font-medium text-neutral-700">
            {elapsed || "--"}
          </Text>
        </View>
      </View>

      {/* Check In / Check Out Button */}
      <TouchableOpacity
        className={`flex-row items-center justify-center py-3.5 rounded-xl ${
          isCheckedIn ? "bg-danger-500" : "bg-primary-500"
        } ${loading ? "opacity-60" : ""}`}
        onPress={isCheckedIn ? onCheckOut : onCheckIn}
        disabled={loading || !!checkOutTime}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons
              name={isCheckedIn ? "log-out-outline" : "log-in-outline"}
              size={20}
              color="#fff"
            />
            <Text className="text-white font-semibold text-base ml-2">
              {checkOutTime ? "Done for Today" : isCheckedIn ? "Check Out" : "Check In"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Card>
  );
}
