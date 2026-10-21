import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creerTable, listerTables, modifierTable, supprimerTable } from "../api/tables";
import { STATUTS_TABLE, messagesErreur } from "../lib/statuts";

const VIDE = { id: null, numero: "", capacite: "" };

export default function GestionTables() {
  const queryClient = useQueryClient();
  const [formulaire, setFormulaire] = useState(VIDE);

  const { data: tables, isLoading, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: listerTables,
  });

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: ["tables"] });

  const enregistrer = useMutation({
    mutationFn: ({ id, ...donnees }) =>
      id ? modifierTable({ id, ...donnees }) : creerTable(donnees),
    onSuccess: () => {
      rafraichir();
      setFormulaire(VIDE);
    },
  });
  const supprimer = useMutation({ mutationFn: supprimerTable, onSuccess: rafraichir });

  const soumettre = (e) => {
    e.preventDefault();
    enregistrer.mutate({
      id: formulaire.id,
      numero: Number(formulaire.numero),
      capacite: Number(formulaire.capacite),
    });
  };

  const confirmerSuppression = (table) => {
    if (window.confirm(`Supprimer la table ${table.numero} ?`)) supprimer.mutate(table.id);
  };

  const erreurs = [enregistrer, supprimer]
    .filter((m) => m.isError)
    .flatMap((m) => messagesErreur(m.error));

  const saisie = "w-full border border-charbon/20 rounded-md px-3 py-2 bg-transparent";

  return (
    <section>
      <h1 className="font-titre text-3xl font-bold">Gestion des tables</h1>
      <p className="text-sm text-charbon/70 mt-1">
        Le statut d'une table change automatiquement avec les commandes. Une table qui a une
        commande ouverte ne peut pas être supprimée.
      </p>

      <form
        onSubmit={soumettre}
        className="mt-6 border border-charbon/15 rounded-lg p-4 bg-white/60 grid sm:grid-cols-2 gap-4 max-w-2xl"
      >
        <h2 className="font-titre text-xl font-bold sm:col-span-2">
          {formulaire.id ? "Modifier la table" : "Nouvelle table"}
        </h2>

        <div>
          <label htmlFor="numero" className="block text-sm font-medium mb-1">Numéro</label>
          <input
            id="numero" type="number" min="1" required value={formulaire.numero}
            onChange={(e) => setFormulaire((f) => ({ ...f, numero: e.target.value }))}
            className={saisie}
          />
        </div>

        <div>
          <label htmlFor="capacite" className="block text-sm font-medium mb-1">
            Nombre de places
          </label>
          <input
            id="capacite" type="number" min="1" max="50" required value={formulaire.capacite}
            onChange={(e) => setFormulaire((f) => ({ ...f, capacite: e.target.value }))}
            className={saisie}
          />
        </div>

        {erreurs.length > 0 && (
          <ul className="text-red-700 text-sm space-y-1 sm:col-span-2">
            {erreurs.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit" disabled={enregistrer.isPending}
            className="bg-safran text-charbon font-medium rounded-md px-4 py-2 hover:brightness-95 disabled:opacity-50"
          >
            {formulaire.id ? "Enregistrer les modifications" : "Ajouter la table"}
          </button>
          {formulaire.id && (
            <button
              type="button" onClick={() => setFormulaire(VIDE)}
              className="border border-charbon/30 rounded-md px-4 py-2 text-sm"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {isLoading && <p className="text-charbon/70 mt-8">Chargement…</p>}
      {isError && <p className="text-red-700 mt-8">Impossible de charger les tables.</p>}

      {tables && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {tables.map((table) => (
            <li key={table.id} className="border border-charbon/15 rounded-lg p-4 bg-white/60">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-titre text-xl font-bold">Table {table.numero}</h2>
                <span className="text-xs border border-charbon/30 rounded px-2 py-0.5">
                  {STATUTS_TABLE[table.statut] ?? table.statut}
                </span>
              </div>
              <p className="text-sm text-charbon/70 mt-1">
                {table.capacite} {table.capacite > 1 ? "places" : "place"}
              </p>

              <div className="flex gap-2 mt-4 text-sm">
                <button
                  onClick={() =>
                    setFormulaire({
                      id: table.id,
                      numero: String(table.numero),
                      capacite: String(table.capacite),
                    })
                  }
                  className="border border-charbon/30 rounded-md px-3 py-1.5 hover:bg-charbon/5"
                >
                  Modifier
                </button>
                <button
                  onClick={() => confirmerSuppression(table)}
                  disabled={supprimer.isPending}
                  className="text-red-800 border border-red-700/30 rounded-md px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
