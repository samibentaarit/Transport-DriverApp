import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { cacheTripDetail, getCachedTripDetail } from "@/offline/offlineCache";
import { backend } from "@/services/backend";

export function useTripDetail(tripId: string) {
  const tripQuery = useQuery({
    queryKey: queryKeys.tripDetail(tripId),
    queryFn: async () => {
      try {
        const trip = await backend.getTrip(tripId);
        await cacheTripDetail(trip);
        return trip;
      } catch (error) {
        const cached = await getCachedTripDetail(tripId);
        if (cached) {
          return cached;
        }

        throw error;
      }
    }
  });

  const liveQuery = useQuery({
    queryKey: queryKeys.tripLive(tripId),
    queryFn: () => backend.getTripLiveStatus(tripId),
    refetchInterval: 20_000
  });

  return {
    tripQuery,
    liveQuery
  };
}

