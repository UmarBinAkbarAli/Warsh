declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_ENVIRONMENT?: "development" | "staging" | "production";
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_ENABLE_SENTRY_SMOKE?: string;
    EXPO_PUBLIC_MIXPANEL_TOKEN?: string;
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
    E2E_BASE_URL?: string;
    E2E_EMAIL?: string;
    E2E_PASSWORD?: string;
  };
};
