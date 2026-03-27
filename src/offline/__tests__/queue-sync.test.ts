jest.mock("@/services/backend", () => ({
  backend: {
    startTrip: jest.fn(),
    endTrip: jest.fn(),
    arriveStop: jest.fn(),
    departStop: jest.fn(),
    recordBoarding: jest.fn(),
    submitIncident: jest.fn(),
    sendEmergencyAlert: jest.fn(),
    sendTelemetryBatch: jest.fn(),
    markNotificationRead: jest.fn()
  }
}));

import { backend } from "@/services/backend";
import { syncOfflineQueue } from "@/offline/queueSync";
import { useQueueStore } from "@/offline/queueStore";

describe("offline queue sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQueueStore.setState({
      hydrated: true,
      items: [],
      meta: {
        syncInProgress: false,
        lastError: null
      }
    });
  });

  it("replays a queued start trip action", async () => {
    useQueueStore.setState({
      items: [
        {
          id: "queue-1",
          type: "trip.start",
          status: "pending",
          retries: 0,
          createdAt: "2026-03-26T08:00:00.000Z",
          payload: {
            tripId: "trip-1"
          }
        }
      ]
    });

    await syncOfflineQueue();

    expect(backend.startTrip).toHaveBeenCalledWith("trip-1");
    expect(useQueueStore.getState().items).toHaveLength(0);
  });

  it("maps missed boarding events to incidents", async () => {
    useQueueStore.setState({
      items: [
        {
          id: "queue-2",
          type: "boarding.record",
          status: "pending",
          retries: 0,
          createdAt: "2026-03-26T08:00:00.000Z",
          payload: {
            tripId: "trip-1",
            stopInstanceId: "stop-1",
            studentId: "student-1",
            action: "missed",
            method: "manual",
            timestamp: "2026-03-26T08:00:00.000Z"
          }
        }
      ]
    });

    await syncOfflineQueue();

    expect(backend.submitIncident).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId: "trip-1",
        type: "missed_student"
      })
    );
  });
});

