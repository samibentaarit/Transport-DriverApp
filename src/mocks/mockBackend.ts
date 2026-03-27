import { mockMessages, mockNotifications, mockSession, mockTripLiveStatus, mockTrips } from "@/mocks/data";
import type { BackendClient } from "@/services/backend";
import { AuthSession, LoginPayload, UpdateProfilePayload } from "@/types/api";
import { Incident, Message, NotificationItem, TelemetryPoint, Trip, TripLiveStatus } from "@/types/models";
import { createId } from "@/utils/ids";

let trips = JSON.parse(JSON.stringify(mockTrips)) as Trip[];
let notifications = JSON.parse(JSON.stringify(mockNotifications)) as NotificationItem[];
let messages = JSON.parse(JSON.stringify(mockMessages)) as Message[];
let session: AuthSession = { ...mockSession };

function findTrip(tripId: string) {
  const trip = trips.find((item) => item.id === tripId);
  if (!trip) {
    throw new Error("Trip not found.");
  }
  return trip;
}

export const mockBackend: BackendClient = {
  async login(payload: LoginPayload) {
    if (payload.email !== "driver@schooltransport.test" || payload.password !== "password123") {
      throw new Error("The provided credentials are incorrect.");
    }

    return session;
  },
  async logout() {
    return;
  },
  async getCurrentUser() {
    return session.user;
  },
  async updateProfile(payload: UpdateProfilePayload) {
    session = {
      ...session,
      user: {
        ...session.user,
        name: payload.name ?? session.user.name,
        phone: payload.phone ?? session.user.phone
      }
    };
    return session.user;
  },
  async getTodayTrips() {
    return trips;
  },
  async getTripHistory() {
    return trips;
  },
  async getTrip(tripId: string) {
    return findTrip(tripId);
  },
  async getTripLiveStatus(tripId: string) {
    return {
      ...mockTripLiveStatus,
      trip: findTrip(tripId)
    } as TripLiveStatus;
  },
  async startTrip(tripId: string) {
    const trip = findTrip(tripId);
    trip.status = "enroute";
    return trip;
  },
  async endTrip(tripId: string) {
    const trip = findTrip(tripId);
    trip.status = "completed";
    return trip;
  },
  async arriveStop(tripId: string, stopInstanceId: string) {
    const trip = findTrip(tripId);
    const stop = trip.stop_instances?.find((item) => item.id === stopInstanceId);
    if (stop) {
      stop.actual_arrival = new Date().toISOString();
    }
  },
  async departStop(tripId: string, stopInstanceId: string) {
    const trip = findTrip(tripId);
    const stop = trip.stop_instances?.find((item) => item.id === stopInstanceId);
    if (stop) {
      stop.actual_departure = new Date().toISOString();
    }
  },
  async recordBoarding(payload) {
    const trip = findTrip(payload.tripId);
    const assignment = trip.student_assignments?.find((item) => item.student_id === payload.studentId);
    if (assignment) {
      assignment.status = payload.action === "alight" ? "dropped" : "boarded";
      assignment.boarding_time = payload.timestamp;
    }
    const stop = trip.stop_instances?.find((item) => item.id === payload.stopInstanceId);
    if (stop) {
      stop.boarded_count = (stop.boarded_count ?? 0) + 1;
    }
  },
  async submitIncident(payload) {
    return {
      id: createId(),
      trip_id: payload.tripId ?? null,
      vehicle_id: payload.vehicleId ?? null,
      type: payload.type,
      severity: payload.severity,
      description: payload.description,
      created_at: new Date().toISOString()
    } as Incident;
  },
  async sendEmergencyAlert(payload) {
    return mockBackend.submitIncident({
      ...payload,
      type: "safety_violation",
      severity: "critical"
    });
  },
  async fetchNotifications() {
    return notifications;
  },
  async markNotificationRead(notificationId: string) {
    notifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification
    );
  },
  async markAllNotificationsRead() {
    notifications = notifications.map((notification) => ({
      ...notification,
      read_at: notification.read_at ?? new Date().toISOString()
    }));
  },
  async fetchMessages() {
    return messages;
  },
  async enrollDevice() {
    return session;
  },
  async registerPushToken() {
    return;
  },
  async sendTelemetryBatch() {
    return;
  },
  async fetchTelemetryReplay(): Promise<TelemetryPoint[]> {
    return [mockTripLiveStatus.current_location!];
  }
};
