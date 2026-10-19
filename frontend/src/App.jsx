import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RouteProtegee from "./components/RouteProtegee";
import Connexion from "./pages/Connexion";
import PlanDeSalle from "./pages/PlanDeSalle";
import PriseCommande from "./pages/PriseCommande";

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route element={<RouteProtegee />}>
        <Route element={<Layout />}>
          <Route path="/" element={<PlanDeSalle />} />
          <Route path="/tables/:id/commande" element={<PriseCommande />} />
        </Route>
      </Route>
    </Routes>
  );
}
