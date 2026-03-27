import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useConnectivityMonitor } from "@/hooks/useConnectivityMonitor";
import { registerForPushNotifications } from "@/services/pushNotifications";
import { useQueueStore } from "@/offline/queueStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

void SplashScreen.preventAutoHideAsync();

export function useAppBootstrap() {
  const [ready, setReady] = useState(false);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const authStatus = useAuthStore((state) => state.status);
  const hydrateQueue = useQueueStore((state) => state.hydrate);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);

  useConnectivityMonitor();
  useOfflineSync();

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await Promise.all([hydrateAuth(), hydrateQueue()]);
      if (!mounted) {
        return;
      }

      setReady(true);
      await SplashScreen.hideAsync();
    })();

    return () => {
      mounted = false;
    };
  }, [hydrateAuth, hydrateQueue]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !notificationsEnabled) {
      return;
    }

    void registerForPushNotifications();
  }, [authStatus, notificationsEnabled]);

  return ready;
}
