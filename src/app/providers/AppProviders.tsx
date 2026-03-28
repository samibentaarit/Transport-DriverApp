import { PropsWithChildren, useMemo } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { darkTheme, lightTheme } from "@/constants/theme";
import { useSettingsStore } from "@/store/settingsStore";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1
    }
  }
});

export function AppProviders({ children }: PropsWithChildren) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const deviceTheme = useColorScheme();

  const navigationTheme = useMemo(() => {
    const effectiveTheme = themeMode === "system" ? deviceTheme : themeMode;
    return effectiveTheme === "dark" ? darkTheme : lightTheme;
  }, [deviceTheme, themeMode]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
