import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";

import { AppScreen } from "@/components/AppScreen";
import { TripMap } from "@/components/map/TripMap";
import { Card } from "@/components/ui/Card";
import { useTripDetail } from "@/hooks/useTripDetail";

export default function LiveMapScreen() {
  const params = useLocalSearchParams<{ tripId: string }>();
  const { tripQuery, liveQuery } = useTripDetail(params.tripId);

  return (
    <AppScreen title="Live map" subtitle="Current vehicle position and stop sequence for the selected trip.">
      <TripMap live={liveQuery.data} />
      <Card>
        <Text>Route: {tripQuery.data?.route?.name ?? "Unknown route"}</Text>
        <Text>Stops: {tripQuery.data?.stop_instances?.length ?? 0}</Text>
        <Text>Tracking source: {tripQuery.data?.vehicle?.tracker?.id ?? "No tracker"}</Text>
      </Card>
    </AppScreen>
  );
}
