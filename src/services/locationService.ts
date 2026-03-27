import * as Location from "expo-location";

import { AppError } from "@/utils/errors";

export async function requestForegroundLocationPermission() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new AppError("Location permission is required to share trip telemetry.");
  }
}

export async function getCurrentCoordinates() {
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude
  };
}

export async function startLocationWatcher(onPoint: (location: Location.LocationObject) => void) {
  await requestForegroundLocationPermission();

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15_000,
      distanceInterval: 30
    },
    onPoint
  );
}

