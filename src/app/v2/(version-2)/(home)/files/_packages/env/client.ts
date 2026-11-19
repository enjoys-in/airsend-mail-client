// Client environment for the Nimbus (files) web app. The original read VITE_* variables through t3-env; this app is
// mounted inside Next.js, so the backend URL comes from the runtime config the root layout injects
// (`window.__RUNTIME_CONFIG__.FILES_API_URL`, set from the server env `FILES_API_URL`), not from a build-time NEXT_PUBLIC variable.

/** The files backend (Nimbus server), called directly from the browser with credentials. */
const runtimeFilesUrl =
	typeof window !== "undefined" ? (window as { __RUNTIME_CONFIG__?: Record<string, string> }).__RUNTIME_CONFIG__?.FILES_API_URL : undefined;
const backendUrl = (runtimeFilesUrl || "http://localhost:1284").trim().replace(/\/+$/, "");

const env = {
	VITE_BACKEND_URL: backendUrl,
};

export default env;
