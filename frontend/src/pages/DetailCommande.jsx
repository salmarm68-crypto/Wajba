import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  annulerCommande,
  avancerStatut,
  demanderAddition,
  lireCommande,
  modifierCommande,
} from "../api/commandes";
import BadgeStatut from "../components/BadgeStatut";
import { ACTION_SUIVANTE, mad, messagesErreur } from "../lib/statuts";

export default function DetailCommande() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: commande, isLoading, isError } = useQuery({
    queryKey: ["commande", id],
    queryFn: () => lireCommande(id),
    refetchInterval: 10000,
  });

  const [lignes, setLignes] = useState([]);
  const [modifie, setModifie] = useState(false);

  // Recopie les lignes du serveur tant que l'utilisateur n'a rien modifié.
  useEffect(() => {
    if (commande && !modifie) setLignes(commande.lignes);
  }, [commande, modifie]);

  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ["commande", id] });
    queryClient.invalidateQueries({ queryKey: ["commandes"] });
    queryClient.invalidateQueries({ queryKey: ["tables"] });
  };

  const enregistrer = useMutation({
    mutationFn: () =>
      modifierCommande({
        id,
        lignes: lignes.map((l) => ({
          menu_id: l.menu_id,
          quantite: l.quantite,
          note: l.note?.trim() || null,
        })),
      }),
    onSuccess: () => {
      setModifie(false);
      rafraichir();
    },
  });

  const avancer = useMutation({ mutationFn: () => avancerStatut(id), onSuccess: rafraichir });

  const addition = useMutation({
    mutationFn: () => demanderAddition(id),
    onSuccess: () => {
      rafraichir();
      navigate(`/commandes/${id}/addition`);
    },
  });

  const annuler = useMutation({
    mutationFn: () => annulerCommande(id),
    onSuccess: () => {
      rafraichir();
      navigate("/");
    },
  });

  const changerQuantite = (menuId, delta) => {
    setModifie(true);
    setLignes((prec) =>
      prec
        .map((l) => (l.menu_id === menuId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    );
  };

  const changerNote = (menuId, note) => {
    setModifie(true);
    setLignes((prec) => prec.map((l) => (l.menu_id === menuId ? { ...l, note } : l)));
  };

  if (isLoading) return <p className="text-charbon/70">{t("Chargement…")}</p>;

  if (isError || !commande)
    return (
      <div>
        <p className="text-red-700 mb-3">{t("Commande introuvable.")}</p>
        <Link to="/" className="underline">{t("Retour au plan de salle")}</Link>
      </div>
    );

  const ouverte = !["payee", "annulee"].includes(commande.statut);
  const suivante = ACTION_SUIVANTE[commande.statut];
  const erreurs = [avancer, addition, annuler, enregistrer]
    .filter((m) => m.isError)
    .flatMap((m) => messagesErreur(m.error));

  const confirmerAnnulation = () => {
    if (window.confirm(t("Annuler cette commande ? La table sera libérée."))) annuler.mutate();
  };

  return (
    <section>
      <Link to="/" className="text-sm text-charbon/70 hover:text-charbon">
        {t("← Plan de salle")}
      </Link>

      <p className="text-xs uppercase tracking-[0.14em] text-charbon/60 mt-3">
        {t("Commande n°")} {commande.id}
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-1">
        <h1 className="font-titre text-4xl font-medium">{t("Table")} {commande.table?.numero}</h1>
        <BadgeStatut statut={commande.statut} />
      </div>
      <p className="text-sm text-charbon/70 mt-1">{t("Serveur :")} {commande.serveur?.nom}</p>

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 border border-charbon/15 rounded-lg p-4 bg-carte/60">
          <h2 className="font-titre text-xl font-bold mb-3">{t("Plats commandés")}</h2>
          <ul className="space-y-4">
            {lignes.map((l) => (
              <li key={l.menu_id} className="border-b border-charbon/10 pb-3">
                <div className="flex justify-between gap-2">
                  <p className="font-medium">{l.nom}</p>
                  <p>{mad(l.prix_unitaire * l.quantite)}</p>
                </div>
                <p className="text-sm text-charbon/70">
                  {t("{{prix}} l'unité", { prix: mad(l.prix_unitaire) })}
                </p>

                {ouverte ? (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => changerQuantite(l.menu_id, -1)}
                        aria-label={t("Diminuer la quantité")}
                        className="border border-charbon/30 rounded w-7 h-7"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{l.quantite}</span>
                      <button
                        onClick={() => changerQuantite(l.menu_id, 1)}
                        aria-label={t("Augmenter la quantité")}
                        className="border border-charbon/30 rounded w-7 h-7"
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="text"
                      value={l.note ?? ""}
                      onChange={(e) => changerNote(l.menu_id, e.target.value)}
                      placeholder={t("Note (ex. sans oignon)")}
                      className="w-full border border-charbon/20 rounded-md px-2 py-1 mt-2 text-sm bg-transparent"
                    />
                  </>
                ) : (
                  <p className="text-sm mt-1">
                    × {l.quantite}
                    {l.note ? ` · ${l.note}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {modifie && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => enregistrer.mutate()}
                disabled={lignes.length === 0 || enregistrer.isPending}
                className="bg-safran text-sur-safran font-medium rounded-md px-4 py-2 hover:brightness-95 disabled:opacity-50"
              >
                {enregistrer.isPending ? t("Enregistrement…") : t("Enregistrer les modifications")}
              </button>
              <button
                onClick={() => {
                  setModifie(false);
                  setLignes(commande.lignes);
                }}
                className="border border-charbon/30 rounded-md px-4 py-2 text-sm"
              >
                {t("Annuler les modifications")}
              </button>
            </div>
          )}
          {modifie && lignes.length === 0 && (
            <p className="text-sm text-charbon/70 mt-2">
              {t("Pour supprimer tous les plats, annulez la commande.")}
            </p>
          )}
        </div>

        <aside className="self-start border border-charbon/15 rounded-lg p-4 bg-carte/60 space-y-2">
          <h2 className="font-titre text-xl font-bold mb-2">{t("Récapitulatif")}</h2>
          <p className="flex justify-between text-sm">
            <span>{t("Sous-total")}</span>
            <span>{mad(commande.sous_total)}</span>
          </p>
          {commande.remise > 0 && (
            <p className="flex justify-between text-sm">
              <span>{t("Remise")}</span>
              <span>− {mad(commande.remise)}</span>
            </p>
          )}
          <p className="flex justify-between text-sm">
            <span>{t("TVA (10 %)")}</span>
            <span>{mad(commande.tva)}</span>
          </p>
          <p className="flex justify-between font-medium border-t border-charbon/10 pt-2">
            <span>{t("Total")}</span>
            <span>{mad(commande.total)}</span>
          </p>

          {erreurs.length > 0 && (
            <ul className="text-red-700 text-sm space-y-1">
              {erreurs.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}

          {ouverte && (
            <div className="space-y-2 pt-3">
              {suivante && (
                <button
                  onClick={() => avancer.mutate()}
                  disabled={avancer.isPending || modifie}
                  className="w-full border border-charbon/30 rounded-md py-2 text-sm font-medium hover:bg-charbon/5 disabled:opacity-50"
                >
                  {t(suivante)}
                </button>
              )}
              <button
                onClick={() => addition.mutate()}
                disabled={addition.isPending || modifie}
                className="w-full bg-safran text-sur-safran font-medium rounded-md py-2 hover:brightness-95 disabled:opacity-50"
              >
                {t("Demander l'addition")}
              </button>
              <button
                onClick={confirmerAnnulation}
                disabled={annuler.isPending}
                className="w-full text-sm text-red-800 border border-red-700/30 rounded-md py-2 hover:bg-red-50 disabled:opacity-50"
              >
                {t("Annuler la commande")}
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
