import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { lireCommande } from "../api/commandes";
import { MODES_PAIEMENT, mad } from "../lib/statuts";

export default function Ticket() {
  const { id } = useParams();
  const { data: commande, isLoading, isError } = useQuery({
    queryKey: ["commande", id],
    queryFn: () => lireCommande(id),
  });

  if (isLoading) return <p className="text-charbon/70">Chargement…</p>;
  if (isError || !commande) return <p className="text-red-700">Commande introuvable.</p>;

  if (commande.statut !== "payee") {
    return (
      <section>
        <p className="mb-4">Le ticket est disponible après le paiement de la commande.</p>
        <Link to={`/commandes/${commande.id}/addition`} className="underline">
          Retour à l'addition
        </Link>
      </section>
    );
  }

  const date = new Date(commande.paye_le ?? commande.created_at).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
  const mode = MODES_PAIEMENT.find((m) => m.cle === commande.mode_paiement)?.libelle
    ?? commande.mode_paiement;

  return (
    <section className="max-w-sm mx-auto">
      <article className="border border-charbon/20 rounded-lg p-6 bg-white font-mono text-sm">
        <h1 className="font-titre text-2xl font-bold text-center">Wajba</h1>
        <p className="text-center text-charbon/70 mb-4">Ticket de caisse</p>

        <div className="border-y border-dashed border-charbon/30 py-2 mb-3 space-y-0.5">
          <p>Commande n° {commande.id}</p>
          <p>Table {commande.table?.numero}</p>
          <p>Serveur : {commande.serveur?.nom}</p>
          <p>{date}</p>
        </div>

        <ul className="space-y-1 mb-3">
          {commande.lignes.map((ligne) => (
            <li key={ligne.menu_id} className="flex justify-between gap-3">
              <span>
                {ligne.quantite} × {ligne.nom}
              </span>
              <span>{mad(ligne.sous_total)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-dashed border-charbon/30 pt-2 space-y-0.5">
          <p className="flex justify-between">
            <span>Sous-total</span>
            <span>{mad(commande.sous_total)}</span>
          </p>
          {commande.remise > 0 && (
            <p className="flex justify-between">
              <span>Remise</span>
              <span>- {mad(commande.remise)}</span>
            </p>
          )}
          <p className="flex justify-between">
            <span>TVA 10 %</span>
            <span>{mad(commande.tva)}</span>
          </p>
          <p className="flex justify-between font-bold text-base pt-1">
            <span>Total</span>
            <span>{mad(commande.total)}</span>
          </p>
          <p className="pt-2">Paiement : {mode}</p>
        </div>

        <p className="text-center mt-5">Merci de votre visite !</p>
      </article>

      <div className="no-print flex flex-wrap gap-3 mt-6 justify-center">
        <button
          onClick={() => window.print()}
          className="bg-safran text-charbon font-medium rounded-md px-4 py-2 hover:brightness-95"
        >
          Imprimer le ticket
        </button>
        <Link to="/" className="border border-charbon/30 rounded-md px-4 py-2 text-sm">
          Retour au plan de salle
        </Link>
      </div>
    </section>
  );
}
