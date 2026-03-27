import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Notifications from "expo-notifications";

import { AppProviders } from "@/app/providers/AppProviders";
import { BrandedSplash } from "@/components/BrandedSplash";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { useAuthStore } from "@/store/authStore";

function useProtectedRoute(ready: boolean) {
  const router = useRouter();
  const segments = useSegments();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const isInAuth = segments[0] === "(auth)";
    if (status === "authenticated" && isInAuth) {
      router.replace("/(app)/(tabs)/today");
    }

    if (status !== "authenticated" && !isInAuth) {
      router.replace("/(auth)/login");
    }
  }, [ready, router, segments, status]);
}

function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    const response = Notifications.getLastNotificationResponse();
    const url = response?.notification.request.content.data?.url;
    if (typeof url === "string") {
      router.push(url as never);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((event) => {
      const nextUrl = event.notification.request.content.data?.url;
      if (typeof nextUrl === "string") {
        router.push(nextUrl as never);
      }
    });

    return () => subscription.remove();
  }, [router]);
}

export default function RootLayout() {
  const ready = useAppBootstrap();
  useProtectedRoute(ready);
  useNotificationObserver();

  return (
    <AppProviders>{ready ? <Stack screenOptions={{ headerShown: false }} /> : <BrandedSplash />}</AppProviders>
  );
}
