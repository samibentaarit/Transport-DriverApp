import { Alert, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AppScreen } from "@/components/AppScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { backend } from "@/services/backend";
import { env } from "@/services/env";
import { useAuthStore } from "@/store/authStore";

const enrollmentSchema = z.object({
  code: z.string().min(3)
});

type EnrollmentForm = z.infer<typeof enrollmentSchema>;

export default function EnrollmentScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [permission, requestPermission] = useCameraPermissions();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      code: ""
    }
  });

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      const session = await backend.enrollDevice({ code });
      await setSession(session);
      router.replace("/(app)/(tabs)/today");
    } catch (error) {
      Alert.alert("Enrollment failed", error instanceof Error ? error.message : "Unable to enroll device.");
    }
  });

  return (
    <AppScreen title="Device enrollment" subtitle="Pair this phone with an approved driver profile using the backend-issued QR token.">
      {!env.enableDeviceEnrollment ? (
        <Card>
          <Text>Device enrollment is disabled. Ask your backend team to configure `EXPO_PUBLIC_DEVICE_ENROLLMENT_PATH`.</Text>
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <InputField
                  label="Enrollment code"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.code?.message}
                />
              )}
            />
            <Button label="Complete enrollment" onPress={onSubmit} loading={isSubmitting} />
          </Card>

          <Card style={styles.card}>
            <Button
              label="Enable QR scanner"
              variant="secondary"
              onPress={async () => {
                if (!permission?.granted) {
                  await requestPermission();
                }
              }}
            />
            {permission?.granted ? (
              <View style={styles.scannerFrame}>
                <CameraView
                  style={styles.scanner}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={(event) => {
                    setValue("code", event.data, {
                      shouldValidate: true
                    });
                  }}
                />
              </View>
            ) : null}
          </Card>
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14
  },
  scannerFrame: {
    borderRadius: 20,
    overflow: "hidden"
  },
  scanner: {
    height: 260
  }
});

