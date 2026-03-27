import { Platform } from "react-native";

import { apiClient } from "@/api/client";
import {
  normalizeIncident,
  normalizeLiveTrip,
  normalizeMessage,
  normalizeNotification,
  normalizeTrip,
  normalizeUser
} from "@/api/normalizers";
import { env } from "@/services/env";
import { mockBackend } from "@/mocks/mockBackend";
import { useAuthStore } from "@/store/authStore";
import { AuthSession, LoginPayload, LoginResponse, NotificationsResponse, UpdateProfilePayload } from "@/types/api";
import {
  Incident,
  IncidentSeverity,
  IncidentType,
  Message,
  NotificationItem,
  TelemetryPoint,
  Trip,
  TripLiveStatus,
  User
} from "@/types/models";
import { AppError } from "@/utils/errors";
import { filterTripsForDriver } from "@/utils/trips";

type BoardingPayload = {
  tripId: string;
  stopInstanceId: string;
  studentId: string;
  action: "board" | "alight";
  method: "manual" | "scan" | "rfid";
  timestamp: string;
};

type IncidentPayload = {
  tripId?: string;
  vehicleId?: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  lat?: number;
  lng?: number;
  images?: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
  }[];
};

type TelemetryBatchPayload = {
  vehicleId: string;
  points: {
    ts: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    battery?: number;
  }[];
};

type DeviceEnrollmentPayload = {
  code: string;
};

export type BackendClient = {
  login: (payload: LoginPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  getTodayTrips: () => Promise<Trip[]>;
  getTripHistory: () => Promise<Trip[]>;
  getTrip: (tripId: string) => Promise<Trip>;
  getTripLiveStatus: (tripId: string) => Promise<TripLiveStatus>;
  startTrip: (tripId: string) => Promise<Trip>;
  endTrip: (tripId: string) => Promise<Trip>;
  arriveStop: (tripId: string, stopInstanceId: string) => Promise<void>;
  departStop: (tripId: string, stopInstanceId: string) => Promise<void>;
  recordBoarding: (payload: BoardingPayload) => Promise<void>;
  submitIncident: (payload: IncidentPayload) => Promise<Incident>;
  sendEmergencyAlert: (payload: Omit<IncidentPayload, "type" | "severity">) => Promise<Incident>;
  fetchNotifications: () => Promise<NotificationItem[]>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  fetchMessages: () => Promise<Message[]>;
  enrollDevice: (payload: DeviceEnrollmentPayload) => Promise<AuthSession>;
  registerPushToken: (token: string) => Promise<void>;
  sendTelemetryBatch: (payload: TelemetryBatchPayload) => Promise<void>;
  fetchTelemetryReplay: (trackerId: string, from: string, to: string) => Promise<TelemetryPoint[]>;
};

function currentDateString() {
  return new Date().toISOString().slice(0, 10);
}

function currentUserId() {
  return useAuthStore.getState().session?.user.id ?? "";
}

async function getDriverTrips(path: string) {
  const response = await apiClient.get<{
    data: Trip[];
  }>(path);

  return filterTripsForDriver(response.data.map(normalizeTrip), currentUserId());
}

async function buildMultipartIncident(payload: IncidentPayload) {
  const form = new FormData();
  if (payload.tripId) {
    form.append("trip_id", payload.tripId);
  }
  if (payload.vehicleId) {
    form.append("vehicle_id", payload.vehicleId);
  }
  form.append("type", payload.type);
  form.append("severity", payload.severity);
  form.append("description", payload.description);
  if (payload.lat != null) {
    form.append("lat", String(payload.lat));
  }
  if (payload.lng != null) {
    form.append("lng", String(payload.lng));
  }
  payload.images?.forEach((image) => {
    form.append("images[]", {
      uri: image.uri,
      name: image.fileName ?? "incident-photo.jpg",
      type: image.mimeType ?? "image/jpeg"
    } as never);
  });
  return form;
}

const liveBackend: BackendClient = {
  async login(payload) {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email: payload.email,
      password: payload.password,
      device_info: payload.deviceInfo
    });

    return {
      accessToken: response.token,
      tokenType: response.token_type,
      user: normalizeUser(response.user)
    };
  },
  async logout() {
    await apiClient.post("/auth/logout");
  },
  async getCurrentUser() {
    const response = await apiClient.get<{ data: User }>("/auth/me");
    return normalizeUser(response.data);
  },
  async updateProfile(payload) {
    const response = await apiClient.put<{ data: User }>("/auth/me", payload);
    return normalizeUser(response.data);
  },
  async getTodayTrips() {
    return getDriverTrips(`/trips?date=${currentDateString()}&per_page=50`);
  },
  async getTripHistory() {
    return getDriverTrips("/trips?per_page=50");
  },
  async getTrip(tripId) {
    const response = await apiClient.get<{ data: Trip }>(`/trips/${tripId}`);
    return normalizeTrip(response.data);
  },
  async getTripLiveStatus(tripId) {
    const response = await apiClient.get<{
      data: TripLiveStatus;
    }>(`/trips/${tripId}/live`);
    return normalizeLiveTrip(response);
  },
  async startTrip(tripId) {
    const response = await apiClient.post<{ data: Trip }>(`/trips/${tripId}/start`);
    return normalizeTrip(response.data);
  },
  async endTrip(tripId) {
    const response = await apiClient.post<{ data: Trip }>(`/trips/${tripId}/end`);
    return normalizeTrip(response.data);
  },
  async arriveStop(tripId, stopInstanceId) {
    await apiClient.post(`/trips/${tripId}/stops/${stopInstanceId}/arrive`);
  },
  async departStop(tripId, stopInstanceId) {
    await apiClient.post(`/trips/${tripId}/stops/${stopInstanceId}/depart`);
  },
  async recordBoarding(payload) {
    try {
      await apiClient.post("/telemetry/boarding", {
        trip_id: payload.tripId,
        device_id: useAuthStore.getState().deviceId,
        entries: [
          {
            student_id: payload.studentId,
            stop_instance_id: payload.stopInstanceId,
            method: payload.method,
            ts: payload.timestamp
          }
        ],
        events: [
          {
            trip_id: payload.tripId,
            student_id: payload.studentId,
            action: payload.action,
            stop_id: payload.stopInstanceId,
            timestamp: payload.timestamp
          }
        ]
      });
    } catch (error) {
      throw new AppError(
        "Boarding sync is currently blocked by a Laravel contract mismatch on /telemetry/boarding. See the mobile README for the backend patch note.",
        {
          status: error instanceof AppError ? error.status : undefined
        }
      );
    }
  },
  async submitIncident(payload) {
    const form = await buildMultipartIncident(payload);
    const response = await apiClient.post<{ data: Incident }>("/incidents", form);
    return normalizeIncident(response.data);
  },
  async sendEmergencyAlert(payload) {
    return liveBackend.submitIncident({
      ...payload,
      type: "safety_violation",
      severity: "critical",
      description: payload.description || "Emergency alert triggered from the driver app."
    });
  },
  async fetchNotifications() {
    const response = await apiClient.get<NotificationsResponse>("/notifications");
    return response.data.map((item) => normalizeNotification(item as unknown as Record<string, unknown>));
  },
  async markNotificationRead(notificationId) {
    await apiClient.post(`/notifications/${notificationId}/read`);
  },
  async markAllNotificationsRead() {
    await apiClient.post("/notifications/read-all");
  },
  async fetchMessages() {
    if (!env.messagesPath) {
      return [];
    }

    const response = await apiClient.get<{
      data: Record<string, unknown>[];
    }>(env.messagesPath);
    return response.data.map(normalizeMessage);
  },
  async enrollDevice(payload) {
    if (!env.enableDeviceEnrollment || !env.deviceEnrollmentPath) {
      throw new AppError("Device enrollment is not enabled by the backend configuration.");
    }

    const response = await apiClient.post<LoginResponse>(env.deviceEnrollmentPath, {
      code: payload.code,
      platform: Platform.OS,
      device_id: useAuthStore.getState().deviceId
    });

    return {
      accessToken: response.token,
      tokenType: response.token_type,
      user: normalizeUser(response.user)
    };
  },
  async registerPushToken(token) {
    if (!env.pushTokenPath) {
      return;
    }

    await apiClient.post(env.pushTokenPath, {
      token,
      platform: Platform.OS,
      device_id: useAuthStore.getState().deviceId
    });
  },
  async sendTelemetryBatch(payload) {
    await apiClient.post("/telemetry/batch", {
      vehicle_id: payload.vehicleId,
      device_id: useAuthStore.getState().deviceId,
      points: payload.points
    });
  },
  async fetchTelemetryReplay(trackerId, from, to) {
    const response = await apiClient.get<{
      data: TelemetryPoint[];
    }>(`/telemetry/query?tracker_id=${trackerId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

    return response.data;
  }
};

export const backend: BackendClient = env.useMocks ? mockBackend : liveBackend;

