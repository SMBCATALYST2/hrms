import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

import { useLeaveApplication } from "../../hooks/use-leaves";
import { useAuth } from "../../hooks/use-auth";
import { Badge, getStatusBadgeVariant } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Divider } from "../../components/ui/Divider";
import { LoadingScreen } from "../../components/ui/LoadingScreen";
import { useApproveLeave, useRejectLeave } from "../../hooks/use-leaves";

export default function LeaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isManager } = useAuth();

  const { data: leave, isLoading } = useLeaveApplication(id!);
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  if (isLoading || !leave) {
    return <LoadingScreen />;
  }

  const handleApprove = () => {
    Alert.alert("Approve", "Approve this leave request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          approveLeave.mutate(
            { id: leave.id },
            {
              onSuccess: () => {
                Alert.alert("Approved", "Leave request has been approved.");
                router.back();
              },
              onError: (err: any) => {
                Alert.alert(
                  "Error",
                  err?.response?.data?.message || "Failed to approve."
                );
              },
            }
          );
        },
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert("Reject", "Reject this leave request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          rejectLeave.mutate(
            { id: leave.id },
            {
              onSuccess: () => {
                Alert.alert("Rejected", "Leave request has been rejected.");
                router.back();
              },
              onError: (err: any) => {
                Alert.alert(
                  "Error",
                  err?.response?.data?.message || "Failed to reject."
                );
              },
            }
          );
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50 px-4" showsVerticalScrollIndicator={false}>
      {/* Status Header */}
      <Card className="mt-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Avatar
              name={leave.employee_name}
              uri={leave.employee_avatar}
              size="md"
            />
            <View className="ml-3">
              <Text className="text-base font-semibold text-neutral-800">
                {leave.employee_name}
              </Text>
              <Text className="text-xs text-neutral-400">
                Applied on{" "}
                {format(new Date(leave.created_at), "dd MMM yyyy")}
              </Text>
            </View>
          </View>
          <Badge
            label={
              leave.status.charAt(0).toUpperCase() + leave.status.slice(1)
            }
            variant={getStatusBadgeVariant(leave.status)}
            size="md"
          />
        </View>
      </Card>

      {/* Details */}
      <Card className="mb-4">
        <Text className="text-sm font-semibold text-neutral-800 mb-3">
          Leave Details
        </Text>
        <Divider />

        <View className="flex-row py-2.5">
          <Text className="text-sm text-neutral-500 w-28">Type</Text>
          <Text className="text-sm font-medium text-neutral-800 flex-1">
            {leave.leave_type_name}
          </Text>
        </View>

        <View className="flex-row py-2.5">
          <Text className="text-sm text-neutral-500 w-28">From</Text>
          <Text className="text-sm font-medium text-neutral-800 flex-1">
            {format(new Date(leave.from_date), "EEE, dd MMM yyyy")}
          </Text>
        </View>

        <View className="flex-row py-2.5">
          <Text className="text-sm text-neutral-500 w-28">To</Text>
          <Text className="text-sm font-medium text-neutral-800 flex-1">
            {format(new Date(leave.to_date), "EEE, dd MMM yyyy")}
          </Text>
        </View>

        <View className="flex-row py-2.5">
          <Text className="text-sm text-neutral-500 w-28">Duration</Text>
          <Text className="text-sm font-medium text-neutral-800 flex-1">
            {leave.total_days} {leave.total_days === 1 ? "day" : "days"}
            {leave.half_day ? " (Half day)" : ""}
          </Text>
        </View>

        {leave.half_day && leave.half_day_date && (
          <View className="flex-row py-2.5">
            <Text className="text-sm text-neutral-500 w-28">Half Day</Text>
            <Text className="text-sm font-medium text-neutral-800 flex-1">
              {format(new Date(leave.half_day_date), "dd MMM yyyy")}
            </Text>
          </View>
        )}

        <Divider />

        <View className="py-2.5">
          <Text className="text-sm text-neutral-500 mb-1">Reason</Text>
          <Text className="text-sm text-neutral-700 leading-5">
            {leave.reason}
          </Text>
        </View>
      </Card>

      {/* Approval Info */}
      {leave.status !== "pending" && leave.status !== "draft" && (
        <Card className="mb-4">
          <Text className="text-sm font-semibold text-neutral-800 mb-3">
            Approval Info
          </Text>
          <Divider />

          {leave.approved_by && (
            <View className="flex-row py-2.5">
              <Text className="text-sm text-neutral-500 w-28">
                {leave.status === "approved" ? "Approved by" : "Rejected by"}
              </Text>
              <Text className="text-sm font-medium text-neutral-800 flex-1">
                {leave.approved_by}
              </Text>
            </View>
          )}

          {leave.approved_at && (
            <View className="flex-row py-2.5">
              <Text className="text-sm text-neutral-500 w-28">Date</Text>
              <Text className="text-sm font-medium text-neutral-800 flex-1">
                {format(new Date(leave.approved_at), "dd MMM yyyy, hh:mm a")}
              </Text>
            </View>
          )}

          {leave.rejection_reason && (
            <View className="py-2.5">
              <Text className="text-sm text-neutral-500 mb-1">
                Rejection Reason
              </Text>
              <Text className="text-sm text-neutral-700 leading-5">
                {leave.rejection_reason}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Manager Actions */}
      {isManager && leave.status === "pending" && (
        <View className="flex-row gap-3 mb-8">
          <Button
            variant="outline"
            className="flex-1 border-danger-500"
            onPress={handleReject}
            loading={rejectLeave.isPending}
          >
            Reject
          </Button>
          <Button
            className="flex-1 bg-success-500"
            onPress={handleApprove}
            loading={approveLeave.isPending}
          >
            Approve
          </Button>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
