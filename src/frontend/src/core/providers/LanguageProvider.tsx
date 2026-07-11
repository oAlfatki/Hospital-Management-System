import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, type Language, type TranslationKey } from "../locales/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: TranslationKey) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hms_lang');
    if (saved === 'ar' || saved === 'en') return saved as Language;
    return 'ar'; // Default to Arabic as requested or English, but let's default to Arabic or keep the layout flexible. Let's make it English by default or Arabic. Let's start with 'ar' so they immediately see Arabic or 'en'. Let's do 'ar'.
  });

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem('hms_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage, dir } = useLanguage();
  return { t, i18n: { changeLanguage: setLanguage, language }, dir };
};