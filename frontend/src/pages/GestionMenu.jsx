import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  basculerDisponibilite,
  creerMenu,
  listerMenus,
  modifierMenu,
  supprimerMenu,
} from "../api/menus";
import { CATEGORIES, mad, messagesErreur } from "../lib/statuts";

const VIDE = {
  id: null,
  nom: "",
  description: "",
  prix: "",
  categorie: "plat",
  image: "",
  disponible: true,
};

export default function GestionMenu() {
  const queryClient = useQueryClient();
  const [formulaire, setFormulaire] = useState(VIDE);
  const [recherche, setRecherche] = useState("");

  const { data: menus, isLoading, isError } = useQuery({
    queryKey: ["menus"],
    queryFn: listerMenus,
  });

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: ["menus"] });

  const enregistrer = useMutation({
    mutationFn: ({ id, ...donnees }) =>
      id ? modifierMenu({ id, ...donnees }) : creerMenu(donnees),
    onSuccess: () => {
      rafraichir();
      setFormulaire(VIDE);
    },
  });
  const basculer = useMutation({ mutationFn: basculerDisponibilite, onSuccess: rafraichir });
  const supprimer = useMutation({ mutationFn: supprimerMenu, onSuccess: rafraichir });

  const groupes = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    const liste = (menus ?? []).filter((m) => m.nom.toLowerCase().includes(terme));
    return CATEGORIES.map((c) => ({ ...c, menus: liste.filter((m) => m.categorie === c.cle) }))
      .filter((g) => g.menus.length > 0);
  }, [menus, recherche]);

  const champ = (nom, valeur) => setFormulaire((f) => ({ ...f, [nom]: valeur }));

  const soumettre = (e) => {
    e.preventDefault();
    enregistrer.mutate({
      id: formulaire.id,
      nom: formulaire.nom.trim(),
      description: formulaire.description.trim() || null,
      prix: Number(formulaire.prix),
      categorie: formulaire.categorie,
      image: formulaire.image.trim() || null,
      disponible: formulaire.disponible,
    });
  };

  const modifier = (menu) => {
    setFormulaire({
      id: menu.id,
      nom: menu.nom,
      description: menu.description ?? "",
      prix: String(menu.prix),
      categorie: menu.categorie,
      image: menu.image ?? "",
      disponible: menu.disponible,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmerSuppression = (menu) => {
    if (window.confirm(`Supprimer « ${menu.nom} » du menu ?`)) supprimer.mutate(menu.id);
  };

  const erreurs = [enregistrer, basculer, supprimer]
    .filter((m) => m.isError)
    .flatMap((m) => messagesErreur(m.error));

  const saisie = "w-full border border-charbon/20 rounded-md px-3 py-2 bg-transparent";

  return (
    <section>
      <h1 className="font-titre text-3xl font-bold">Gestion du menu</h1>
      <p className="text-sm text-charbon/70 mt-1">
        Ajoutez, modifiez ou retirez des plats. Un plat indisponible ne peut plus être commandé.
      </p>

      <form
        onSubmit={soumettre}
        className="mt-6 border border-charbon/15 rounded-lg p-4 bg-white/60 grid sm:grid-cols-2 gap-4"
      >
        <h2 className="font-titre text-xl font-bold sm:col-span-2">
          {formulaire.id ? "Modifier le plat" : "Nouveau plat"}
        </h2>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium mb-1">Nom</label>
          <input
            id="nom" required maxLength={120} value={formulaire.nom}
            onChange={(e) => champ("nom", e.target.value)} className={saisie}
          />
        </div>

        <div>
          <label htmlFor="prix" className="block text-sm font-medium mb-1">Prix (MAD)</label>
          <input
            id="prix" type="number" min="0" step="0.01" required value={formulaire.prix}
            onChange={(e) => champ("prix", e.target.value)} className={saisie}
          />
        </div>

        <div>
          <label htmlFor="categorie" className="block text-sm font-medium mb-1">Catégorie</label>
          <select
            id="categorie" value={formulaire.categorie}
            onChange={(e) => champ("categorie", e.target.value)} className={saisie}
          >
            {CATEGORIES.map((c) => (
              <option key={c.cle} value={c.cle}>{c.libelle}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium mb-1">
            Image (adresse, facultatif)
          </label>
          <input
            id="image" value={formulaire.image}
            onChange={(e) => champ("image", e.target.value)} className={saisie}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description" rows={2} value={formulaire.description}
            onChange={(e) => champ("description", e.target.value)} className={saisie}
          />
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox" checked={formulaire.disponible}
            onChange={(e) => champ("disponible", e.target.checked)}
          />
          Plat disponible
        </label>

        {erreurs.length > 0 && (
          <ul className="text-red-700 text-sm space-y-1 sm:col-span-2">
            {erreurs.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit" disabled={enregistrer.isPending}
            className="bg-safran text-charbon font-medium rounded-md px-4 py-2 hover:brightness-95 disabled:opacity-50"
          >
            {formulaire.id ? "Enregistrer les modifications" : "Ajouter le plat"}
          </button>
          {formulaire.id && (
            <button
              type="button" onClick={() => setFormulaire(VIDE)}
              className="border border-charbon/30 rounded-md px-4 py-2 text-sm"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <input
        type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un plat"
        className="w-full border border-charbon/20 rounded-md px-3 py-2 mt-8 mb-6 bg-transparent"
      />

      {isLoading && <p className="text-charbon/70">Chargement…</p>}
      {isError && <p className="text-red-700">Impossible de charger le menu.</p>}
      {!isLoading && !isError && groupes.length === 0 && (
        <p className="text-charbon/70">Aucun plat.</p>
      )}

      {groupes.map((groupe) => (
        <div key={groupe.cle} className="mb-8">
          <h2 className="font-titre text-xl font-bold mb-3">{groupe.libelle}</h2>
          <ul className="space-y-2">
            {groupe.menus.map((menu) => (
              <li
                key={menu.id}
                className="border border-charbon/15 rounded-lg p-3 bg-white/60 flex flex-wrap items-center justify-between gap-3"
              >
                <div className={menu.disponible ? "" : "opacity-60"}>
                  <p className="font-medium">
                    {menu.nom}
                    {!menu.disponible && (
                      <span className="ml-2 text-xs border border-charbon/30 rounded px-2 py-0.5">
                        Indisponible
                      </span>
                    )}
                  </p>
                  {menu.description && (
                    <p className="text-sm text-charbon/70">{menu.description}</p>
                  )}
                  <p className="text-sm mt-1">{mad(menu.prix)}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    onClick={() => modifier(menu)}
                    className="border border-charbon/30 rounded-md px-3 py-1.5 hover:bg-charbon/5"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => basculer.mutate(menu.id)}
                    disabled={basculer.isPending}
                    className="border border-charbon/30 rounded-md px-3 py-1.5 hover:bg-charbon/5 disabled:opacity-50"
                  >
                    {menu.disponible ? "Rendre indisponible" : "Rendre disponible"}
                  </button>
                  <button
                    onClick={() => confirmerSuppression(menu)}
                    disabled={supprimer.isPending}
                    className="text-red-800 border border-red-700/30 rounded-md px-3 py-1.5 hover:bg-red-50 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
