import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { cacheTodayTrips, getCachedTodayTrips } from "@/offline/offlineCache";
import { backend } from "@/services/backend";
import { sortTripsByStart } from "@/utils/trips";

export function useTodayTrips() {
  return useQuery({
    queryKey: queryKeys.todayTrips,
    queryFn: async () => {
      try {
        const trips = sortTripsByStart(await backend.getTodayTrips());
        await cacheTodayTrips(trips);
        return trips;
      } catch (error) {
        const cached = await getCachedTodayTrips();
        if (cached?.length) {
          return sortTripsByStart(cached);
        }

        throw error;
      }
    }
  });
}

