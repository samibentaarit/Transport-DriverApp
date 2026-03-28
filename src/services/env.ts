import { AppLocale } from "@/types/models";
import Constants from "expo-constants";

function booleanEnv(value: string | undefined, fallback: boolean) {
  if (value == null) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function numberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function inferExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }

  const [host] = hostUri.split(":");
  return host || null;
}

function defaultApiUrl() {
  const host = inferExpoHost();
  return host ? `http://${host}:8000/api/v1` : "http://127.0.0.1:8000/api/v1";
}

function defaultBroadcastHost() {
  return inferExpoHost() ?? "127.0.0.1";
}

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl(),
  broadcastHost: process.env.EXPO_PUBLIC_BROADCAST_HOST ?? defaultBroadcastHost(),
  broadcastPort: numberEnv(process.env.EXPO_PUBLIC_BROADCAST_PORT, 6001),
  broadcastScheme: process.env.EXPO_PUBLIC_BROADCAST_SCHEME ?? "http",
  broadcastKey: process.env.EXPO_PUBLIC_BROADCAST_KEY ?? "school-transport-key",
  useMocks: booleanEnv(process.env.EXPO_PUBLIC_USE_MOCKS, false),
  enableDeviceEnrollment: booleanEnv(process.env.EXPO_PUBLIC_ENABLE_DEVICE_ENROLLMENT, false),
  deviceEnrollmentPath: process.env.EXPO_PUBLIC_DEVICE_ENROLLMENT_PATH ?? "",
  messagesPath: process.env.EXPO_PUBLIC_MESSAGES_PATH ?? "",
  pushTokenPath: process.env.EXPO_PUBLIC_PUSH_TOKEN_PATH ?? "",
  backgroundLocation: booleanEnv(process.env.EXPO_PUBLIC_BACKGROUND_LOCATION, false),
  defaultLocale: (process.env.EXPO_PUBLIC_DEFAULT_LOCALE as AppLocale | undefined) ?? "en",
  syncIntervalMs: numberEnv(process.env.EXPO_PUBLIC_SYNC_INTERVAL_MS, 15000)
} as const;

