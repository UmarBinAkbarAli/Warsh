import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ensureGoogleSignInConfigured } from "@services/googleSignIn";
import { useLanguage } from "@services/language";
import { useT } from "@i18n/index";
import { Fonts, FontSizes, Radii, Spacing, WarshPalette } from "../constants/theme";

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

// Google Identity Services only renders its own button, which can't be
// restyled to match the app's brand. So we render that real button invisibly
// off-screen and forward clicks from our brand-styled Pressable to it — the
// actual Google auth flow still runs, just triggered via a proxied click.
export function GoogleAuthButton({ loading = false, onToken, onError }: Props) {
  const t = useT();
  const containerRef = useRef<unknown>(null);
  const language = useLanguage();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
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
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          locale: language,
          width: 300,
        });
        setReady(true);
      })
      .catch(onError);

    return () => {
      active = false;
    };
  }, [language, onError, onToken]);

  function handlePress() {
    const container = containerRef.current as HTMLElement | null;
    const realButton = container?.querySelector<HTMLElement>('div[role="button"]');
    realButton?.click();
  }

  const busy = loading || !ready;

  return (
    <Pressable
      accessibilityLabel={t("auth.continueGoogle")}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && !busy ? styles.pressed : null]}
    >
      {busy && loading ? (
        <ActivityIndicator color={WarshPalette.subtleBrown} />
      ) : (
        <>
          <Image
            source={require("../assets/images/google-g.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.label}>{t("auth.continueGoogle")}</Text>
        </>
      )}
      <View ref={containerRef as never} style={styles.hiddenRealButton} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 56,
    borderWidth: 1,
    borderColor: WarshPalette.gold,
    borderRadius: Radii.sm,
  },
  pressed: {
    backgroundColor: WarshPalette.highlightBgSoft,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.bodyM,
    fontWeight: "600",
    color: WarshPalette.subtleBrown,
  },
  hiddenRealButton: {
    position: "absolute",
    width: 1,
    height: 1,
    overflow: "hidden",
    opacity: 0,
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
