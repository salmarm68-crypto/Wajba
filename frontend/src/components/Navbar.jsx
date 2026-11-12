import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Preferences from "./Preferences";
import Pastille from "./Pastille";

export default function Navbar() {
  const { t } = useTranslation();
  const { serveur, deconnecter } = useAuth();

  const liens = [
    { to: "/", libelle: "Plan de salle", end: true },
    { to: "/cuisine", libelle: "Cuisine" },
    // Pages réservées au Gérant
    ...(serveur.role === "gerant"
      ? [
          { to: "/gestion/menu", libelle: "Menu" },
          { to: "/gestion/tables", libelle: "Tables" },
          { to: "/gestion/serveurs", libelle: "Serveurs" },
          { to: "/tableau-de-bord", libelle: "Tableau de bord" },
        ]
      : []),
  ];

  return (
    <header className="border-b border-charbon/15 bg-creme">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-nowrap items-center justify-between gap-4">
        <div className="flex items-center gap-5 shrink-0">
          <Logo />
          <nav className="flex flex-nowrap items-center gap-4 whitespace-nowrap">
            {liens.map((lien) => (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.end}
                className={({ isActive }) =>
                  `text-sm font-medium pb-1 border-b-2 ${
                    isActive
                      ? "border-safran text-charbon"
                      : "border-transparent text-charbon/60 hover:text-charbon"
                  }`
                }
              >
                {t(lien.libelle)}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap shrink-0">
          <Preferences />
          <p className="text-sm text-charbon/70 hidden lg:block">
            {serveur.nom ?? serveur.email}
            <span className="ml-2">
              <Pastille>{serveur.role === "gerant" ? "Gérant" : "Serveur"}</Pastille>
            </span>
          </p>
          <button
            onClick={deconnecter}
            className="border border-charbon/30 rounded-md px-3 py-1.5 text-sm hover:bg-charbon/5"
          >
            {t("Se déconnecter")}
          </button>
        </div>
      </div>
    </header>
  );
}
