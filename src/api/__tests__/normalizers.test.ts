import { normalizeLiveTrip, normalizeNotification, normalizeTrip } from "@/api/normalizers";

describe("normalizers", () => {
  it("maps in_progress trips to enroute", () => {
    const trip = normalizeTrip({
      id: "trip-1",
      route_id: "route-1",
      date: "2026-03-26",
      status: "in_progress" as never
    });

    expect(trip.status).toBe("enroute");
  });

  it("normalizes notification bodies", () => {
    const notification = normalizeNotification({
      id: "notification-1",
      message: "Trip updated",
      type: "trip_status"
    });

    expect(notification.body).toBe("Trip updated");
    expect(notification.title).toBe("trip_status");
  });

  it("normalizes live trip resources", () => {
    const live = normalizeLiveTrip({
      data: {
        trip: {
          id: "trip-1",
          route_id: "route-1",
          date: "2026-03-26",
          status: "in_progress" as never
        },
        current_location: null
      }
    });

    expect(live.trip.status).toBe("enroute");
  });
});

