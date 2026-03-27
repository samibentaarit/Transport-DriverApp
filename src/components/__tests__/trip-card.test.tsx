import { render } from "@testing-library/react-native";

import { TripCard } from "@/components/trip/TripCard";

describe("TripCard", () => {
  it("renders the route and vehicle summary", () => {
    const screen = render(
      <TripCard
        trip={{
          id: "trip-1",
          route_id: "route-1",
          date: "2026-03-26",
          status: "scheduled",
          route: {
            id: "route-1",
            name: "Morning North Line"
          },
          vehicle: {
            id: "bus-1",
            name: "Bus 12",
            license_plate: "209 TN 145",
            active: true
          }
        }}
        onPress={() => undefined}
      />
    );

    expect(screen.getByText("Morning North Line")).toBeTruthy();
    expect(screen.getByText("Bus 12 | 209 TN 145")).toBeTruthy();
  });
});
