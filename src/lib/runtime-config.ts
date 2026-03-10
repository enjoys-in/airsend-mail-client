/**
 * Runtime configuration approach:
 *
 * `APP_SECRET` and `ENCRYPTION_KEY` are read in the server component (layout.tsx)
 * and passed as props to RuntimeConfigProvider (client component).
 * RuntimeConfigProvider calls setSecurityConfig() to store them in module-level
 * memory — no window globals, no network round-trips.
 *
 * - HMAC signing is done client-side using CryptoJS.HmacSHA512.
 * - AES encrypt/decrypt is done client-side using CryptoJS.AES.
 *
 * Non-secret runtime values (APP_ENV, APP_URL, API_KEY, etc.) are
 * injected via `window.__RUNTIME_CONFIG__` in the root layout.
 */

// Nothing to export — all config is accessed via security.ts and constants/config.ts.
// This file is kept as documentation of the runtime-config approach.
