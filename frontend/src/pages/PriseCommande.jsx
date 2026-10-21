import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listerMenus } from "../api/menus";
import { listerTables } from "../api/tables";
import { creerCommande } from "../api/commandes";

const CATEGORIES = [
  { cle: "entree", libelle: "Entrées" },
  { cle: "plat", libelle: "Plats" },
  { cle: "dessert", libelle: "Desserts" },
  { cle: "boisson", libelle: "Boissons" },
];

const mad = (valeur) => `${Number(valeur).toFixed(2)} MAD`;

export default function PriseCommande() {
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [recherche, setRecherche] = useState("");
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

  const menusParCategorie = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    const menus = (menusQuery.data ?? []).filter((m) =>
      m.nom.toLowerCase().includes(terme)
    );

    const groupes = CATEGORIES.map((c) => ({
      ...c,
      menus: menus.filter((m) => m.categorie === c.cle),
    }));

    const autres = menus.filter(
      (m) => !CATEGORIES.some((c) => c.cle === m.categorie)
    );
    if (autres.length > 0) groupes.push({ cle: "autres", libelle: "Autres", menus: autres });

    return groupes.filter((g) => g.menus.length > 0);
  }, [menusQuery.data, recherche]);

  const total = lignes.reduce((somme, l) => somme + Number(l.menu.prix) * l.quantite, 0);

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

  const messagesErreur = () => {
    const donnees = envoyer.error?.response?.data;
    if (!donnees) return ["Impossible d'envoyer la commande."];
    const details = donnees.errors ? Object.values(donnees.errors).flat() : [];
    return details.length > 0 ? details : [donnees.message ?? "Erreur inconnue."];
  };

  if (menusQuery.isLoading || tablesQuery.isLoading)
    return <p className="text-charbon/70">Chargement…</p>;

  if (menusQuery.isError || tablesQuery.isError || !table)
    return (
      <div>
        <p className="text-red-700 mb-3">Table ou menu introuvable.</p>
        <Link to="/" className="underline">Retour au plan de salle</Link>
      </div>
    );

  if (table.statut !== "libre")
    return (
      <div>
        <p className="mb-3">La table {table.numero} n'est pas libre.</p>
        <Link to="/" className="underline">Retour au plan de salle</Link>
      </div>
    );

  return (
    <section>
      <Link to="/" className="text-sm text-charbon/70 hover:text-charbon">
        ← Plan de salle
      </Link>
      <h1 className="font-titre text-3xl font-bold mt-2">
        Nouvelle commande · Table {table.numero}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un plat"
            className="w-full border border-charbon/20 rounded-md px-3 py-2 mb-6 bg-transparent"
          />

          {menusParCategorie.length === 0 && (
            <p className="text-charbon/70">Aucun plat ne correspond à la recherche.</p>
          )}

          {menusParCategorie.map((categorie) => (
            <div key={categorie.cle} className="mb-8">
              <h2 className="font-titre text-xl font-bold mb-3">{categorie.libelle}</h2>
              <ul className="space-y-2">
                {categorie.menus.map((menu) => (
                  <li
                    key={menu.id}
                    className="border border-charbon/15 rounded-lg p-3 bg-white/60 flex items-center justify-between gap-4"
                  >
                    <div className={menu.disponible ? "" : "opacity-50"}>
                      <p className="font-medium">{menu.nom}</p>
                      <p className="text-sm text-charbon/70">{menu.description}</p>
                      <p className="text-sm mt-1">{mad(menu.prix)}</p>
                    </div>
                    {menu.disponible ? (
                      <button
                        onClick={() => ajouter(menu)}
                        className="shrink-0 bg-safran text-charbon text-sm font-medium rounded-md px-3 py-1.5 hover:brightness-95"
                      >
                        Ajouter
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs border border-charbon/20 rounded px-2 py-1 text-charbon/60">
                        Indisponible
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-6 self-start border border-charbon/15 rounded-lg p-4 bg-white/60">
          <h2 className="font-titre text-xl font-bold mb-3">Commande</h2>

          {lignes.length === 0 ? (
            <p className="text-sm text-charbon/70">Aucun plat ajouté.</p>
          ) : (
            <ul className="space-y-4">
              {lignes.map((l) => (
                <li key={l.menu.id} className="border-b border-charbon/10 pb-3">
                  <div className="flex justify-between gap-2">
                    <p className="font-medium text-sm">{l.menu.nom}</p>
                    <p className="text-sm">{mad(Number(l.menu.prix) * l.quantite)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => changerQuantite(l.menu.id, -1)}
                      aria-label="Diminuer la quantité"
                      className="border border-charbon/30 rounded w-7 h-7"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{l.quantite}</span>
                    <button
                      onClick={() => changerQuantite(l.menu.id, 1)}
                      aria-label="Augmenter la quantité"
                      className="border border-charbon/30 rounded w-7 h-7"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="text"
                    value={l.note}
                    onChange={(e) => changerNote(l.menu.id, e.target.value)}
                    placeholder="Note (ex. sans oignon)"
                    className="w-full border border-charbon/20 rounded-md px-2 py-1 mt-2 text-sm bg-transparent"
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="flex justify-between font-medium mt-4">
            <span>Sous-total</span>
            <span>{mad(total)}</span>
          </p>

          {envoyer.isError && (
            <ul className="text-red-700 text-sm mt-3 space-y-1">
              {messagesErreur().map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          <button
            onClick={soumettre}
            disabled={lignes.length === 0 || envoyer.isPending}
            className="w-full mt-4 bg-safran text-charbon font-medium rounded-md py-2 hover:brightness-95 disabled:opacity-50"
          >
            {envoyer.isPending ? "Envoi…" : "Envoyer en cuisine"}
          </button>
        </aside>
      </div>
    </section>
  );
}