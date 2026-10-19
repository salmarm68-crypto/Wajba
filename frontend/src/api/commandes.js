import api from "./client";

// Corps attendu par l'API : { table_id, lignes: [{ menu_id, quantite, note }] }
export const creerCommande = async (commande) => {
  const { data } = await api.post("/commandes", commande);
  return data;
};
