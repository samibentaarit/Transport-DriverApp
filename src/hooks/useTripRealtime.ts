import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { realtimeService } from "@/services/realtimeService";
import { useAuthStore } from "@/store/authStore";

export function useTripRealtime(tripId?: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.session?.user);

  useEffect(() => {
    if (!user?.school_id) {
      return;
    }

    const unsubscribe = realtimeService.subscribeToSchool(user.school_id, ({ payload }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todayTrips });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });

      const payloadTripId = typeof payload.trip_id === "string" ? payload.trip_id : tripId;
      if (payloadTripId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.tripDetail(payloadTripId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.tripLive(payloadTripId) });
      }
    });

    return unsubscribe;
  }, [queryClient, tripId, user?.school_id]);
}

