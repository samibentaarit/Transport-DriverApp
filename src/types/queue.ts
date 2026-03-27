import { IncidentSeverity, IncidentType } from "@/types/models";

export type QueueItemType =
  | "trip.start"
  | "trip.end"
  | "stop.arrive"
  | "stop.depart"
  | "boarding.record"
  | "incident.report"
  | "emergency.alert"
  | "telemetry.batch"
  | "notification.read";

export type QueueStatus = "pending" | "syncing" | "failed";

export type QueueItem =
  | {
      id: string;
      type: "trip.start" | "trip.end";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
        tripId: string;
      };
    }
  | {
      id: string;
      type: "stop.arrive" | "stop.depart";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
        tripId: string;
        stopInstanceId: string;
      };
    }
  | {
      id: string;
      type: "boarding.record";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
        tripId: string;
        stopInstanceId: string;
        studentId: string;
        action: "board" | "alight" | "missed";
        method: "manual" | "scan" | "rfid";
        timestamp: string;
      };
    }
  | {
      id: string;
      type: "incident.report" | "emergency.alert";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
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
    }
  | {
      id: string;
      type: "telemetry.batch";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
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
    }
  | {
      id: string;
      type: "notification.read";
      createdAt: string;
      retries: number;
      status: QueueStatus;
      payload: {
        notificationId: string;
      };
    };

export type QueueMeta = {
  lastSyncAt?: string;
  lastError?: string | null;
  syncInProgress: boolean;
};
