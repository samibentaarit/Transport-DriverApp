import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/providers/AppProviders";

export default function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trip/[tripId]" />
        <Stack.Screen name="stop/[stopId]" />
        <Stack.Screen name="map" />
        <Stack.Screen name="incident" options={{ presentation: "modal" }} />
        <Stack.Screen name="queue" options={{ presentation: "modal" }} />
      </Stack>
    </QueryClientProvider>
  );
}

