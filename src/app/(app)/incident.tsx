import { Alert, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";

import { AppScreen } from "@/components/AppScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { useQueueStore } from "@/offline/queueStore";
import { backend } from "@/services/backend";
import { getCurrentCoordinates } from "@/services/locationService";
import { useNetworkStore } from "@/store/networkStore";
import { createId } from "@/utils/ids";

const incidentSchema = z.object({
  type: z.enum(["delay", "breakdown", "other", "safety_violation", "behavior_issue", "missed_student", "accident"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(4)
});

type IncidentForm = z.infer<typeof incidentSchema>;

const incidentTypes: IncidentForm["type"][] = [
  "delay",
  "breakdown",
  "accident",
  "behavior_issue",
  "safety_violation",
  "missed_student",
  "other"
];
const severities: IncidentForm["severity"][] = ["low", "medium", "high", "critical"];

export default function IncidentScreen() {
  const params = useLocalSearchParams<{ tripId?: string; vehicleId?: string }>();
  const enqueue = useQueueStore((state) => state.enqueue);
  const isOnline = useNetworkStore((state) => state.isOnline && state.isReachable);
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<IncidentForm>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      type: "delay",
      severity: "medium",
      description: ""
    }
  });
  const [photo, setPhoto] = useState<{ uri: string; fileName?: string | null; mimeType?: string | null } | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const coords = await getCurrentCoordinates().catch(() => undefined);
      const payload = {
        tripId: params.tripId,
        vehicleId: params.vehicleId,
        ...values,
        lat: coords?.lat,
        lng: coords?.lng,
        images: photo ? [photo] : undefined
      };

      if (isOnline) {
        await backend.submitIncident(payload);
      } else {
        await enqueue({
          id: createId(),
          type: "incident.report",
          status: "pending",
          retries: 0,
          createdAt: new Date().toISOString(),
          payload
        });
      }

      router.back();
    } catch (error) {
      Alert.alert("Incident failed", error instanceof Error ? error.message : "Unable to submit incident.");
    }
  });

  return (
    <AppScreen title="Report incident" subtitle="The submission is queued automatically if connectivity drops.">
      <Card style={styles.card}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {incidentTypes.map((type) => (
            <Button
              key={type}
              label={type}
              variant={watch("type") === type ? "primary" : "ghost"}
              onPress={() => setValue("type", type)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>Severity</Text>
        <View style={styles.chipRow}>
          {severities.map((severity) => (
            <Button
              key={severity}
              label={severity}
              variant={watch("severity") === severity ? "danger" : "ghost"}
              onPress={() => setValue("severity", severity)}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <InputField
              label="Description"
              value={field.value}
              onChangeText={field.onChange}
              multiline
              error={errors.description?.message}
            />
          )}
        />
        <Button
          label={photo ? "Replace photo" : "Attach photo"}
          variant="secondary"
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.8,
              allowsEditing: true
            });
            if (!result.canceled && result.assets[0]) {
              setPhoto({
                uri: result.assets[0].uri,
                fileName: result.assets[0].fileName,
                mimeType: result.assets[0].mimeType
              });
            }
          }}
        />
        {photo ? <Text style={styles.photoText}>{photo.fileName ?? photo.uri}</Text> : null}
        <Button label="Submit incident" onPress={onSubmit} loading={isSubmitting} />
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14
  },
  chipRow: {
    gap: 10
  },
  label: {
    fontSize: 15,
    fontWeight: "800"
  },
  photoText: {
    fontSize: 13
  }
});
