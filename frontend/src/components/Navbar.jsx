import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { serveur, deconnecter } = useAuth();

  return (
    <header className="border-b border-charbon/15 bg-creme">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="font-titre text-2xl font-bold">Wajba</span>
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium pb-1 border-b-2 ${
                  isActive
                    ? "border-safran text-charbon"
                    : "border-transparent text-charbon/60 hover:text-charbon"
                }`
              }
            >
              Plan de salle
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <p className="text-sm text-charbon/70 hidden sm:block">
            {serveur.nom ?? serveur.email}
            <span className="ml-2 border border-charbon/20 rounded px-2 py-0.5 text-xs">
              {serveur.role}
            </span>
          </p>
          <button
            onClick={deconnecter}
            className="border border-charbon/30 rounded-md px-3 py-1.5 text-sm hover:bg-charbon/5"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </header>
  );
}
