import { Navigate } from "react-router-dom";
import { subscriptionHasExpired } from "@/components/common/SubscriptionExpiryAlert";

function ProtectedPriRoute({ children }) {
  const priUserData = JSON.parse(localStorage.getItem("pUserData"));


  if (priUserData == null ||priUserData == undefined || priUserData == "" || subscriptionHasExpired(priUserData) ) {
    localStorage.removeItem("pUserData");
    // Use Navigate component within a returned JSX expression
    return <Navigate to={'/pUsers/login'} replace />;
  }

  return (
    <div>
      {/* Render the protected content */}
      {children}
    </div>
  );
}

export default ProtectedPriRoute;
