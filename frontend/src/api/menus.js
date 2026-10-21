import api from "./client";

export const listerMenus = async () => {
  const { data } = await api.get("/menus");
  return data;
};

// Réservé au Gérant : { nom, description, prix, categorie, image, disponible }
export const creerMenu = async (menu) => {
  const { data } = await api.post("/menus", menu);
  return data;
};

export const modifierMenu = async ({ id, ...menu }) => {
  const { data } = await api.put(`/menus/${id}`, menu);
  return data;
};

// Bascule disponible / indisponible.
export const basculerDisponibilite = async (id) => {
  const { data } = await api.patch(`/menus/${id}/disponibilite`);
  return data;
};

export const supprimerMenu = async (id) => {
  await api.delete(`/menus/${id}`);
};
