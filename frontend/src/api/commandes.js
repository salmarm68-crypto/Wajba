import api from "./client";

// Corps attendu par l'API : { table_id, lignes: [{ menu_id, quantite, note }] }
export const creerCommande = async (commande) => {
  const { data } = await api.post("/commandes", commande);
  return data;
};

// Les commandes sont enveloppées dans { data: ... }.
export const listerCommandes = async (params = {}) => {
  const { data } = await api.get("/commandes", { params });
  return data.data;
};

export const lireCommande = async (id) => {
  const { data } = await api.get(`/commandes/${id}`);
  return data.data;
};

// lignes : [{ menu_id, quantite, note }]
export const modifierCommande = async ({ id, lignes }) => {
  const { data } = await api.put(`/commandes/${id}`, { lignes });
  return data.data;
};

export const annulerCommande = async (id) => {
  const { data } = await api.delete(`/commandes/${id}`);
  return data.data;
};

// Passe la commande au statut suivant (en_attente, en_preparation, prete, servie).
export const avancerStatut = async (id) => {
  const { data } = await api.patch(`/commandes/${id}/statut`);
  return data.data;
};

export const demanderAddition = async (id) => {
  const { data } = await api.post(`/commandes/${id}/addition`);
  return data.data;
};

export const appliquerRemise = async ({ id, remise }) => {
  const { data } = await api.patch(`/commandes/${id}/remise`, { remise });
  return data.data;
};

export const payerCommande = async ({ id, mode_paiement }) => {
  const { data } = await api.post(`/commandes/${id}/paiement`, { mode_paiement });
  return data.data;
};
