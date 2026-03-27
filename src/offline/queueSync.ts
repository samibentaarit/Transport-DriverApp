import { backend } from "@/services/backend";
import { useQueueStore } from "@/offline/queueStore";
import { QueueItem } from "@/types/queue";
import { AppError } from "@/utils/errors";

async function syncItem(item: QueueItem) {
  switch (item.type) {
    case "trip.start":
      await backend.startTrip(item.payload.tripId);
      return;
    case "trip.end":
      await backend.endTrip(item.payload.tripId);
      return;
    case "stop.arrive":
      await backend.arriveStop(item.payload.tripId, item.payload.stopInstanceId);
      return;
    case "stop.depart":
      await backend.departStop(item.payload.tripId, item.payload.stopInstanceId);
      return;
    case "boarding.record":
      if (item.payload.action === "missed") {
        await backend.submitIncident({
          tripId: item.payload.tripId,
          type: "missed_student",
          severity: "medium",
          description: `Student ${item.payload.studentId} was marked as missed at stop ${item.payload.stopInstanceId}.`
        });
        return;
      }

      await backend.recordBoarding({
        tripId: item.payload.tripId,
        stopInstanceId: item.payload.stopInstanceId,
        studentId: item.payload.studentId,
        action: item.payload.action,
        method: item.payload.method,
        timestamp: item.payload.timestamp
      });
      return;
    case "incident.report":
    case "emergency.alert":
      if (item.type === "emergency.alert") {
        await backend.sendEmergencyAlert(item.payload);
        return;
      }

      await backend.submitIncident(item.payload);
      return;
    case "telemetry.batch":
      await backend.sendTelemetryBatch(item.payload);
      return;
    case "notification.read":
      await backend.markNotificationRead(item.payload.notificationId);
      return;
    default:
      return;
  }
}

export async function syncOfflineQueue() {
  const queue = useQueueStore.getState();
  if (queue.meta.syncInProgress || queue.items.length === 0) {
    return;
  }

  await queue.setMeta({
    syncInProgress: true,
    lastError: null
  });

  for (const item of useQueueStore.getState().items) {
    try {
      await useQueueStore.getState().update(item.id, (current) => ({
        ...current,
        status: "syncing"
      }));

      await syncItem(item);
      await useQueueStore.getState().remove(item.id);
    } catch (error) {
      await useQueueStore.getState().update(item.id, (current) => ({
        ...current,
        status: "failed",
        retries: current.retries + 1
      }));

      await useQueueStore.getState().setMeta({
        lastError: error instanceof AppError ? error.message : "Offline sync failed."
      });

      if (error instanceof AppError && error.status && error.status >= 400 && error.status < 500) {
        continue;
      }

      break;
    }
  }

  await useQueueStore.getState().setMeta({
    syncInProgress: false,
    lastSyncAt: new Date().toISOString()
  });
}

