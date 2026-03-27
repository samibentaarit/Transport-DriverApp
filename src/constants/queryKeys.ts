export const queryKeys = {
  me: ["me"] as const,
  todayTrips: ["today-trips"] as const,
  tripHistory: ["trip-history"] as const,
  tripDetail: (tripId: string) => ["trip-detail", tripId] as const,
  tripLive: (tripId: string) => ["trip-live", tripId] as const,
  notifications: ["notifications"] as const,
  messages: ["messages"] as const,
  queue: ["offline-queue"] as const
};

