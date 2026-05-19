import { useMemo, useState } from "react";
import en from "../locales/en.json";
import mn from "../locales/mn.json";

const STORAGE_KEY = "draftly-language";
const dictionaries = { en, mn };

export function useI18n() {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || "en");

  function changeLanguage(nextLanguage) {
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
  }

  return useMemo(() => {
    const dictionary = dictionaries[language] ?? dictionaries.en;

    return {
      language,
      setLanguage: changeLanguage,
      t(key) {
        return dictionary[key] ?? dictionaries.en[key] ?? key;
      },
    };
  }, [language]);
}
