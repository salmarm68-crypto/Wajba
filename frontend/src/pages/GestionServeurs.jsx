import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listerServeurs, modifierServeur, supprimerServeur } from "../api/serveurs";
import { useAuth } from "../context/AuthContext";
import { ROLES, messagesErreur } from "../lib/statuts";

export default function GestionServeurs() {
  const queryClient = useQueryClient();
  const { serveur: moi } = useAuth();
  const [edition, setEdition] = useState(null);

  const { data: serveurs, isLoading, isError } = useQuery({
    queryKey: ["serveurs"],
    queryFn: listerServeurs,
  });

  const rafraichir = () => queryClient.invalidateQueries({ queryKey: ["serveurs"] });

  const enregistrer = useMutation({
    mutationFn: modifierServeur,
    onSuccess: () => {
      rafraichir();
      setEdition(null);
    },
  });
  const supprimer = useMutation({ mutationFn: supprimerServeur, onSuccess: rafraichir });

  const soumettre = (e) => {
    e.preventDefault();
    const donnees = {
      id: edition.id,
      nom: edition.nom.trim(),
      email: edition.email.trim(),
      role: edition.role,
    };
    if (edition.mot_de_passe) donnees.mot_de_passe = edition.mot_de_passe;
    enregistrer.mutate(donnees);
  };

  const confirmerSuppression = (serveur) => {
    if (window.confirm(`Supprimer le compte de ${serveur.nom} ?`)) supprimer.mutate(serveur.id);
  };

  const erreurs = [enregistrer, supprimer]
    .filter((m) => m.isError)
    .flatMap((m) => messagesErreur(m.error));

  const saisie = "w-full border border-charbon/20 rounded-md px-3 py-2 bg-transparent";
  const libelleRole = (cle) => ROLES.find((r) => r.cle === cle)?.libelle ?? cle;

  return (
    <section>
      <h1 className="font-titre text-3xl font-bold">Gestion des serveurs</h1>
      <p className="text-sm text-charbon/70 mt-1">
        Les nouveaux serveurs créent leur compte depuis la page d'inscription. Vous pouvez
        ensuite modifier leurs informations, changer leur rôle ou supprimer leur compte.
      </p>

      {edition && (
        <form
          onSubmit={soumettre}
          className="mt-6 border border-charbon/15 rounded-lg p-4 bg-white/60 grid sm:grid-cols-2 gap-4 max-w-2xl"
        >
          <h2 className="font-titre text-xl font-bold sm:col-span-2">Modifier le compte</h2>

          <div>
            <label htmlFor="nom" className="block text-sm font-medium mb-1">Nom</label>
            <input
              id="nom" required maxLength={100} value={edition.nom}
              onChange={(e) => setEdition({ ...edition, nom: e.target.value })}
              className={saisie}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
            <input
              id="email" type="email" required value={edition.email}
              onChange={(e) => setEdition({ ...edition, email: e.target.value })}
              className={saisie}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">Rôle</label>
            <select
              id="role" value={edition.role}
              onChange={(e) => setEdition({ ...edition, role: e.target.value })}
              className={saisie}
            >
              {ROLES.map((r) => (
                <option key={r.cle} value={r.cle}>{r.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mdp" className="block text-sm font-medium mb-1">
              Nouveau mot de passe (facultatif)
            </label>
            <input
              id="mdp" type="password" minLength={8} value={edition.mot_de_passe}
              onChange={(e) => setEdition({ ...edition, mot_de_passe: e.target.value })}
              className={saisie}
            />
          </div>

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
              Enregistrer
            </button>
            <button
              type="button" onClick={() => setEdition(null)}
              className="border border-charbon/30 rounded-md px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {!edition && erreurs.length > 0 && (
        <ul className="text-red-700 text-sm mt-4 space-y-1">
          {erreurs.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      {isLoading && <p className="text-charbon/70 mt-8">Chargement…</p>}
      {isError && <p className="text-red-700 mt-8">Impossible de charger les serveurs.</p>}

      {serveurs && (
        <ul className="space-y-2 mt-8">
          {serveurs.map((s) => (
            <li
              key={s.id}
              className="border border-charbon/15 rounded-lg p-3 bg-white/60 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium">
                  {s.nom}
                  <span className="ml-2 text-xs border border-charbon/30 rounded px-2 py-0.5">
                    {libelleRole(s.role)}
                  </span>
                  {s.id === moi?.id && (
                    <span className="ml-2 text-xs text-charbon/60">(vous)</span>
                  )}
                </p>
                <p className="text-sm text-charbon/70">{s.email}</p>
              </div>

              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setEdition({ ...s, mot_de_passe: "" })}
                  className="border border-charbon/30 rounded-md px-3 py-1.5 hover:bg-charbon/5"
                >
                  Modifier
                </button>
                <button
                  onClick={() => confirmerSuppression(s)}
                  disabled={supprimer.isPending || s.id === moi?.id}
                  title={s.id === moi?.id ? "Vous ne pouvez pas supprimer votre propre compte" : ""}
                  className="text-red-800 border border-red-700/30 rounded-md px-3 py-1.5 hover:bg-red-50 disabled:opacity-40"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
