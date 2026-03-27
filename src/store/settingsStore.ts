import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { createJSONStorage, persist } from "@/services/zustandMiddleware";
import { env } from "@/services/env";
import { AppLocale, ThemeMode } from "@/types/models";

type SettingsState = {
  themeMode: ThemeMode;
  locale: AppLocale;
  locationSharingEnabled: boolean;
  notificationsEnabled: boolean;
  enableBiometricUnlock: boolean;
  setThemeMode: (value: ThemeMode) => void;
  setLocale: (value: AppLocale) => void;
  setLocationSharingEnabled: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setEnableBiometricUnlock: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: "system",
      locale: env.defaultLocale,
      locationSharingEnabled: true,
      notificationsEnabled: true,
      enableBiometricUnlock: false,
      setThemeMode(themeMode) {
        set({ themeMode });
      },
      setLocale(locale) {
        set({ locale });
      },
      setLocationSharingEnabled(locationSharingEnabled) {
        set({ locationSharingEnabled });
      },
      setNotificationsEnabled(notificationsEnabled) {
        set({ notificationsEnabled });
      },
      setEnableBiometricUnlock(enableBiometricUnlock) {
        set({ enableBiometricUnlock });
      }
    }),
    {
      name: "driver.settings",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
