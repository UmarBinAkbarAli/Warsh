import { Slot, usePathname } from "expo-router";

import { WebOnboardingLayout } from "../../components/WebOnboardingLayout";

export default function AuthLayout() {
  const pathname = usePathname();

  return (
    <WebOnboardingLayout pathname={pathname}>
      <Slot />
    </WebOnboardingLayout>
  );
}
