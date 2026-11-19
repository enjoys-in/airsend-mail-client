import { runtimeConfig } from "@tasks/_packages/libs/api-url";

const publicEnv: { turnstileSiteKey: string | undefined } = {
  turnstileSiteKey: runtimeConfig("TASKS_TURNSTILE_SITE_KEY"),
};

export function getTurnstileSiteKey() {
  return publicEnv.turnstileSiteKey || undefined;
}
