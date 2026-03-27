import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/queryKeys";
import { backend } from "@/services/backend";

export function useMessages() {
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: () => backend.fetchMessages()
  });
}

