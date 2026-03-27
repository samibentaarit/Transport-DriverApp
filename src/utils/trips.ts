import { StudentAssignment, Trip, TripStatus, TripStopInstance } from "@/types/models";

export function filterTripsForDriver(trips: Trip[], userId: string) {
  return trips.filter((trip) => trip.driver?.user?.id === userId || trip.driver?.user_id === userId);
}

export function boardedCount(assignments: StudentAssignment[] = []) {
  return assignments.filter((assignment) => assignment.status === "boarded").length;
}

export function expectedCount(assignments: StudentAssignment[] = []) {
  return assignments.length;
}

export function activeStop(stops: TripStopInstance[] = []) {
  return (
    stops.find((stop) => stop.actual_arrival && !stop.actual_departure) ||
    stops.find((stop) => !stop.actual_arrival) ||
    null
  );
}

export function remainingStops(stops: TripStopInstance[] = []) {
  return stops.filter((stop) => !stop.actual_departure).length;
}

export function deriveTripProgress(stops: TripStopInstance[] = []) {
  if (stops.length === 0) {
    return 0;
  }

  const completed = stops.filter((stop) => Boolean(stop.actual_departure)).length;
  return completed / stops.length;
}

export function studentsAtStop(assignments: StudentAssignment[] = [], stopId?: string | null) {
  return assignments.filter((assignment) => assignment.assigned_stop_id === stopId);
}

export function hasActiveTrip(trips: Trip[]) {
  return trips.some((trip) => trip.status === "enroute");
}

export function sortTripsByStart(trips: Trip[]) {
  return [...trips].sort((left, right) => {
    const leftTime = left.scheduled_start ? new Date(left.scheduled_start).getTime() : 0;
    const rightTime = right.scheduled_start ? new Date(right.scheduled_start).getTime() : 0;
    return leftTime - rightTime;
  });
}

export function isTripStatus(status: string): status is TripStatus {
  return ["scheduled", "enroute", "completed", "cancelled"].includes(status);
}

