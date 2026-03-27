import { activeStop, boardedCount, deriveTripProgress } from "@/utils/trips";

describe("trip selectors", () => {
  it("returns the first incomplete stop as active", () => {
    const stop = activeStop([
      {
        id: "1",
        trip_id: "trip",
        route_stop_id: "a",
        actual_arrival: "2026-03-26T08:00:00.000Z",
        actual_departure: "2026-03-26T08:05:00.000Z"
      },
      {
        id: "2",
        trip_id: "trip",
        route_stop_id: "b"
      }
    ]);

    expect(stop?.id).toBe("2");
  });

  it("counts boarded students", () => {
    expect(
      boardedCount([
        { id: "1", trip_id: "trip", student_id: "a", status: "assigned" },
        { id: "2", trip_id: "trip", student_id: "b", status: "boarded" }
      ])
    ).toBe(1);
  });

  it("derives progress from departed stops", () => {
    expect(
      deriveTripProgress([
        { id: "1", trip_id: "trip", route_stop_id: "a", actual_departure: "2026-03-26T08:00:00.000Z" },
        { id: "2", trip_id: "trip", route_stop_id: "b" }
      ])
    ).toBe(0.5);
  });
});

