declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_PUBLIC_ENVIRONMENT?: "development" | "staging" | "production";
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_ENABLE_SENTRY_SMOKE?: string;
    EXPO_PUBLIC_MIXPANEL_TOKEN?: string;
  };
};
