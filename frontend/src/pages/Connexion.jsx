import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Connexion() {
  const { serveur, connecter } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  if (serveur) return <Navigate to="/" replace />;

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);
    try {
      await connecter(email, password);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.message || "Connexion impossible.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={soumettre}
        className="w-full max-w-sm border border-charbon/15 rounded-lg p-8 bg-white/60"
      >
        <h1 className="font-titre text-3xl font-bold mb-1">Wajba</h1>
        <p className="text-charbon/70 mb-6">Connectez-vous à votre compte.</p>

        <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
        <input
          id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-charbon/20 rounded-md px-3 py-2 mb-4 bg-transparent"
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">Mot de passe</label>
        <input
          id="password" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-charbon/20 rounded-md px-3 py-2 mb-4 bg-transparent"
        />

        {erreur && <p className="text-red-700 text-sm mb-4">{erreur}</p>}

        <button
          type="submit" disabled={chargement}
          className="w-full bg-safran text-charbon font-medium rounded-md py-2 hover:brightness-95 disabled:opacity-60"
        >
          {chargement ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}