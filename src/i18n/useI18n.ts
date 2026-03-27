import { useMemo } from "react";

import { translations } from "@/i18n/translations";
import { useSettingsStore } from "@/store/settingsStore";

export function useI18n() {
  const locale = useSettingsStore((state) => state.locale);

  return useMemo(
    () => ({
      locale,
      isRTL: locale === "ar",
      t: (key: string, fallback?: string) => translations[locale][key] ?? fallback ?? key
    }),
    [locale]
  );
}

