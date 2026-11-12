import { useState } from "react";

const CLE = "theme";

// Thème clair par défaut ; le choix est mémorisé dans localStorage.
export function initialiserTheme() {
  let theme = "light";
  try {
    if (localStorage.getItem(CLE) === "dark") theme = "dark";
  } catch {
    // localStorage indisponible : thème clair
  }
  document.documentElement.dataset.theme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light");

  const definir = (suivant) => {
    document.documentElement.dataset.theme = suivant;
    try {
      localStorage.setItem(CLE, suivant);
    } catch {
      // le choix du thème n'est simplement pas mémorisé
    }
    setTheme(suivant);
  };

  return { theme, definir };
}
