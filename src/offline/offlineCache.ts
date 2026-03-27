import { STORAGE_KEYS } from "@/constants/app";
import { getEncryptedJson, setEncryptedJson } from "@/services/encryptedStorage";
import { Trip } from "@/types/models";

export async function cacheTodayTrips(trips: Trip[]) {
  await setEncryptedJson(STORAGE_KEYS.tripCache, trips);
}

export async function getCachedTodayTrips() {
  return getEncryptedJson<Trip[]>(STORAGE_KEYS.tripCache);
}

export async function cacheTripDetail(trip: Trip) {
  await setEncryptedJson(`${STORAGE_KEYS.tripDetailCachePrefix}.${trip.id}`, trip);
}

export async function getCachedTripDetail(tripId: string) {
  return getEncryptedJson<Trip>(`${STORAGE_KEYS.tripDetailCachePrefix}.${tripId}`);
}

