import { ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { AppScreen } from "@/components/AppScreen";
import { TripCard } from "@/components/trip/TripCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";
import { useTodayTrips } from "@/hooks/useTodayTrips";

export default function TodayTripsScreen() {
  const { t } = useI18n();
  const tripsQuery = useTodayTrips();

  return (
    <AppScreen
      title={t("todayTrips")}
      subtitle="Tap a trip to enter the large-button execution view."
      rightAction={<Button label="Queue" variant="ghost" onPress={() => router.push("/(app)/queue")} />}
    >
      {tripsQuery.isLoading ? <ActivityIndicator /> : null}
      {tripsQuery.data?.map((trip) => (
        <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/(app)/trip/${trip.id}`)} />
      ))}
      {!tripsQuery.isLoading && !tripsQuery.data?.length ? (
        <EmptyState title={t("noTrips")} description="When the backend assigns a driver trip, it will appear here with vehicle and route details." />
      ) : null}
    </AppScreen>
  );
}

