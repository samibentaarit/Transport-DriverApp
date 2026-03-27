import {
  Incident,
  Message,
  NotificationItem,
  StudentAssignment,
  Trip,
  TripLiveStatus,
  TripStatus,
  TripStopInstance,
  User
} from "@/types/models";
import { ResourceResponse } from "@/types/api";

function normalizeTripStatus(status: string | undefined): TripStatus {
  if (status === "in_progress") {
    return "enroute";
  }

  if (status === "scheduled" || status === "enroute" || status === "completed" || status === "cancelled") {
    return status;
  }

  return "scheduled";
}

export function normalizeUser(input: User): User {
  return input;
}

export function normalizeAssignment(input: StudentAssignment): StudentAssignment {
  return {
    ...input,
    status: input.status === "dropped" ? "dropped" : input.status
  };
}

export function normalizeStopInstance(input: TripStopInstance): TripStopInstance {
  return {
    ...input
  };
}

export function normalizeTrip(input: Trip): Trip {
  return {
    ...input,
    status: normalizeTripStatus(input.status),
    student_assignments: input.student_assignments?.map(normalizeAssignment),
    stop_instances: input.stop_instances?.map(normalizeStopInstance)
  };
}

export function normalizeLiveTrip(payload: ResourceResponse<TripLiveStatus>): TripLiveStatus {
  return {
    ...payload.data,
    trip: normalizeTrip(payload.data.trip)
  };
}

export function normalizeIncident(input: Incident): Incident {
  return input;
}

export function normalizeNotification(input: Record<string, unknown>): NotificationItem {
  return {
    id: String(input.id),
    title: typeof input.title === "string" ? input.title : typeof input.type === "string" ? input.type : "Notification",
    body: typeof input.body === "string" ? input.body : typeof input.message === "string" ? input.message : "",
    type: typeof input.type === "string" ? input.type : null,
    channel: typeof input.channel === "string" ? input.channel : null,
    data: typeof input.payload === "object" && input.payload ? (input.payload as Record<string, unknown>) : null,
    read_at: typeof input.read_at === "string" ? input.read_at : null,
    created_at: typeof input.created_at === "string" ? input.created_at : new Date().toISOString()
  };
}

export function normalizeMessage(input: Record<string, unknown>): Message {
  return {
    id: String(input.id),
    subject: typeof input.subject === "string" ? input.subject : null,
    body: typeof input.body === "string" ? input.body : typeof input.message === "string" ? input.message : "",
    sender_name: typeof input.sender_name === "string" ? input.sender_name : "Dispatcher",
    received_at: typeof input.received_at === "string" ? input.received_at : new Date().toISOString(),
    unread: Boolean(input.unread ?? true)
  };
}

