import { Platform } from "react-native";
import Constants from "expo-constants";

import { backend } from "@/services/backend";
import { env } from "@/services/env";

type NotificationsModule = typeof import("expo-notifications");

let notificationHandlerInitialized = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

export function canUseRemotePushNotifications() {
  return env.enableRemotePushNotifications && Platform.OS !== "web" && !isExpoGo;
}

async function ensureNotificationHandler() {
  if (!canUseRemotePushNotifications() || notificationHandlerInitialized) {
    return;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
      })
    });
    notificationHandlerInitialized = true;
  } catch (error) {
    console.warn("Notification handler disabled", error);
  }
}

export async function registerForPushNotifications() {
  if (!canUseRemotePushNotifications()) {
    return null;
  }

  try {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return null;
    }

    await ensureNotificationHandler();

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("operations", {
        name: "Operations",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 200, 100, 200]
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;
    if (existing.status !== "granted") {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await backend.registerPushToken(token);
    return token;
  } catch (error) {
    console.warn("Push registration skipped", error);
    return null;
  }
}
