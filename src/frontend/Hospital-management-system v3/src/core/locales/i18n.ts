import en from './en.json';
import ar from './ar.json';

// Easily extensible translations registry
export const translations = {
  en,
  ar,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

// Utility functions for changing and managing translations
export const getTranslation = (lang: Language, key: TranslationKey): string => {
  const dictionary = translations[lang] || translations['en'];
  return (dictionary as any)[key] || (translations['en'] as any)[key] || String(key);
};
