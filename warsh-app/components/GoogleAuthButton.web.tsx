import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ensureGoogleSignInConfigured } from "@services/googleSignIn";
import { useLanguage } from "@services/language";
import { WarshPalette } from "../constants/theme";

type Props = {
  loading?: boolean;
  onToken: (idToken: string) => void | Promise<void>;
  onError: (error: unknown) => void;
};

type GoogleCredentialResponse = {
  credential?: string;
};

let googleScriptPromise: { locale: string; promise: Promise<void> } | null = null;

function loadGoogleIdentityServices(locale: string) {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts.id.initialize) return Promise.resolve();
  if (googleScriptPromise?.locale === locale) return googleScriptPromise.promise;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google sign-in failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://accounts.google.com/gsi/client?hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in failed to load."));
    document.head.appendChild(script);
  });
  googleScriptPromise = { locale, promise };
  return promise;
}

export function GoogleAuthButton({ loading = false, onToken, onError }: Props) {
  const containerRef = useRef<unknown>(null);
  const language = useLanguage();

  useEffect(() => {
    let active = true;
    let localeFallbackTimer: number | undefined;
    try {
      ensureGoogleSignInConfigured();
    } catch (error) {
      onError(error);
      return;
    }

    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!.trim();
    void loadGoogleIdentityServices(language)
      .then(() => {
        if (!active || !window.google || !containerRef.current) return;
        const container = containerRef.current as HTMLElement;
        container.replaceChildren();
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: GoogleCredentialResponse) => {
            if (!response.credential) {
              onError(new Error("Google did not return an identity token."));
              return;
            }
            void onToken(response.credential);
          },
        });
        const buttonConfig = {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: language,
          width: 342,
        };
        window.google.accounts.id.renderButton(container, buttonConfig);
        localeFallbackTimer = window.setTimeout(() => {
          if (!active || container.childElementCount > 0 || !window.google) return;
          window.google.accounts.id.renderButton(container, {
            ...buttonConfig,
            locale: "en",
          });
        }, 300);
      })
      .catch(onError);

    return () => {
      active = false;
      if (localeFallbackTimer !== undefined) {
        window.clearTimeout(localeFallbackTimer);
      }
    };
  }, [language, onError, onToken]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={WarshPalette.gold} />
      </View>
    );
  }

  return <View ref={containerRef as never} style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    width: "100%",
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: WarshPalette.white,
    borderWidth: 1,
    borderColor: WarshPalette.defaultCardBorder,
  },
});

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type: string;
              theme: string;
              size: string;
              shape: string;
              text: string;
              locale: string;
              width: number;
            },
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
