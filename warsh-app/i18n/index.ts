import { useCallback } from "react";
import { useLanguage, type AppLanguage } from "@services/language";
import { en } from "./en";
import { ur } from "./ur";

type Params = Record<string, string | number>;
type Dict = Record<string, string>;

const dictionaries: Record<AppLanguage, Dict> = { en, ur };

function interpolate(template: string, params?: Params) {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ""));
}

export function translate(language: AppLanguage, key: string, params?: Params) {
  const value = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
  return interpolate(value, params);
}

export function useT() {
  const language = useLanguage();
  return useCallback((key: string, params?: Params) => translate(language, key, params), [language]);
}
