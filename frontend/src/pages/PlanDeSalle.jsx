import { useAuth } from "../context/AuthContext";

export default function PlanDeSalle() {
  const { serveur, deconnecter } = useAuth();
  return (
    <main className="p-6">
      <h1 className="font-titre text-3xl font-bold mb-2">Plan de salle</h1>
      <p className="mb-4">Connecté : {serveur.email} ({serveur.role})</p>
      <button
        onClick={deconnecter}
        className="border border-charbon/30 rounded-md px-4 py-2"
      >
        Se déconnecter
      </button>
    </main>
  );
}