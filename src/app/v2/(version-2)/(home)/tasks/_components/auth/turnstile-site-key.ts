const publicEnv: { turnstileSiteKey: string | undefined } = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TASKS_TURNSTILE_SITE_KEY,
};

export function getTurnstileSiteKey() {
  return publicEnv.turnstileSiteKey || undefined;
}
