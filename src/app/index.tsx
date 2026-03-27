import { Redirect } from "expo-router";

import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const status = useAuthStore((state) => state.status);
  return <Redirect href={status === "authenticated" ? "/(app)/(tabs)/today" : "/(auth)/login"} />;
}

