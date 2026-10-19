import api from "./client";

export const listerMenus = async () => {
  const { data } = await api.get("/menus");
  return Array.isArray(data) ? data : data.data ?? [];
};