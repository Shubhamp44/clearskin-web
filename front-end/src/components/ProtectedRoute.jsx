

import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  // Token ya user nahi hai to Login page
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  const role = user.role;

  // Role missing hai to login par bhejo
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Allowed role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Admin ko admin dashboard par, user ko home par bhejo
    return (
      <Navigate
        to={role === "admin" ? "/admin" : "/"}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
