/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";

function ProtectedAdmin({ children }) {
  const adminData = JSON.parse(localStorage.getItem("adminData"));

  console.log(adminData);

  if (adminData == null ||adminData == undefined || adminData == "" ) {
    // Use Navigate component within a returned JSX expression
    return <Navigate to={'/admin/login'} />;
  }

  return (
    <div>
      {/* Render the protected content */}
      {children}
    </div>
  );
}

export default ProtectedAdmin;
