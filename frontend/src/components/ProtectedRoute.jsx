import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, session }) {
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
