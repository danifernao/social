import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Cargar todos los archivos de traducción de forma automática.
const modules = import.meta.glob("./locales/**/*.json", { eager: true });

// Estructura final: { en: { common: {...}, welcome: {...} }, es: {...} }
const resources: any = {};

for (const path in modules) {
  const match = path.match(/\.\/locales\/(\w+)\/(.+)\.json$/);
  if (!match) continue;

  const [, lang, namespace] = match;
  resources[lang] ??= {};
  resources[lang][namespace] = (modules[path] as any).default;
}

i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;