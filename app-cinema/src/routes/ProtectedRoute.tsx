import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/UseAuth";

interface Props {
  rolesPermitidos?: string[];
}

function ProtectedRoute({ rolesPermitidos }: Props) {
  const { auth, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Si se especifican roles permitidos, verificamos si el usuario tiene alguno de esos roles
  if (rolesPermitidos && rolesPermitidos.length > 0) {
    const tieneRol = auth?.roles.some(r =>
      rolesPermitidos.includes(r)
    );

    if (!tieneRol) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;