import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

import { useLeaveBalance, useLeaveApplications } from "../../hooks/use-leaves";
import { LeaveBalanceCard } from "../../components/LeaveBalanceCard";
import { Badge, getStatusBadgeVariant } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/EmptyState";
import type { LeaveApplication } from "../../services/leave.service";

export default function LeavesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: balances,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useLeaveBalance();
  const {
    data: applications,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = useLeaveApplications();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBalances(), refetchApps()]);
    setRefreshing(false);
  };

  const renderApplication = (item: LeaveApplication) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/leaves/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-neutral-800">
            {item.leave_type_name}
          </Text>
          <Badge
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={getStatusBadgeVariant(item.status)}
          />
        </View>
        <View className="flex-row items-center mb-1">
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text className="text-sm text-neutral-500 ml-1.5">
            {format(new Date(item.from_date), "dd MMM")} -{" "}
            {format(new Date(item.to_date), "dd MMM yyyy")}
          </Text>
          <Text className="text-sm text-neutral-400 ml-2">
            ({item.total_days} {item.total_days === 1 ? "day" : "days"})
          </Text>
        </View>
        {item.half_day && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="text-xs text-neutral-400 ml-1.5">Half day</Text>
          </View>
        )}
        <Text className="text-sm text-neutral-500 mt-1" numberOfLines={2}>
          {item.reason}
        </Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Leave Balances - Horizontal scroll */}
        <View className="mt-4 mb-5">
          <Text className="text-base font-semibold text-neutral-800 px-4 mb-3">
            Leave Balance
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {balances?.map((balance) => (
              <LeaveBalanceCard
                key={balance.id}
                leaveType={balance.leave_type_name}
                used={balance.used}
                total={balance.total_allocated}
                pending={balance.pending}
              />
            ))}
            {!balances?.length && !balancesLoading && (
              <View className="w-40 h-24 items-center justify-center">
                <Text className="text-sm text-neutral-400">
                  No leave types
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Applications */}
        <View className="px-4">
          <Text className="text-base font-semibold text-neutral-800 mb-3">
            My Applications
          </Text>

          {applications?.data?.length ? (
            applications.data.map(renderApplication)
          ) : !appsLoading ? (
            <EmptyState
              icon="calendar-outline"
              title="No Leave Applications"
              message="You haven't applied for any leaves yet."
            />
          ) : null}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-28 right-5 w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push("/leaves/apply")}
        activeOpacity={0.8}
        style={{
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
