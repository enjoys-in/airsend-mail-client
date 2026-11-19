const env = {
  VITE_BACKEND_URL: "/api/files",
  VITE_FRONTEND_URL: "",
  VITE_POSTHOG_KEY: "",
  VITE_POSTHOG_HOST: "",
  MODE: process.env.NODE_ENV || "development",
  DEV: process.env.NODE_ENV !== "production",
  PROD: process.env.NODE_ENV === "production",
};

export default env;
