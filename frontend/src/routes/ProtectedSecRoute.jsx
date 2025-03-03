/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

function ProtectedSecRoute({ children }) {
  const secUserData = JSON.parse(localStorage.getItem("sUserData"));

  
  if (secUserData == null) {
    // Use Navigate component within a returned JSX expression
    return <Navigate to={'/sUsers/login'} />;
  }

  return (
    <div>
      {/* Render the protected content */}
      {children}
    </div>
  );
}

export default ProtectedSecRoute;
