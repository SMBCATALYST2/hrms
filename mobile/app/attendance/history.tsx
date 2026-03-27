import React, { useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { format } from "date-fns";

import { useMyAttendance } from "../../hooks/use-attendance";
import { Badge, getStatusBadgeVariant } from "../../components/ui/Badge";
import { EmptyState } from "../../components/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import type { AttendanceRecord } from "../../services/attendance.service";

export default function AttendanceHistoryScreen() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useMyAttendance({ page, limit });
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <View className="flex-row items-center bg-white px-4 py-3 border-b border-neutral-100">
      {/* Date */}
      <View className="w-16 items-center mr-3">
        <Text className="text-xl font-bold text-neutral-800">
          {format(new Date(item.date), "dd")}
        </Text>
        <Text className="text-xs text-neutral-400">
          {format(new Date(item.date), "MMM")}
        </Text>
        <Text className="text-xs text-neutral-400">
          {format(new Date(item.date), "EEE")}
        </Text>
      </View>

      {/* Details */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Badge
            label={item.status.replace("_", " ")}
            variant={getStatusBadgeVariant(item.status)}
          />
        </View>
        <Text className="text-sm text-neutral-500">
          {item.check_in_time
            ? format(new Date(item.check_in_time), "hh:mm a")
            : "--:--"}{" "}
          -{" "}
          {item.check_out_time
            ? format(new Date(item.check_out_time), "hh:mm a")
            : "--:--"}
        </Text>
      </View>

      {/* Working hours */}
      <View className="items-end">
        {item.working_hours != null && (
          <Text className="text-sm font-medium text-neutral-700">
            {item.working_hours.toFixed(1)}h
          </Text>
        )}
        {item.late_entry && (
          <Text className="text-xs text-warning-500">Late</Text>
        )}
        {item.early_exit && (
          <Text className="text-xs text-warning-500">Early</Text>
        )}
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-neutral-50">
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No Attendance Records"
            message="Your attendance history will appear here."
          />
        }
        onEndReached={() => {
          if (data && data.data.length < data.total) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
