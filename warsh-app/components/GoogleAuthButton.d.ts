import type { ComponentType } from "react";

export type GoogleAuthButtonProps = {
  loading?: boolean;
  onToken: (idToken: string) => void | Promise<void>;
  onError: (error: unknown) => void;
};

export const GoogleAuthButton: ComponentType<GoogleAuthButtonProps>;
