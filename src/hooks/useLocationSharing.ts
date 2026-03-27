import { useEffect } from "react";

import { useQueueStore } from "@/offline/queueStore";
import { backend } from "@/services/backend";
import { startLocationWatcher } from "@/services/locationService";
import { useNetworkStore } from "@/store/networkStore";
import { useSettingsStore } from "@/store/settingsStore";
import { createId } from "@/utils/ids";

type ActiveTripContext = {
  tripId: string;
  vehicleId?: string | null;
  status?: string;
};

export function useLocationSharing(activeTrip?: ActiveTripContext) {
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);
  const locationSharingEnabled = useSettingsStore((state) => state.locationSharingEnabled);
  const enqueue = useQueueStore((state) => state.enqueue);

  useEffect(() => {
    const vehicleId = activeTrip?.vehicleId ?? undefined;
    const tripStatus = activeTrip?.status;
    if (!vehicleId || tripStatus !== "enroute" || !locationSharingEnabled) {
      return;
    }

    let mounted = true;
    let subscription: { remove: () => void } | undefined;

    void startLocationWatcher(async (location) => {
      if (!mounted) {
        return;
      }

      const point = {
        ts: new Date().toISOString(),
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        speed: typeof location.coords.speed === "number" && location.coords.speed > 0 ? location.coords.speed * 3.6 : 0,
        heading: typeof location.coords.heading === "number" ? location.coords.heading : undefined
      };

      if (isOnline) {
        try {
          await backend.sendTelemetryBatch({
            vehicleId,
            points: [point]
          });
          return;
        } catch {
          // Fall through to queueing when the live call fails.
        }
      }

      await enqueue({
        id: createId(),
        type: "telemetry.batch",
        status: "pending",
        retries: 0,
        createdAt: new Date().toISOString(),
        payload: {
          vehicleId,
          points: [point]
        }
      });
    }).then((watcher) => {
      subscription = watcher;
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [activeTrip?.status, activeTrip?.vehicleId, enqueue, isOnline, locationSharingEnabled]);
}
