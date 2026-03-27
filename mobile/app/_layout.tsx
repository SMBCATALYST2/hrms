import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function RootLayoutNav() {
  const { isInitialized, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="attendance/history"
              options={{
                headerShown: true,
                title: "Attendance History",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="leaves/apply"
              options={{
                headerShown: true,
                title: "Apply for Leave",
                headerBackTitle: "Back",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="leaves/[id]"
              options={{
                headerShown: true,
                title: "Leave Details",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: true,
                title: "Notifications",
                headerBackTitle: "Back",
              }}
            />
          </>
        ) : (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
