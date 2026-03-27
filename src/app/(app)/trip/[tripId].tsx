import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AppScreen } from "@/components/AppScreen";
import { TripMap } from "@/components/map/TripMap";
import { EmergencyModal } from "@/components/modals/EmergencyModal";
import { LargeActionGrid } from "@/components/trip/LargeActionGrid";
import { StopRow } from "@/components/trip/StopRow";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/constants/queryKeys";
import { palette } from "@/constants/theme";
import { useTripDetail } from "@/hooks/useTripDetail";
import { useTripRealtime } from "@/hooks/useTripRealtime";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { useQueueStore } from "@/offline/queueStore";
import { backend } from "@/services/backend";
import { useNetworkStore } from "@/store/networkStore";
import { useTripStore } from "@/store/tripStore";
import { QueueItem } from "@/types/queue";
import { boardedCount, deriveTripProgress, expectedCount, activeStop, studentsAtStop } from "@/utils/trips";
import { formatClock, minutesBetween } from "@/utils/dates";
import { createId } from "@/utils/ids";
import { tripStatusTone } from "@/utils/format";
import { getCurrentCoordinates } from "@/services/locationService";

export default function ActiveTripScreen() {
  const params = useLocalSearchParams<{ tripId: string }>();
  const tripId = params.tripId;
  const queryClient = useQueryClient();
  const enqueue = useQueueStore((state) => state.enqueue);
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);
  const setActiveTrip = useTripStore((state) => state.setActiveTrip);
  const { tripQuery, liveQuery } = useTripDetail(tripId);
  const [emergencyVisible, setEmergencyVisible] = useState(false);

  useTripRealtime(tripId);
  useLocationSharing({
    tripId,
    vehicleId: tripQuery.data?.vehicle_id,
    status: tripQuery.data?.status
  });

  useEffect(() => {
    setActiveTrip(tripId);
    return () => setActiveTrip(undefined);
  }, [setActiveTrip, tripId]);

  const trip = tripQuery.data;
  const live = liveQuery.data;
  const nextStop = useMemo(() => activeStop(trip?.stop_instances), [trip?.stop_instances]);

  const performOrQueue = async (item: QueueItem, onlineAction: () => Promise<void>) => {
    try {
      if (isOnline) {
        await onlineAction();
      } else {
        await enqueue(item);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tripDetail(tripId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tripLive(tripId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.todayTrips })
      ]);
    } catch (error) {
      Alert.alert("Action failed", error instanceof Error ? error.message : "Unable to complete action.");
    }
  };

  if (!trip) {
    return <AppScreen title="Trip" subtitle="Loading trip details..." />;
  }

  const boarded = boardedCount(trip.student_assignments);
  const expected = expectedCount(trip.student_assignments);
  const nextStopStudents = studentsAtStop(trip.student_assignments, nextStop?.id).length;
  const approxEta =
    nextStop?.planned_arrival && live?.current_location?.recorded_at
      ? minutesBetween(live.current_location.recorded_at, nextStop.planned_arrival)
      : null;

  return (
    <AppScreen
      title={trip.route?.name ?? "Active trip"}
      subtitle={`${trip.vehicle?.name ?? "Vehicle"} | ${trip.vehicle?.license_plate ?? "No plate"}`}
      rightAction={<Button label="Queue" variant="ghost" onPress={() => router.push("/(app)/queue")} />}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Trip status</Text>
            <Badge label={trip.status} tone={tripStatusTone(trip.status)} />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.heroLabel}>Boarded</Text>
            <Text style={styles.heroValue}>
              {boarded}/{expected}
            </Text>
          </View>
        </View>
        <Text style={styles.nextStopTitle}>{nextStop?.route_stop?.stop?.name ?? "Awaiting next stop"}</Text>
        <Text style={styles.nextStopMeta}>
          Planned {formatClock(nextStop?.planned_arrival)} | Approx ETA {approxEta != null ? `${approxEta} min` : "n/a"}
        </Text>
        <ProgressBar progress={deriveTripProgress(trip.stop_instances)} />
        <Text style={styles.tripMeta}>
          Remaining stops: {trip.stop_instances?.filter((stop) => !stop.actual_departure).length ?? 0} | Current speed:{" "}
          {Math.round(live?.current_location?.speed_kmh ?? 0)} km/h
        </Text>
      </Card>

      <TripMap live={live} />

      <LargeActionGrid
        primary={[
          {
            label: "Start trip",
            onPress: () =>
              performOrQueue(
                {
                  id: createId(),
                  type: "trip.start",
                  status: "pending",
                  retries: 0,
                  createdAt: new Date().toISOString(),
                  payload: { tripId }
                },
                () => backend.startTrip(tripId).then(() => undefined)
              ),
            disabled: trip.status !== "scheduled"
          },
          {
            label: "Arrive at stop",
            onPress: () =>
              nextStop &&
              performOrQueue(
                {
                  id: createId(),
                  type: "stop.arrive",
                  status: "pending",
                  retries: 0,
                  createdAt: new Date().toISOString(),
                  payload: { tripId, stopInstanceId: nextStop.id }
                },
                () => backend.arriveStop(tripId, nextStop.id)
              ),
            disabled: trip.status !== "enroute" || !nextStop || Boolean(nextStop.actual_arrival)
          },
          {
            label: "Depart stop",
            onPress: () =>
              nextStop &&
              performOrQueue(
                {
                  id: createId(),
                  type: "stop.depart",
                  status: "pending",
                  retries: 0,
                  createdAt: new Date().toISOString(),
                  payload: { tripId, stopInstanceId: nextStop.id }
                },
                () => backend.departStop(tripId, nextStop.id)
              ),
            disabled: trip.status !== "enroute" || !nextStop || !nextStop.actual_arrival || Boolean(nextStop.actual_departure)
          },
          {
            label: "Students",
            onPress: () =>
              nextStop ? router.push({ pathname: "/(app)/stop/[stopId]", params: { stopId: nextStop.id, tripId } }) : undefined,
            variant: "secondary",
            disabled: !nextStop || nextStopStudents === 0
          },
          {
            label: "End trip",
            onPress: () =>
              performOrQueue(
                {
                  id: createId(),
                  type: "trip.end",
                  status: "pending",
                  retries: 0,
                  createdAt: new Date().toISOString(),
                  payload: { tripId }
                },
                () => backend.endTrip(tripId).then(() => undefined)
              ),
            variant: "secondary",
            disabled: trip.status !== "enroute"
          },
          {
            label: "Emergency",
            onPress: () => setEmergencyVisible(true),
            variant: "danger"
          }
        ]}
        secondary={[
          {
            label: "Report incident",
            onPress: () => router.push({ pathname: "/(app)/incident", params: { tripId, vehicleId: trip.vehicle_id } })
          },
          {
            label: "Full map",
            onPress: () => router.push({ pathname: "/(app)/map", params: { tripId } })
          }
        ]}
      />

      <Card>
        <Text style={styles.sectionTitle}>Stops</Text>
        <View style={styles.stopList}>
          {trip.stop_instances?.map((stop) => (
            <StopRow
              key={stop.id}
              stop={stop}
              expectedStudents={studentsAtStop(trip.student_assignments, stop.id).length}
              onPress={() => router.push({ pathname: "/(app)/stop/[stopId]", params: { stopId: stop.id, tripId } })}
            />
          ))}
        </View>
      </Card>

      <EmergencyModal
        visible={emergencyVisible}
        onCancel={() => setEmergencyVisible(false)}
        onConfirm={async () => {
          try {
            const location = await getCurrentCoordinates().catch(() => undefined);
            if (isOnline) {
              await backend.sendEmergencyAlert({
                tripId,
                vehicleId: trip.vehicle_id ?? undefined,
                description: "Emergency alert triggered from the active trip screen.",
                lat: location?.lat,
                lng: location?.lng
              });
            } else {
              await enqueue({
                id: createId(),
                type: "emergency.alert",
                status: "pending",
                retries: 0,
                createdAt: new Date().toISOString(),
                payload: {
                  tripId,
                  vehicleId: trip.vehicle_id ?? undefined,
                  type: "safety_violation",
                  severity: "critical",
                  description: "Emergency alert triggered from the active trip screen.",
                  lat: location?.lat,
                  lng: location?.lng
                }
              });
            }

            setEmergencyVisible(false);
            Alert.alert("Emergency alert sent", "Dispatch has been notified.");
          } catch (error) {
            Alert.alert("Emergency alert failed", error instanceof Error ? error.message : "Unable to send alert.");
          }
        }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 14
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroLabel: {
    fontSize: 12,
    color: palette.slate,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  heroValue: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink
  },
  nextStopTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink
  },
  nextStopMeta: {
    fontSize: 14,
    color: palette.slate
  },
  tripMeta: {
    fontSize: 13,
    color: palette.slate
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.ink,
    marginBottom: 12
  },
  stopList: {
    gap: 12
  }
});
