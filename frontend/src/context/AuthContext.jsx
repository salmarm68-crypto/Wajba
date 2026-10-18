import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [serveur, setServeur] = useState(() =>
    JSON.parse(localStorage.getItem("serveur") || "null")
  );

  const connecter = async (email, password) => {
    const { data } = await api.post("/login", {
      email,
      mot_de_passe: password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("serveur", JSON.stringify(data.serveur));
    setServeur(data.serveur);
  };

  const deconnecter = async () => {
    try {
      await api.post("/logout");
    } catch {
      // le jeton est supprimé côté client dans tous les cas
    }
    localStorage.removeItem("token");
    localStorage.removeItem("serveur");
    setServeur(null);
  };

  return (
    <AuthContext.Provider value={{ serveur, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);