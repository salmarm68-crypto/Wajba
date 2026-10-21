import { STATUTS_COMMANDE } from "../lib/statuts";

const COULEURS = {
  en_attente: "text-charbon/70 border-charbon/30",
  en_preparation: "text-safran-fonce border-safran-fonce/50",
  prete: "text-emerald-800 border-emerald-700/40",
  servie: "text-charbon border-charbon/40",
  payee: "text-emerald-800 border-emerald-700/40",
  annulee: "text-red-800 border-red-700/40",
};

export default function BadgeStatut({ statut }) {
  return (
    <span className={`text-xs border rounded px-2 py-0.5 ${COULEURS[statut] ?? ""}`}>
      {STATUTS_COMMANDE[statut] ?? statut}
    </span>
  );
}
