import { Route, Routes } from "react-router-dom";
import RouteProtegee from "./components/RouteProtegee";
import Connexion from "./pages/Connexion";
import PlanDeSalle from "./pages/PlanDeSalle";

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />
      <Route element={<RouteProtegee />}>
        <Route path="/" element={<PlanDeSalle />} />
      </Route>
    </Routes>
  );
}