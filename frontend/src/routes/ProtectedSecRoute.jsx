/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { canAccessPath } from "@/utils/permissions";
import { toast } from "sonner";

function ProtectedSecRoute({ children }) {
  const secUserData = JSON.parse(localStorage.getItem("sUserData"));
  const storedPermissions = JSON.parse(localStorage.getItem("permissions"));
  const location = useLocation();

  if (secUserData == null) {
    // Use Navigate component within a returned JSX expression
    return <Navigate to={"/sUsers/login"} />;
  }

  let selectedPath = location.pathname;
  console.log(selectedPath);
  if (selectedPath ==  '/sUsers/editChecking') {
    const isTariffRateChange = location?.state?.fromDashboard === true;
    console.log(isTariffRateChange);
    selectedPath = isTariffRateChange
      ? "/sUsers/tariffRateChange"
      : "/sUsers/editChecking";
  }
  if(selectedPath == "/sUsers/BillSummary"){
  const searchParams = new URLSearchParams(location.search);
   const type = searchParams.get("type");
   console.log(type);
   if(type == "restaurant"){
    selectedPath = `/sUsers/restaurantDailySales`;
   } else if (type == "hotel"){
    selectedPath = `/sUsers/hotelDailySales`;
   }else {
    selectedPath = `/sUsers/BillSummary`;
   }
  }
    if(selectedPath == "/sUsers/Receiptreport"){
  const searchParams = new URLSearchParams(location.search);
   const type = searchParams.get("type");
   console.log(type);
   if(type == "restaurant"){
    selectedPath = `/sUsers/restaurantReceiptReport`;
   } else{
    selectedPath = `/sUsers/Receiptreport`;
   }
  }

  if (
    !canAccessPath({
      pathname: selectedPath,
      user: secUserData,
      permissions: secUserData?.permissions || storedPermissions || {},
    })
  ) {
    toast.error("You do not have permission to access this page.");
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
