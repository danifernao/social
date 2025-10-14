import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.currentLang = i18n.resolvedLanguage ?? "en";

i18n.on("languageChanged", (_) => {
  i18n.currentLang = i18n.resolvedLanguage ?? "en";
});

export default i18n;