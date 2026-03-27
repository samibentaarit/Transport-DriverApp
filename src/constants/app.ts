export const APP_NAME = "School Transport Driver";

export const STORAGE_KEYS = {
  authSession: "driver.auth.session",
  authKey: "driver.auth.encryption-key",
  deviceId: "driver.device.id",
  tripCache: "driver.cache.trips",
  tripDetailCachePrefix: "driver.cache.trip",
  queue: "driver.offline.queue",
  queueMeta: "driver.offline.queue.meta"
} as const;

