import { useOnboardingStore } from "@stores/onboardingStore";
import { useT } from "@i18n/index";
import type { AppLanguage } from "@services/language";
import { LanguageChoiceSheet } from "./LanguageChoiceSheet";

type LanguageSheetProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Bottom sheet for the pre-auth language picker.
 *
 * Selecting a language sets BOTH `language` (app UI) and
 * `translationLanguage` (ayah meanings) so an English user never lands on
 * Urdu translations. Settings can still change them independently later.
 */
export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const t = useT();
  const language = useOnboardingStore((s) => s.language);
  const setLanguage = useOnboardingStore((s) => s.setLanguage);
  const setTranslationLanguage = useOnboardingStore((s) => s.setTranslationLanguage);

  function select(value: AppLanguage) {
    setLanguage(value);
    setTranslationLanguage(value);
    onClose();
  }

  return (
    <LanguageChoiceSheet
      visible={visible}
      title={t("language.sheetTitle")}
      body={t("language.sheetBody")}
      current={language === "ur" ? "ur" : "en"}
      options={[
        { value: "en", title: t("language.english"), subtitle: t("language.menusEnglish") },
        { value: "ur", title: t("language.urdu"), subtitle: t("language.menusUrdu") },
      ]}
      ctaLabel={() => t("common.continue")}
      onConfirm={select}
      onClose={onClose}
    />
  );
}
