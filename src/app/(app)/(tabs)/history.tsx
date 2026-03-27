import { ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { AppScreen } from "@/components/AppScreen";
import { TripCard } from "@/components/trip/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { backend } from "@/services/backend";

export default function HistoryScreen() {
  const historyQuery = useQuery({
    queryKey: ["trip-history"],
    queryFn: () => backend.getTripHistory()
  });

  return (
    <AppScreen title="Trip history" subtitle="Completed and scheduled work from the driver account.">
      {historyQuery.isLoading ? <ActivityIndicator /> : null}
      {historyQuery.data?.map((trip) => (
        <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/(app)/trip/${trip.id}`)} />
      ))}
      {!historyQuery.isLoading && !historyQuery.data?.length ? (
        <EmptyState title="No trip history" description="Past trips will appear here once the backend has assignment records for this driver." />
      ) : null}
    </AppScreen>
  );
}

