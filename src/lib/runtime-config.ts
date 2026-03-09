/**
 * Runtime configuration singleton.
 *
 * `APP_SECRET` and `ENCRYPTION_KEY` are **never** sent to the client.
 * - HMAC signing goes through `/api/sign`.
 * - AES encrypt/decrypt goes through `/api/crypto`.
 *
 * Non-secret runtime values (APP_ENV, APP_URL, API_KEY, etc.) are
 * injected via `window.__RUNTIME_CONFIG__` in the root layout.
 */

// Nothing to export — all secrets are server-side only.
// This file is kept as documentation of the runtime-config approach.
