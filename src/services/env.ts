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
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost,
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost,
    (Constants as unknown as { manifest2?: { extra?: { expoClient?: { hostUri?: string } } } }).manifest2?.extra
      ?.expoClient?.hostUri
  ];

  for (const candidate of hostCandidates) {
    if (!candidate) {
      continue;
    }

    const [host] = candidate.split(":");
    if (host) {
      return host;
    }
  }

  return null;
}

function defaultApiUrl() {
  const host = inferExpoHost();
  return host ? `http://${host}:8000/api/v1` : "http://127.0.0.1:8000/api/v1";
}

function normalizeApiUrl(rawUrl: string) {
  const host = inferExpoHost();
  if (!host) {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
      url.hostname = host;
      return url.toString();
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

function normalizeHost(rawHost: string) {
  const host = inferExpoHost();
  if (!host) {
    return rawHost;
  }

  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(rawHost) ? host : rawHost;
}

function defaultBroadcastHost() {
  return inferExpoHost() ?? "127.0.0.1";
}

export const env = {
  apiUrl: normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl()).replace(/\/$/, ""),
  broadcastHost: normalizeHost(process.env.EXPO_PUBLIC_BROADCAST_HOST ?? defaultBroadcastHost()),
  broadcastPort: numberEnv(process.env.EXPO_PUBLIC_BROADCAST_PORT, 6001),
  broadcastScheme: process.env.EXPO_PUBLIC_BROADCAST_SCHEME ?? "http",
  broadcastKey: process.env.EXPO_PUBLIC_BROADCAST_KEY ?? "school-transport-key",
  mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "",
  mapboxStyleId: process.env.EXPO_PUBLIC_MAPBOX_STYLE_ID ?? "mapbox/streets-v12",
  useMocks: booleanEnv(process.env.EXPO_PUBLIC_USE_MOCKS, false),
  enableDeviceEnrollment: booleanEnv(process.env.EXPO_PUBLIC_ENABLE_DEVICE_ENROLLMENT, false),
  deviceEnrollmentPath: process.env.EXPO_PUBLIC_DEVICE_ENROLLMENT_PATH ?? "",
  messagesPath: process.env.EXPO_PUBLIC_MESSAGES_PATH ?? "",
  pushTokenPath: process.env.EXPO_PUBLIC_PUSH_TOKEN_PATH ?? "",
  enableRemotePushNotifications: booleanEnv(process.env.EXPO_PUBLIC_ENABLE_REMOTE_PUSH_NOTIFICATIONS, false),
  backgroundLocation: booleanEnv(process.env.EXPO_PUBLIC_BACKGROUND_LOCATION, false),
  defaultLocale: (process.env.EXPO_PUBLIC_DEFAULT_LOCALE as AppLocale | undefined) ?? "en",
  syncIntervalMs: numberEnv(process.env.EXPO_PUBLIC_SYNC_INTERVAL_MS, 15000)
} as const;

