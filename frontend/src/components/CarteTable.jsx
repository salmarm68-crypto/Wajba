import { Link } from "react-router-dom";
import { mad, STATUTS_COMMANDE } from "../lib/statuts";
import { depuis } from "../lib/temps";
import Pastille from "./Pastille";

const STATUTS = {
  libre: { libelle: "Libre", ton: "vert" },
  occupee: { libelle: "En service", ton: "ambre" },
  addition_demandee: { libelle: "Addition demandée", ton: "rouge" },
};

export default function CarteTable({ table, maintenant }) {
  const statut = STATUTS[table.statut] ?? STATUTS.libre;
  const commande = table.commande_ouverte;
  const libre = table.statut === "libre";

  const cadre = libre
    ? "border-dashed border-charbon/25 bg-transparent"
    : table.statut === "addition_demandee"
      ? "border-brique/40 bg-white"
      : "border-charbon/15 bg-white";

  const carte = (
    <div className={`border rounded-xl p-5 h-full hover:border-safran ${cadre}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-titre text-5xl leading-none">{table.numero}</span>
        <Pastille ton={statut.ton}>{statut.libelle}</Pastille>
      </div>
      <p className="text-sm text-charbon/60 mt-3">
        {table.capacite} {table.capacite > 1 ? "couverts" : "couvert"}
      </p>

      <div className="text-sm mt-4">
        {commande ? (
          <>
            <p className="font-medium">
              {depuis(commande.created_at, maintenant)} · {mad(commande.total)}
            </p>
            <p className="text-charbon/60 mt-0.5">
              {STATUTS_COMMANDE[commande.statut] ?? commande.statut} · {commande.serveur}
            </p>
          </>
        ) : (
          libre && <p className="font-medium">Disponible</p>
        )}
      </div>
    </div>
  );

  if (!libre && !commande) return carte;

  // Table libre : nouvelle commande. Table en service : détail de la commande.
  const destination = libre ? `/tables/${table.id}/commande` : `/commandes/${commande.id}`;

  return (
    <Link to={destination} className="block">
      {carte}
    </Link>
  );
}
