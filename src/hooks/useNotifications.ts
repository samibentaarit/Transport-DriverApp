import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { backend } from "@/services/backend";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => backend.fetchNotifications()
  });
}

