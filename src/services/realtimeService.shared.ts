export type RealtimeEventName =
  | "trip.status.updated"
  | "stop.arrived"
  | "stop.departed"
  | "boarding.recorded"
  | "incident.created";

export type RealtimeEvent = {
  name: RealtimeEventName;
  payload: Record<string, unknown>;
};

export type Unsubscribe = () => void;

export type RealtimeServiceContract = {
  subscribeToSchool: (schoolId: string, listener: (event: RealtimeEvent) => void) => Unsubscribe;
};
