import { Navigate } from "react-router-dom";

function ProtectedSecRoute({ children }) {
  const secUserData = JSON.parse(localStorage.getItem("sUserData"));

  console.log(secUserData);

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
