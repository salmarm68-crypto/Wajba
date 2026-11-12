import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return <Pastille ton={TONS[statut] ?? "neutre"}>{t(STATUTS_COMMANDE[statut] ?? statut)}</Pastille>;
}
