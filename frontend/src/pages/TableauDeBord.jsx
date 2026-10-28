import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { lireTableauDeBord } from "../api/dashboard";
import { mad } from "../lib/statuts";

function Indicateur({ titre, valeur, detail }) {
  return (
    <div className="border border-charbon/15 rounded-lg p-5 bg-white/60">
      <p className="text-sm text-charbon/70">{titre}</p>
      <p className="font-titre text-3xl font-bold mt-2">{valeur}</p>
      {detail && <p className="text-sm text-charbon/60 mt-1">{detail}</p>}
    </div>
  );
}

export default function TableauDeBord() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: lireTableauDeBord,
    refetchInterval: 30000,
  });

  const [aujourdhui] = useState(() =>
    new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })
  );

  const plats = data?.plats_populaires ?? [];
  const maximum = Math.max(1, ...plats.map((p) => Number(p.quantite)));

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-titre text-3xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-charbon/70 capitalize">{aujourdhui}</p>
      </div>

      {isLoading && <p className="text-charbon/70 mt-8">Chargement…</p>}
      {isError && <p className="text-red-700 mt-8">Impossible de charger le tableau de bord.</p>}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Indicateur
              titre="Chiffre d'affaires du jour"
              valeur={mad(data.chiffre_affaires_du_jour)}
              detail="Commandes payées aujourd'hui"
            />
            <Indicateur
              titre="Commandes payées"
              valeur={data.commandes_payees_du_jour}
              detail="Aujourd'hui"
            />
            <Indicateur
              titre="Commandes en cours"
              valeur={data.commandes_en_cours}
              detail="Non payées et non annulées"
            />
            <Indicateur
              titre="Tables occupées"
              valeur={`${data.tables_occupees} / ${data.tables_total}`}
              detail="En service ou addition demandée"
            />
          </div>

          <h2 className="font-titre text-xl font-bold mt-10 mb-4">Plats les plus vendus</h2>

          {plats.length === 0 ? (
            <p className="text-charbon/70">Aucune vente pour le moment.</p>
          ) : (
            <ol className="space-y-3 max-w-2xl">
              {plats.map((plat, index) => (
                <li key={plat.menu_id}>
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="font-medium">
                      {index + 1}. {plat.nom}
                    </span>
                    <span className="text-charbon/70">{Number(plat.quantite)} vendus</span>
                  </div>
                  <div className="h-2 rounded bg-charbon/10 mt-1">
                    <div
                      className="h-2 rounded bg-safran"
                      style={{ width: `${(Number(plat.quantite) / maximum) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
