import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";

import { AppProviders } from "@/providers/AppProviders";
import { BrandedSplash } from "@/components/BrandedSplash";
import { useAppBootstrap } from "@/hooks/useAppBootstrap";
import { canUseRemotePushNotifications } from "@/services/pushNotifications";
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
    if (!canUseRemotePushNotifications()) {
      return;
    }

    let mounted = true;
    let subscription: { remove: () => void } | undefined;

    try {
      void (async () => {
        const Notifications = await import("expo-notifications");
        if (!mounted) {
          return;
        }

        const response = Notifications.getLastNotificationResponse();
        const url = response?.notification.request.content.data?.url;
        if (typeof url === "string") {
          router.push(url as never);
        }

        subscription = Notifications.addNotificationResponseReceivedListener((event) => {
          const nextUrl = event.notification.request.content.data?.url;
          if (typeof nextUrl === "string") {
            router.push(nextUrl as never);
          }
        });
      })().catch((error) => {
        console.warn("Notification observer disabled", error);
      });

      return () => {
        mounted = false;
        subscription?.remove();
      };
    } catch (error) {
      console.warn("Notification observer disabled", error);
      return () => {
        mounted = false;
      };
    }
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
