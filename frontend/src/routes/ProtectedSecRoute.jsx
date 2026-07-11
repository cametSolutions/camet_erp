/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { canAccessPath } from "@/utils/permissions";

function ProtectedSecRoute({ children }) {
  const secUserData = JSON.parse(localStorage.getItem("sUserData"));
  const storedPermissions = JSON.parse(localStorage.getItem("permissions"));
  const location = useLocation();

  if (secUserData == null) {
    // Use Navigate component within a returned JSX expression
    return <Navigate to={"/sUsers/login"} />;
  }

  if (
    !canAccessPath({
      pathname: location.pathname,
      user: secUserData,
      permissions: secUserData?.permissions || storedPermissions || {},
    })
  ) {
    return <Navigate to={"/sUsers/dashboard"} replace />;
  }

  return (
    <div>
      {/* Render the protected content */}
      {children}
    </div>
  );
}

export default ProtectedSecRoute;
