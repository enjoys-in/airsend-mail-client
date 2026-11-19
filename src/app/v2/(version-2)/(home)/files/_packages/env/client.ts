// Client environment for the Nimbus (files) web app. The original read VITE_* variables through t3-env; this app is
// mounted inside Next.js, so the same keys are fed from NEXT_PUBLIC_FILES_* variables.

/** The files backend (Nimbus server), called directly from the browser with credentials. */
const backendUrl = (process.env.NEXT_PUBLIC_FILES_API_URL || "http://localhost:1284").replace(/\/+$/, "");

const env = {
	VITE_BACKEND_URL: backendUrl,
};

export default env;
