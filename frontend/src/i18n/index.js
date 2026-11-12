import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./fr.json";
import en from "./en.json";

const lireLangue = () => {
  try {
    const memorisee = localStorage.getItem("langue");
    return memorisee === "en" || memorisee === "fr" ? memorisee : "fr";
  } catch {
    return "fr";
  }
};

// Les clés sont les phrases françaises : le français est la langue par défaut,
// et en.json donne la traduction anglaise de chaque phrase.
i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: lireLangue(),
  fallbackLng: "fr",
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (langue) => {
  document.documentElement.lang = langue;
  try {
    localStorage.setItem("langue", langue);
  } catch {
    // le choix de la langue n'est simplement pas mémorisé
  }
});

export const localeDates = () => (i18n.language === "en" ? "en-GB" : "fr-FR");

export default i18n;
