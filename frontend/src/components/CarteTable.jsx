const STATUTS = {
  libre: {
    libelle: "Libre",
    badge: "text-emerald-800 border-emerald-700/40",
    carte: "border-charbon/15",
  },
  occupee: {
    libelle: "En service",
    badge: "text-safran-fonce border-safran-fonce/50",
    carte: "border-safran",
  },
  addition_demandee: {
    libelle: "Addition demandée",
    badge: "text-red-800 border-red-700/40",
    carte: "border-red-700/50",
  },
};

const STATUTS_COMMANDE = {
  en_attente: "En attente",
  en_preparation: "En préparation",
  prete: "Prête",
  servie: "Servie",
};

export default function CarteTable({ table }) {
  const statut = STATUTS[table.statut] ?? STATUTS.libre;
  const commande = table.commande_ouverte;

  return (
    <div className={`border rounded-lg p-4 bg-white/60 ${statut.carte}`}>
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-titre text-xl font-bold">Table {table.numero}</h2>
        <span className={`text-xs border rounded px-2 py-0.5 ${statut.badge}`}>
          {statut.libelle}
        </span>
      </div>
      <p className="text-sm text-charbon/70 mt-1">
        {table.capacite} {table.capacite > 1 ? "places" : "place"}
      </p>

      {commande && (
        <div className="text-sm mt-3 border-t border-charbon/10 pt-3 space-y-1">
          <p className="font-medium">
            {STATUTS_COMMANDE[commande.statut] ?? commande.statut}
            <span className="text-charbon/70 font-normal">
              {" "}· {Number(commande.total).toFixed(2)} MAD
            </span>
          </p>
          <p className="text-charbon/70">{commande.serveur}</p>
        </div>
      )}
    </div>
  );
}
