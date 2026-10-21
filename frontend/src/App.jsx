import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RouteProtegee from "./components/RouteProtegee";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import PlanDeSalle from "./pages/PlanDeSalle";
import PriseCommande from "./pages/PriseCommande";
import DetailCommande from "./pages/DetailCommande";
import Cuisine from "./pages/Cuisine";
import Addition from "./pages/Addition";
import GestionMenu from "./pages/GestionMenu";
import GestionTables from "./pages/GestionTables";
import GestionServeurs from "./pages/GestionServeurs";

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />

      {/* Serveur et Gérant */}
      <Route element={<RouteProtegee />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PlanDeSalle />} />
          <Route path="/tables/:id/commande" element={<PriseCommande />} />
          <Route path="/commandes/:id" element={<DetailCommande />} />
          <Route path="/commandes/:id/addition" element={<Addition />} />
          <Route path="/cuisine" element={<Cuisine />} />

          {/* Gérant seulement : les autres rôles sont renvoyés vers le plan de salle */}
          <Route element={<RouteProtegee roles={["gerant"]} />}>
            <Route path="/gestion/menu" element={<GestionMenu />} />
            <Route path="/gestion/tables" element={<GestionTables />} />
            <Route path="/gestion/serveurs" element={<GestionServeurs />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
