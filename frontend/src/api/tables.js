import api from "./client";

export const listerTables = async () => {
  const { data } = await api.get("/tables");
  return data;
};

// Réservé au Gérant : { numero, capacite }
export const creerTable = async (table) => {
  const { data } = await api.post("/tables", table);
  return data;
};

export const modifierTable = async ({ id, ...table }) => {
  const { data } = await api.put(`/tables/${id}`, table);
  return data;
};

export const supprimerTable = async (id) => {
  await api.delete(`/tables/${id}`);
};
