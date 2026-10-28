import api from "./client";

// Réservé au Gérant : chiffre d'affaires du jour, commandes en cours, tables occupées, plats populaires.
export const lireTableauDeBord = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};
