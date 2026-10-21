export const mad = (valeur) => `${Number(valeur ?? 0).toFixed(2)} MAD`;

export const STATUTS_COMMANDE = {
  en_attente: "En attente",
  en_preparation: "En préparation",
  prete: "Prête",
  servie: "Servie",
  payee: "Payée",
  annulee: "Annulée",
};

// Libellé du bouton qui fait passer la commande au statut suivant.
export const ACTION_SUIVANTE = {
  en_attente: "Lancer la préparation",
  en_preparation: "Marquer prête",
  prete: "Marquer servie",
};

export const MODES_PAIEMENT = [
  { cle: "especes", libelle: "Espèces" },
  { cle: "carte", libelle: "Carte" },
];

// Messages d'erreur renvoyés par l'API Laravel (422, 403, ...).
export const messagesErreur = (erreur, defaut = "Une erreur est survenue.") => {
  const donnees = erreur?.response?.data;
  if (!donnees) return [defaut];
  const details = donnees.errors ? Object.values(donnees.errors).flat() : [];
  return details.length > 0 ? details : [donnees.message ?? defaut];
};

export const CATEGORIES = [
  { cle: "entree", libelle: "Entrées" },
  { cle: "plat", libelle: "Plats" },
  { cle: "dessert", libelle: "Desserts" },
  { cle: "boisson", libelle: "Boissons" },
];

export const STATUTS_TABLE = {
  libre: "Libre",
  occupee: "En service",
  addition_demandee: "Addition demandée",
};

export const ROLES = [
  { cle: "serveur", libelle: "Serveur" },
  { cle: "gerant", libelle: "Gérant" },
];
