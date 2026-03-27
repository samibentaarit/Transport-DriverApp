import { Alert, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useQueryClient } from "@tanstack/react-query";

import { AppScreen } from "@/components/AppScreen";
import { StudentRow } from "@/components/trip/StudentRow";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/constants/queryKeys";
import { useTripDetail } from "@/hooks/useTripDetail";
import { useQueueStore } from "@/offline/queueStore";
import { backend } from "@/services/backend";
import { useNetworkStore } from "@/store/networkStore";
import { studentsAtStop } from "@/utils/trips";
import { createId } from "@/utils/ids";

export default function StopDetailScreen() {
  const params = useLocalSearchParams<{ stopId: string; tripId: string }>();
  const tripId = params.tripId;
  const stopId = params.stopId;
  const queryClient = useQueryClient();
  const enqueue = useQueueStore((state) => state.enqueue);
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const { tripQuery } = useTripDetail(tripId);

  const stop = useMemo(() => tripQuery.data?.stop_instances?.find((item) => item.id === stopId), [stopId, tripQuery.data?.stop_instances]);
  const stopStudents = useMemo(() => studentsAtStop(tripQuery.data?.student_assignments, stopId), [stopId, tripQuery.data?.student_assignments]);

  const refreshTrip = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tripDetail(tripId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tripLive(tripId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.todayTrips })
    ]);
  };

  const handleStudentAction = async (studentId: string, action: "board" | "alight" | "missed") => {
    try {
      const timestamp = new Date().toISOString();
      if (isOnline && action !== "missed") {
        await backend.recordBoarding({
          tripId,
          stopInstanceId: stopId,
          studentId,
          action,
          method: "manual",
          timestamp
        });
      } else if (isOnline && action === "missed") {
        await backend.submitIncident({
          tripId,
          type: "missed_student",
          severity: "medium",
          description: `Student ${studentId} was marked as missed at stop ${stop?.route_stop?.stop?.name ?? stopId}.`
        });
      } else {
        await enqueue({
          id: createId(),
          type: "boarding.record",
          status: "pending",
          retries: 0,
          createdAt: timestamp,
          payload: {
            tripId,
            stopInstanceId: stopId,
            studentId,
            action,
            method: "manual",
            timestamp
          }
        });
      }

      await refreshTrip();
    } catch (error) {
      Alert.alert("Student update failed", error instanceof Error ? error.message : "Unable to update student.");
    }
  };

  return (
    <AppScreen title={stop?.route_stop?.stop?.name ?? "Stop detail"} subtitle="Boarding and drop-off controls for the active stop.">
      <Card style={styles.card}>
        <Text style={styles.meta}>Expected students: {stopStudents.length}</Text>
        <Text style={styles.meta}>Boarded count: {stop?.boarded_count ?? 0}</Text>
        <Button
          label={showScanner ? "Hide scanner" : "Scan QR"}
          variant="secondary"
          onPress={async () => {
            if (!showScanner && !permission?.granted) {
              await requestPermission();
            }
            setShowScanner((value) => !value);
          }}
        />
      </Card>

      {showScanner && permission?.granted ? (
        <Card style={styles.card}>
          <View style={styles.cameraFrame}>
            <CameraView
              style={styles.camera}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={(event) => {
                const student = stopStudents.find((item) => item.student_id === event.data);
                if (student) {
                  void handleStudentAction(student.student_id, "board");
                } else {
                  Alert.alert("Unknown QR code", "No assigned student matches this QR payload.");
                }
              }}
            />
          </View>
        </Card>
      ) : null}

      <View style={styles.list}>
        {stopStudents.map((assignment) => (
          <StudentRow
            key={assignment.id}
            assignment={assignment}
            onBoard={() => handleStudentAction(assignment.student_id, "board")}
            onDropOff={() => handleStudentAction(assignment.student_id, "alight")}
            onMissed={() => handleStudentAction(assignment.student_id, "missed")}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12
  },
  meta: {
    fontSize: 15
  },
  cameraFrame: {
    borderRadius: 20,
    overflow: "hidden"
  },
  camera: {
    height: 240
  },
  list: {
    gap: 12
  }
});

