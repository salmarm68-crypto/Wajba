import { useTranslation } from "react-i18next";
import { useTheme } from "../lib/theme";

function Choix({ actif, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={actif ? "font-bold text-safran-fonce" : "hover:text-charbon hover:underline"}
    >
      {children}
    </button>
  );
}

// Langue (FR | EN) et thème (Clair | Sombre).
export default function Preferences() {
  const { t, i18n } = useTranslation();
  const { theme, definir } = useTheme();

  return (
    <div className="flex items-center gap-x-3 text-xs whitespace-nowrap text-charbon/70">
      <p className="flex items-center gap-2" aria-label={t("Langue")}>
        <Choix actif={i18n.language === "fr"} onClick={() => i18n.changeLanguage("fr")}>
          FR
        </Choix>
        <span aria-hidden="true">|</span>
        <Choix actif={i18n.language === "en"} onClick={() => i18n.changeLanguage("en")}>
          EN
        </Choix>
      </p>
      <p className="flex items-center gap-2">
        <span className="hidden min-[1400px]:inline">{t("Thème")} :</span>
        <Choix actif={theme === "light"} onClick={() => definir("light")}>
          {t("Clair")}
        </Choix>
        <span aria-hidden="true">|</span>
        <Choix actif={theme === "dark"} onClick={() => definir("dark")}>
          {t("Sombre")}
        </Choix>
      </p>
    </div>
  );
}
