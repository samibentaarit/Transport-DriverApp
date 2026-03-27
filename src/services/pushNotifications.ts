import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { backend } from "@/services/backend";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function registerForPushNotifications() {
  if (Platform.OS === "web") {
    return null;
  }

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
}
