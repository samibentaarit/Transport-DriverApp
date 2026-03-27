import { useEffect } from "react";

import { syncOfflineQueue } from "@/offline/queueSync";
import { env } from "@/services/env";
import { useNetworkStore } from "@/store/networkStore";

export function useOfflineSync() {
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);

  useEffect(() => {
    if (!isOnline) {
      return;
    }

    void syncOfflineQueue();
    const interval = setInterval(() => {
      void syncOfflineQueue();
    }, env.syncIntervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline]);
}

