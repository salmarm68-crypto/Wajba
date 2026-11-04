import { STATUTS_COMMANDE } from "../lib/statuts";
import Pastille from "./Pastille";

const TONS = {
  en_attente: "neutre",
  en_preparation: "ambre",
  prete: "vert",
  servie: "neutre",
  payee: "vert",
  annulee: "rouge",
};

export default function BadgeStatut({ statut }) {
  return <Pastille ton={TONS[statut] ?? "neutre"}>{STATUTS_COMMANDE[statut] ?? statut}</Pastille>;
}
