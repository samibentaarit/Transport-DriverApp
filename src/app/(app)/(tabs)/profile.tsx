import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import Constants from "expo-constants";

import { AppScreen } from "@/components/AppScreen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { backend } from "@/services/backend";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { router } from "expo-router";

export default function ProfileScreen() {
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const locationSharingEnabled = useSettingsStore((state) => state.locationSharingEnabled);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const enableBiometricUnlock = useSettingsStore((state) => state.enableBiometricUnlock);
  const setLocationSharingEnabled = useSettingsStore((state) => state.setLocationSharingEnabled);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const setEnableBiometricUnlock = useSettingsStore((state) => state.setEnableBiometricUnlock);

  return (
    <AppScreen title="Profile & settings" subtitle="Driver-only settings, secure session controls, and device status.">
      <Card style={styles.card}>
        <Text style={styles.name}>{session?.user.name}</Text>
        <Text style={styles.meta}>{session?.user.email}</Text>
        <Text style={styles.meta}>Role: {session?.user.role}</Text>
        <Text style={styles.meta}>App version: {Constants.expoConfig?.version ?? "1.0.0"}</Text>
      </Card>

      <Card style={styles.card}>
        <SettingsRow label="Location sharing" value={locationSharingEnabled} onValueChange={setLocationSharingEnabled} />
        <SettingsRow label="Notifications" value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        <SettingsRow label="Biometric unlock" value={enableBiometricUnlock} onValueChange={setEnableBiometricUnlock} />
      </Card>

      <Button
        label="Log out"
        variant="danger"
        onPress={async () => {
          try {
            await backend.logout();
          } catch {
            // Ignore logout transport issues and clear the local session anyway.
          }
          await signOut();
          router.replace("/(auth)/login");
        }}
      />

      <Button
        label="Queue review"
        variant="secondary"
        onPress={() => router.push("/(app)/queue")}
      />
    </AppScreen>
  );
}

function SettingsRow({
  label,
  value,
  onValueChange
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(next) => {
          try {
            onValueChange(next);
          } catch (error) {
            Alert.alert("Update failed", error instanceof Error ? error.message : "Could not update setting.");
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14
  },
  name: {
    fontSize: 24,
    fontWeight: "800"
  },
  meta: {
    fontSize: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600"
  }
});
