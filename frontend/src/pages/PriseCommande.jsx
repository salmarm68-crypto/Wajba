import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listerMenus } from "../api/menus";
import { listerTables } from "../api/tables";
import { creerCommande } from "../api/commandes";
import Pastille from "../components/Pastille";
import { CATEGORIES, mad, messagesErreur } from "../lib/statuts";

const SINGULIER = { entree: "Entrée", plat: "Plat", dessert: "Dessert", boisson: "Boisson" };

export default function PriseCommande() {
  const { t } = useTranslation();
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [recherche, setRecherche] = useState("");
  const [onglet, setOnglet] = useState(null);
  const [lignes, setLignes] = useState([]);

  const menusQuery = useQuery({ queryKey: ["menus"], queryFn: listerMenus });
  const tablesQuery = useQuery({ queryKey: ["tables"], queryFn: listerTables });
  const table = tablesQuery.data?.find((t) => t.id === tableId);

  const envoyer = useMutation({
    mutationFn: creerCommande,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      navigate("/");
    },
  });

  const menus = menusQuery.data ?? [];

  // Onglet par défaut : « Plats » s'il y en a, sinon la première catégorie non vide.
  const categorieActive =
    onglet ??
    (menus.some((m) => m.categorie === "plat")
      ? "plat"
      : CATEGORIES.find((c) => menus.some((m) => m.categorie === c.cle))?.cle);

  const terme = recherche.trim().toLowerCase();
  const visibles = menus.filter((m) =>
    terme ? m.nom.toLowerCase().includes(terme) : m.categorie === categorieActive
  );

  const quantites = Object.fromEntries(lignes.map((l) => [l.menu.id, l.quantite]));
  const sousTotal = lignes.reduce((somme, l) => somme + Number(l.menu.prix) * l.quantite, 0);
  const tva = Math.round(sousTotal * 10) / 100;
  const total = sousTotal + tva;

  const ajouter = (menu) =>
    setLignes((precedentes) => {
      const existante = precedentes.find((l) => l.menu.id === menu.id);
      if (existante) {
        return precedentes.map((l) =>
          l.menu.id === menu.id ? { ...l, quantite: l.quantite + 1 } : l
        );
      }
      return [...precedentes, { menu, quantite: 1, note: "" }];
    });

  const changerQuantite = (menuId, delta) =>
    setLignes((precedentes) =>
      precedentes
        .map((l) => (l.menu.id === menuId ? { ...l, quantite: l.quantite + delta } : l))
        .filter((l) => l.quantite > 0)
    );

  const changerNote = (menuId, note) =>
    setLignes((precedentes) =>
      precedentes.map((l) => (l.menu.id === menuId ? { ...l, note } : l))
    );

  const soumettre = () => {
    envoyer.mutate({
      table_id: tableId,
      lignes: lignes.map((l) => ({
        menu_id: l.menu.id,
        quantite: l.quantite,
        note: l.note.trim() || null,
      })),
    });
  };

  if (menusQuery.isLoading || tablesQuery.isLoading)
    return <p className="text-charbon/70">{t("Chargement…")}</p>;

  if (menusQuery.isError || tablesQuery.isError || !table)
    return (
      <div>
        <p className="text-red-700 mb-3">{t("Table ou menu introuvable.")}</p>
        <Link to="/" className="underline">{t("Retour au plan de salle")}</Link>
      </div>
    );

  if (table.statut !== "libre")
    return (
      <div>
        <p className="mb-3">La table {table.numero} n'est pas libre.</p>
        <Link to="/" className="underline">{t("Retour au plan de salle")}</Link>
      </div>
    );

  return (
    <section>
      <Link to="/" className="text-sm text-charbon/70 hover:text-charbon">
        {t("← Plan de salle")}
      </Link>
      <p className="text-xs uppercase tracking-[0.14em] text-charbon/60 mt-3">
        {t("Table")} {table.numero} · {table.capacite} {table.capacite > 1 ? t("couverts") : t("couvert")}
      </p>
      <h1 className="font-titre text-4xl font-medium mt-1">{t("Prise de commande")}</h1>

      <div className="grid lg:grid-cols-[1fr_22rem] gap-8 mt-6">
        <div>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("Rechercher un plat")}
            className="w-full border border-charbon/15 rounded-full px-5 py-2.5 mb-4 bg-carte/60"
          />

          <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label={t("Catégories")}>
            {CATEGORIES.map((c) => {
              const active = !terme && c.cle === categorieActive;
              return (
                <button
                  key={c.cle}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setOnglet(c.cle);
                    setRecherche("");
                  }}
                  className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-safran border-safran text-charbon font-medium"
                      : "border-charbon/15 bg-carte/60 text-charbon/70 hover:border-safran"
                  }`}
                >
                  {t(c.libelle)}
                </button>
              );
            })}
          </div>

          {visibles.length === 0 && (
            <p className="text-charbon/70">
              {terme ? t("Aucun plat ne correspond à la recherche.") : t("Aucun plat dans cette catégorie.")}
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {visibles.map((menu) => {
              const quantite = quantites[menu.id] ?? 0;
              return (
                <article
                  key={menu.id}
                  className={`rounded-xl border p-5 flex flex-col transition-colors ${
                    !menu.disponible
                      ? "border-charbon/10 bg-white/40 opacity-60"
                      : quantite > 0
                        ? "border-safran bg-safran/10"
                        : "border-charbon/15 bg-carte"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-charbon/50">
                    {t(SINGULIER[menu.categorie] ?? menu.categorie)}
                  </p>
                  <h3 className="font-titre text-xl font-semibold mt-1">{menu.nom}</h3>
                  {menu.description && (
                    <p className="text-sm text-charbon/60 mt-2">{menu.description}</p>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-auto pt-4">
                    <p className="flex items-center gap-2">
                      <span>{mad(menu.prix)}</span>
                      {quantite > 0 && (
                        <span className="rounded-full bg-safran text-sur-safran text-xs font-semibold px-2.5 py-0.5">
                          × {quantite}
                        </span>
                      )}
                    </p>
                    {menu.disponible ? (
                      <button
                        onClick={() => ajouter(menu)}
                        aria-label={`${t("Ajouter")} ${menu.nom}`}
                        className={`shrink-0 w-10 h-10 rounded-full border text-xl leading-none transition-colors ${
                          quantite > 0
                            ? "bg-safran border-safran text-charbon"
                            : "border-safran-fonce text-safran-fonce hover:bg-safran/15"
                        }`}
                      >
                        +
                      </button>
                    ) : (
                      <Pastille ton="rouge">{t("Indisponible")}</Pastille>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 self-start rounded-xl border border-charbon/15 p-5 bg-carte">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-titre text-2xl font-medium">Table {table.numero}</h2>
            <Pastille ton="ambre">{t("Nouvelle commande")}</Pastille>
          </div>

          {lignes.length === 0 ? (
            <p className="text-sm text-charbon/60">{t("Aucun plat ajouté.")}</p>
          ) : (
            <ul>
              {lignes.map((l) => (
                <li key={l.menu.id} className="py-3 border-b border-charbon/10 last:border-0">
                  <div className="flex items-start gap-2">
                    <p className="text-sm flex-1">{l.menu.nom}</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changerQuantite(l.menu.id, -1)}
                        aria-label={t("Diminuer la quantité")}
                        className="w-8 h-8 rounded-lg border border-charbon/20 hover:border-safran"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{l.quantite}</span>
                      <button
                        onClick={() => changerQuantite(l.menu.id, 1)}
                        aria-label={t("Augmenter la quantité")}
                        className="w-8 h-8 rounded-lg border border-charbon/20 hover:border-safran"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm w-20 text-right">{mad(Number(l.menu.prix) * l.quantite)}</p>
                  </div>
                  <input
                    type="text"
                    value={l.note}
                    onChange={(e) => changerNote(l.menu.id, e.target.value)}
                    placeholder={t("Note (ex. sans oignon)")}
                    className="w-full border border-charbon/15 rounded-lg px-2.5 py-1 mt-2 text-sm bg-transparent"
                  />
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-charbon/10 mt-3 pt-3 space-y-1 text-sm">
            <p className="flex justify-between text-charbon/70">
              <span>{t("Sous-total")}</span>
              <span>{mad(sousTotal)}</span>
            </p>
            <p className="flex justify-between text-charbon/70">
              <span>{t("TVA 10 %")}</span>
              <span>{mad(tva)}</span>
            </p>
            <p className="flex justify-between items-baseline pt-1">
              <span className="font-semibold">{t("Total")}</span>
              <span className="font-titre text-xl font-semibold text-safran-fonce">{mad(total)}</span>
            </p>
          </div>

          {envoyer.isError && (
            <ul className="text-red-700 text-sm mt-3 space-y-1">
              {messagesErreur(envoyer.error, "Impossible d'envoyer la commande.").map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          <button
            onClick={soumettre}
            disabled={lignes.length === 0 || envoyer.isPending}
            className="w-full mt-4 bg-safran text-sur-safran font-medium rounded-lg py-2.5 hover:brightness-95 disabled:opacity-50"
          >
            {envoyer.isPending ? t("Envoi…") : t("Envoyer en cuisine")}
          </button>
        </aside>
      </div>
    </section>
  );
}
