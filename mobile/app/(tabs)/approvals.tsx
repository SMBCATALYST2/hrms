import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useLeaveApplications,
  useApproveLeave,
  useRejectLeave,
} from "../../hooks/use-leaves";
import { ApprovalItem } from "../../components/ApprovalItem";
import { EmptyState } from "../../components/EmptyState";
import { Badge } from "../../components/ui/Badge";

type FilterTab = "pending" | "approved" | "rejected";

export default function ApprovalsScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: applications,
    isLoading,
    refetch,
  } = useLeaveApplications({ status: activeTab });

  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = (id: string) => {
    Alert.alert("Approve Request", "Are you sure you want to approve this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          setApprovingId(id);
          approveLeave.mutate(
            { id },
            {
              onSettled: () => setApprovingId(null),
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error?.response?.data?.message || "Failed to approve."
                );
              },
            }
          );
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert("Reject Request", "Are you sure you want to reject this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          setRejectingId(id);
          rejectLeave.mutate(
            { id },
            {
              onSettled: () => setRejectingId(null),
              onError: (error: any) => {
                Alert.alert(
                  "Error",
                  error?.response?.data?.message || "Failed to reject."
                );
              },
            }
          );
        },
      },
    ]);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Filter Tabs */}
      <View className="flex-row px-4 pt-4 pb-2 gap-2">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              activeTab === tab.key
                ? "bg-primary-500"
                : "bg-white border border-neutral-200"
            }`}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === tab.key ? "text-white" : "text-neutral-600"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending count */}
        {activeTab === "pending" && applications?.total != null && (
          <View className="flex-row items-center mb-3">
            <Badge
              label={`${applications.total} pending`}
              variant="warning"
              size="md"
            />
          </View>
        )}

        {applications?.data?.length ? (
          applications.data.map((app) => (
            <ApprovalItem
              key={app.id}
              id={app.id}
              requesterName={app.employee_name}
              requesterAvatar={app.employee_avatar}
              type="Leave Request"
              subtitle={`${app.leave_type_name} - ${app.total_days} ${
                app.total_days === 1 ? "day" : "days"
              }`}
              fromDate={app.from_date}
              toDate={app.to_date}
              reason={app.reason}
              status={app.status}
              onApprove={handleApprove}
              onReject={handleReject}
              approving={approvingId === app.id}
              rejecting={rejectingId === app.id}
            />
          ))
        ) : !isLoading ? (
          <EmptyState
            icon="checkmark-done-outline"
            title={`No ${activeTab} requests`}
            message={
              activeTab === "pending"
                ? "All caught up! No pending approvals."
                : `No ${activeTab} requests to show.`
            }
          />
        ) : null}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
