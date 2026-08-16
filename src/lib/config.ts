export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3010/api/v1",
    timeout: {
      client: Number(import.meta.env.VITE_CLIENT_TIMEOUT) || 30000,
      server: Number(import.meta.env.VITE_SERVER_TIMEOUT) || 30000,
    },
  },
  auth: {
    loginUrl: "/login",
    registerUrl: "/register",
  },
  isDev: import.meta.env.DEV,
} as const;

export type AppConfig = typeof config;
