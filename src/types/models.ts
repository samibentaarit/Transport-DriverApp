export type UserRole =
  | "super_admin"
  | "school_admin"
  | "dispatcher"
  | "driver"
  | "guardian";

export type ThemeMode = "system" | "light" | "dark";
export type AppLocale = "en" | "fr" | "ar";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  school_id?: string | null;
  active: boolean;
  last_login_at?: string | null;
  created_at?: string;
};

export type Driver = {
  id: string;
  user_id?: string;
  user?: User;
  license_number?: string | null;
  license_expiry?: string | null;
  active: boolean;
  notes?: string | null;
  created_at?: string;
};

export type Vehicle = {
  id: string;
  school_id?: string | null;
  name: string;
  license_plate?: string | null;
  vin?: string | null;
  capacity?: number | null;
  active: boolean;
  notes?: string | null;
  tracker?: {
    id?: string;
    [key: string]: unknown;
  } | null;
  created_at?: string;
};

export type Stop = {
  id: string;
  school_id?: string | null;
  name: string;
  lat: number;
  lng: number;
  safe_radius_m?: number | null;
  default_dwell_secs?: number | null;
  created_at?: string;
};

export type RouteStop = {
  id: string;
  route_id: string;
  stop_id: string;
  stop?: Stop;
  stop_order: number;
  earliest_time?: string | null;
  latest_time?: string | null;
  service_secs?: number | null;
};

export type RouteModel = {
  id: string;
  school_id?: string | null;
  name: string;
  description?: string | null;
  status?: string | null;
  version?: number | null;
  created_by?: string | null;
  stops?: RouteStop[];
  created_at?: string;
  updated_at?: string;
};

export type Student = {
  id: string;
  school_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  grade?: string | null;
  student_id?: string | null;
  active?: boolean;
  special_needs?: string | null;
  photo_url?: string | null;
};

export type StudentAssignmentStatus = "assigned" | "boarded" | "missed" | "dropped";

export type StudentAssignment = {
  id: string;
  trip_id: string;
  student_id: string;
  assigned_stop_id?: string | null;
  assigned_on?: string | null;
  status: StudentAssignmentStatus;
  boarding_time?: string | null;
  student?: Student;
};

export type TripStatus = "scheduled" | "enroute" | "completed" | "cancelled";

export type TripStopInstance = {
  id: string;
  trip_id: string;
  route_stop_id: string;
  route_stop?: RouteStop;
  planned_arrival?: string | null;
  planned_departure?: string | null;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  boarded_count?: number | null;
  notes?: string | null;
};

export type Trip = {
  id: string;
  route_id: string;
  vehicle_id?: string | null;
  driver_id?: string | null;
  date: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  status: TripStatus;
  published?: boolean;
  optimization_version?: number | null;
  version?: number | null;
  route?: RouteModel;
  vehicle?: Vehicle;
  driver?: Driver;
  stop_instances?: TripStopInstance[];
  student_assignments?: StudentAssignment[];
  created_at?: string;
};

export type TelemetryPoint = {
  tracker_id?: string;
  vehicle_id?: string;
  lat: number;
  lng: number;
  speed_kmh?: number | null;
  heading?: number | null;
  battery?: number | null;
  recorded_at: string;
};

export type TripLiveStatus = {
  trip: Trip;
  current_location: TelemetryPoint | null;
};

export type IncidentType =
  | "accident"
  | "breakdown"
  | "delay"
  | "behavior_issue"
  | "missed_student"
  | "safety_violation"
  | "other";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type Incident = {
  id: string;
  trip_id?: string | null;
  vehicle_id?: string | null;
  reported_by?: string | null;
  type: IncidentType;
  severity: IncidentSeverity;
  description?: string | null;
  images?: string[] | null;
  status?: string | null;
  reporter?: User;
  created_at?: string;
};

export type NotificationItem = {
  id: string;
  title?: string | null;
  body?: string | null;
  type?: string | null;
  channel?: string | null;
  data?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at?: string;
};

export type Message = {
  id: string;
  subject?: string | null;
  body: string;
  sender_name?: string | null;
  received_at: string;
  unread: boolean;
};

