import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appliquerRemise, lireCommande, payerCommande } from "../api/commandes";
import { MODES_PAIEMENT, mad, messagesErreur } from "../lib/statuts";

export default function Addition() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: commande, isLoading, isError } = useQuery({
    queryKey: ["commande", id],
    queryFn: () => lireCommande(id),
  });

  const [remise, setRemise] = useState("");
  const [mode, setMode] = useState("especes");

  useEffect(() => {
    if (commande) setRemise(commande.remise > 0 ? String(commande.remise) : "");
  }, [commande?.remise]);

  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ["commande", id] });
    queryClient.invalidateQueries({ queryKey: ["commandes"] });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  };

  const remiseMutation = useMutation({ mutationFn: appliquerRemise, onSuccess: rafraichir });

  const paiement = useMutation({
    mutationFn: payerCommande,
    onSuccess: () => {
      rafraichir();
      navigate(`/commandes/${id}/ticket`);
    },
  });

  if (isLoading) return <p className="text-charbon/70">Chargement…</p>;

  if (isError || !commande)
    return (
      <div>
        <p className="text-red-700 mb-3">Commande introuvable.</p>
        <Link to="/" className="underline">Retour au plan de salle</Link>
      </div>
    );

  if (["payee", "annulee"].includes(commande.statut))
    return (
      <div>
        <p className="mb-3">Cette commande est déjà clôturée.</p>
        <Link to="/" className="underline">Retour au plan de salle</Link>
      </div>
    );

  const erreurs = [remiseMutation, paiement]
    .filter((m) => m.isError)
    .flatMap((m) => messagesErreur(m.error));

  return (
    <section className="max-w-2xl">
      <Link to={`/commandes/${commande.id}`} className="text-sm text-charbon/70 hover:text-charbon">
        ← Détail de la commande
      </Link>
      <h1 className="font-titre text-3xl font-bold mt-2">
        Addition · Table {commande.table?.numero}
      </h1>

      <div className="border border-charbon/15 rounded-lg p-4 bg-white/60 mt-6">
        <ul className="space-y-2">
          {commande.lignes.map((l) => (
            <li key={l.menu_id} className="flex justify-between gap-2 text-sm">
              <span>
                {l.quantite} × {l.nom}
              </span>
              <span>{mad(l.sous_total)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-charbon/10 mt-4 pt-3 space-y-1 text-sm">
          <p className="flex justify-between">
            <span>Sous-total</span>
            <span>{mad(commande.sous_total)}</span>
          </p>
          {commande.remise > 0 && (
            <p className="flex justify-between">
              <span>Remise</span>
              <span>− {mad(commande.remise)}</span>
            </p>
          )}
          <p className="flex justify-between">
            <span>TVA (10 %)</span>
            <span>{mad(commande.tva)}</span>
          </p>
          <p className="flex justify-between font-medium text-lg pt-2">
            <span>Total à payer</span>
            <span>{mad(commande.total)}</span>
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          remiseMutation.mutate({ id, remise: Number(remise || 0) });
        }}
        className="mt-6"
      >
        <label htmlFor="remise" className="block text-sm font-medium mb-1">
          Remise (MAD)
        </label>
        <div className="flex gap-3">
          <input
            id="remise"
            type="number"
            min="0"
            step="0.01"
            value={remise}
            onChange={(e) => setRemise(e.target.value)}
            placeholder="0.00"
            className="w-40 border border-charbon/20 rounded-md px-3 py-2 bg-transparent"
          />
          <button
            type="submit"
            disabled={remiseMutation.isPending}
            className="border border-charbon/30 rounded-md px-4 py-2 text-sm hover:bg-charbon/5 disabled:opacity-50"
          >
            Appliquer
          </button>
        </div>
      </form>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium mb-2">Mode de paiement</legend>
        <div className="flex gap-3">
          {MODES_PAIEMENT.map((m) => (
            <label
              key={m.cle}
              className={`border rounded-md px-4 py-2 text-sm cursor-pointer ${
                mode === m.cle ? "border-safran bg-safran/15" : "border-charbon/20"
              }`}
            >
              <input
                type="radio"
                name="mode"
                value={m.cle}
                checked={mode === m.cle}
                onChange={() => setMode(m.cle)}
                className="sr-only"
              />
              {m.libelle}
            </label>
          ))}
        </div>
      </fieldset>

      {erreurs.length > 0 && (
        <ul className="text-red-700 text-sm mt-4 space-y-1">
          {erreurs.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      <button
        onClick={() => paiement.mutate({ id, mode_paiement: mode })}
        disabled={paiement.isPending}
        className="w-full mt-6 bg-safran text-charbon font-medium rounded-md py-2.5 hover:brightness-95 disabled:opacity-50"
      >
        {paiement.isPending ? "Paiement…" : `Encaisser ${mad(commande.total)}`}
      </button>
    </section>
  );
}
