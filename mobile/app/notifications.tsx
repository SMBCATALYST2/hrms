import React, { useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../services/api";
import { API_ROUTES } from "../constants/api";
import { NotificationItem } from "../components/NotificationItem";
import { EmptyState } from "../components/EmptyState";
import { LoadingScreen } from "../components/ui/LoadingScreen";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "action_required" | "success" | "error";
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get<{ data: Notification[]; total: number }>(
        API_ROUTES.NOTIFICATIONS.LIST
      );
      return res.data;
    },
  });
}

function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(API_ROUTES.NOTIFICATIONS.MARK_READ(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export default function NotificationsScreen() {
  const { data, isLoading, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePress = (id: string) => {
    markRead.mutate(id);
  };

  if (isLoading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={data?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            id={item.id}
            title={item.title}
            message={item.message}
            type={item.type}
            isRead={item.is_read}
            createdAt={item.created_at}
            onPress={handlePress}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            message="You're all caught up! New notifications will appear here."
          />
        }
      />
    </View>
  );
}
