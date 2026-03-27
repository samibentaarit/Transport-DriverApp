import { AuthSession } from "@/types/api";
import { Message, NotificationItem, Trip, TripLiveStatus, User } from "@/types/models";

export const mockUser: User = {
  id: "driver-user-1",
  name: "Youssef Mansour",
  email: "driver@schooltransport.test",
  phone: "+21620000000",
  role: "driver",
  school_id: "school-1",
  active: true,
  last_login_at: new Date().toISOString()
};

export const mockTrips: Trip[] = [
  {
    id: "trip-1",
    route_id: "route-1",
    vehicle_id: "bus-1",
    driver_id: "driver-1",
    date: new Date().toISOString().slice(0, 10),
    scheduled_start: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    scheduled_end: new Date(Date.now() + 100 * 60 * 1000).toISOString(),
    status: "scheduled",
    route: {
      id: "route-1",
      school_id: "school-1",
      name: "Morning North Line",
      description: "Campus pickup loop",
      status: "active",
      version: 3,
      stops: [
        {
          id: "route-stop-1",
          route_id: "route-1",
          stop_id: "stop-1",
          stop_order: 1,
          stop: {
            id: "stop-1",
            name: "Palm Residence",
            lat: 36.8065,
            lng: 10.1815,
            safe_radius_m: 80
          }
        },
        {
          id: "route-stop-2",
          route_id: "route-1",
          stop_id: "stop-2",
          stop_order: 2,
          stop: {
            id: "stop-2",
            name: "Avenue School Gate",
            lat: 36.8111,
            lng: 10.1888,
            safe_radius_m: 100
          }
        }
      ]
    },
    vehicle: {
      id: "bus-1",
      name: "Bus 12",
      license_plate: "209 TN 145",
      capacity: 28,
      active: true,
      tracker: {
        id: "tracker-1"
      }
    },
    driver: {
      id: "driver-1",
      user_id: "driver-user-1",
      active: true,
      license_number: "DL-1001",
      user: mockUser
    },
    stop_instances: [
      {
        id: "stop-instance-1",
        trip_id: "trip-1",
        route_stop_id: "route-stop-1",
        planned_arrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        planned_departure: new Date(Date.now() + 17 * 60 * 1000).toISOString(),
        boarded_count: 0,
        route_stop: {
          id: "route-stop-1",
          route_id: "route-1",
          stop_id: "stop-1",
          stop_order: 1,
          stop: {
            id: "stop-1",
            name: "Palm Residence",
            lat: 36.8065,
            lng: 10.1815,
            safe_radius_m: 80
          }
        }
      },
      {
        id: "stop-instance-2",
        trip_id: "trip-1",
        route_stop_id: "route-stop-2",
        planned_arrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        planned_departure: new Date(Date.now() + 48 * 60 * 1000).toISOString(),
        boarded_count: 0,
        route_stop: {
          id: "route-stop-2",
          route_id: "route-1",
          stop_id: "stop-2",
          stop_order: 2,
          stop: {
            id: "stop-2",
            name: "Avenue School Gate",
            lat: 36.8111,
            lng: 10.1888,
            safe_radius_m: 100
          }
        }
      }
    ],
    student_assignments: [
      {
        id: "assignment-1",
        trip_id: "trip-1",
        student_id: "student-1",
        assigned_stop_id: "stop-instance-1",
        status: "assigned",
        student: {
          id: "student-1",
          first_name: "Aya",
          last_name: "Ben Salem",
          full_name: "Aya Ben Salem",
          grade: "5"
        }
      },
      {
        id: "assignment-2",
        trip_id: "trip-1",
        student_id: "student-2",
        assigned_stop_id: "stop-instance-1",
        status: "assigned",
        student: {
          id: "student-2",
          first_name: "Omar",
          last_name: "Trabelsi",
          full_name: "Omar Trabelsi",
          grade: "6"
        }
      }
    ]
  }
];

export const mockTripLiveStatus: TripLiveStatus = {
  trip: mockTrips[0],
  current_location: {
    tracker_id: "tracker-1",
    lat: 36.8047,
    lng: 10.1793,
    speed_kmh: 28,
    heading: 31,
    recorded_at: new Date().toISOString()
  }
};

export const mockNotifications: NotificationItem[] = [
  {
    id: "notification-1",
    title: "Route adjusted",
    body: "Dispatcher moved stop order for the first pickup.",
    type: "route_changed",
    channel: "push",
    read_at: null,
    created_at: new Date().toISOString()
  }
];

export const mockMessages: Message[] = [
  {
    id: "message-1",
    subject: "Gate congestion",
    body: "Use the east gate this morning. Security is redirecting buses.",
    sender_name: "Dispatcher",
    received_at: new Date().toISOString(),
    unread: true
  }
];

export const mockSession: AuthSession = {
  accessToken: "mock-token",
  tokenType: "Bearer",
  user: mockUser
};

