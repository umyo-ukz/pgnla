import { useLanguage } from "../contexts/LanguageContext";
import enTranslations from "../translations/en.json";
import esTranslations from "../translations/es.json";

const translations = {
  en: enTranslations,
  es: esTranslations,
};

type TranslationKey = keyof typeof enTranslations;
type NestedKey<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKey<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type TranslationPath = NestedKey<typeof enTranslations>;

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationPath, fallback?: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (value === undefined) {
      // Fallback to English if translation not found
      let enValue: any = translations.en;
      for (const k of keys) {
        enValue = enValue?.[k];
        if (enValue === undefined) break;
      }
      return enValue ?? fallback ?? key;
    }

    return typeof value === "string" ? value : fallback ?? key;
  };

  return { t, language };
}

