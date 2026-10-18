import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RouteProtegee({ roles }) {
  const { serveur } = useAuth();
  if (!serveur) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(serveur.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}