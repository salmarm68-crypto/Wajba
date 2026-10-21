import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { messagesErreur } from "../lib/statuts";

export default function Inscription() {
  const { serveur, inscrire } = useAuth();
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreurs, setErreurs] = useState([]);
  const [chargement, setChargement] = useState(false);

  if (serveur) return <Navigate to="/" replace />;

  const soumettre = async (e) => {
    e.preventDefault();
    setErreurs([]);
    setChargement(true);
    try {
      await inscrire(nom.trim(), email, password);
      navigate("/");
    } catch (err) {
      setErreurs(messagesErreur(err, "Inscription impossible."));
    } finally {
      setChargement(false);
    }
  };

  const champ = "w-full border border-charbon/20 rounded-md px-3 py-2 mb-4 bg-transparent";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={soumettre}
        className="w-full max-w-sm border border-charbon/15 rounded-lg p-8 bg-white/60"
      >
        <h1 className="font-titre text-3xl font-bold mb-1">Wajba</h1>
        <p className="text-charbon/70 mb-6">Créez votre compte serveur.</p>

        <label className="block text-sm font-medium mb-1" htmlFor="nom">Nom complet</label>
        <input
          id="nom" type="text" required maxLength={100} value={nom}
          onChange={(e) => setNom(e.target.value)} className={champ}
        />

        <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
        <input
          id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className={champ}
        />

        <label className="block text-sm font-medium mb-1" htmlFor="password">
          Mot de passe (8 caractères minimum)
        </label>
        <input
          id="password" type="password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)} className={champ}
        />

        {erreurs.length > 0 && (
          <ul className="text-red-700 text-sm mb-4 space-y-1">
            {erreurs.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <button
          type="submit" disabled={chargement}
          className="w-full bg-safran text-charbon font-medium rounded-md py-2 hover:brightness-95 disabled:opacity-60"
        >
          {chargement ? "Création…" : "Créer mon compte"}
        </button>

        <p className="text-sm text-charbon/70 mt-4 text-center">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="underline hover:text-charbon">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
