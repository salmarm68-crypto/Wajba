import { useEffect, useState } from "react";

// Heure courante, actualisée toutes les 30 secondes (pour afficher « depuis 18 min »).
export function useMaintenant() {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = setInterval(() => setMaintenant(Date.now()), 30000);
    return () => clearInterval(minuteur);
  }, []);
  return maintenant;
}

// Durée écoulée depuis une date : « 18 min » ou « 1 h 12 ».
export function depuis(dateIso, maintenant) {
  const minutes = Math.max(0, Math.floor((maintenant - Date.parse(dateIso)) / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`;
}
