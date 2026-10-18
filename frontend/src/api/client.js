import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
});

api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur.response?.status === 401 && !location.pathname.startsWith("/connexion")) {
      localStorage.removeItem("token");
      localStorage.removeItem("serveur");
      location.href = "/connexion";
    }
    return Promise.reject(erreur);
  }
);

export default api;