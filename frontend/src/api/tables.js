import api from "./client";

export const listerTables = async () => {
  const { data } = await api.get("/tables");
  return data;
};
