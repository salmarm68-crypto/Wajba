import api from "./client";

// Réservé au Gérant. La création d'un serveur passe par l'inscription.
export const listerServeurs = async () => {
  const { data } = await api.get("/serveurs");
  return data;
};

// { id, nom, email, role, mot_de_passe (facultatif) }
export const modifierServeur = async ({ id, ...serveur }) => {
  const { data } = await api.put(`/serveurs/${id}`, serveur);
  return data;
};

export const supprimerServeur = async (id) => {
  await api.delete(`/serveurs/${id}`);
};
