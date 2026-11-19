import type { AppLocale } from "@tasks/_i18n/resources";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { authClient } from "@tasks/_lib/auth-client";
import { getBrowserLocale, resolveLocale } from "@tasks/_lib/i18n";

export function useLocale() {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const locale = useMemo(
    () => resolveLocale(i18n.resolvedLanguage, getBrowserLocale()),
    [i18n.resolvedLanguage],
  );

  const setLocale = async (nextLocale: AppLocale) => {
    const { error } = await authClient.updateUser({ locale: nextLocale });
    if (error) {
      throw new Error(error.message || "Failed to update locale");
    }

    const resolved = resolveLocale(nextLocale, null);
    document.documentElement.lang = resolved;
    await queryClient.invalidateQueries({ queryKey: ["session"] });
    await i18n.changeLanguage(resolved);
  };

  return {
    locale,
    setLocale,
  };
}
