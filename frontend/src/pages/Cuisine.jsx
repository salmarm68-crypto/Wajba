import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { avancerStatut, listerCommandes } from "../api/commandes";
import { ACTION_SUIVANTE, messagesErreur } from "../lib/statuts";

const COLONNES = [
  { statut: "en_attente", titre: "En attente" },
  { statut: "en_preparation", titre: "En préparation" },
  { statut: "prete", titre: "Prêtes" },
];

const heure = (iso) =>
  iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

export default function Cuisine() {
  const queryClient = useQueryClient();

  // Rafraîchissement automatique toutes les 5 secondes (polling).
  const { data: commandes, isLoading, isError } = useQuery({
    queryKey: ["commandes", "cuisine"],
    queryFn: () => listerCommandes({ statut: "en_cours" }),
    refetchInterval: 5000,
  });

  const avancer = useMutation({
    mutationFn: avancerStatut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  if (isLoading) return <p className="text-charbon/70">Chargement de la cuisine…</p>;
  if (isError) return <p className="text-red-700">Impossible de charger les commandes.</p>;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <h1 className="font-titre text-3xl font-bold">Cuisine</h1>
        <p className="text-sm text-charbon/70">Mise à jour automatique toutes les 5 secondes</p>
      </div>

      {avancer.isError && (
        <ul className="text-red-700 text-sm mb-4">
          {messagesErreur(avancer.error).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {COLONNES.map((colonne) => {
          const liste = (commandes ?? [])
            .filter((c) => c.statut === colonne.statut)
            .sort((a, b) => a.id - b.id);

          return (
            <div key={colonne.statut}>
              <h2 className="font-titre text-xl font-bold mb-3">
                {colonne.titre}{" "}
                <span className="text-sm font-normal text-charbon/70">({liste.length})</span>
              </h2>

              {liste.length === 0 ? (
                <p className="text-sm text-charbon/60">Aucune commande.</p>
              ) : (
                <ul className="space-y-3">
                  {liste.map((c) => (
                    <li key={c.id} className="border border-charbon/15 rounded-lg p-3 bg-white/60">
                      <div className="flex justify-between items-baseline">
                        <Link to={`/commandes/${c.id}`} className="font-titre text-lg font-bold">
                          Table {c.table?.numero}
                        </Link>
                        <span className="text-xs text-charbon/70">
                          #{c.id} · {heure(c.created_at)}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm">
                        {c.lignes.map((l) => (
                          <li key={l.menu_id}>
                            <span className="font-medium">{l.quantite} ×</span> {l.nom}
                            {l.note && (
                              <span className="block text-safran-fonce">Note : {l.note}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => avancer.mutate(c.id)}
                        disabled={avancer.isPending}
                        className="w-full mt-3 bg-safran text-charbon text-sm font-medium rounded-md py-1.5 hover:brightness-95 disabled:opacity-50"
                      >
                        {ACTION_SUIVANTE[c.statut]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
