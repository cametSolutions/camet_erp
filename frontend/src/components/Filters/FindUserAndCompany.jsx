/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useMemo } from "react";

function FindUserAndCompany({ getUserAndCompany }) {
  const location = useLocation();

  const userType = useMemo(() => {
    if (location.pathname.startsWith("/pUsers")) return "primaryUser";
    if (location.pathname.startsWith("/sUsers")) return "secondaryUser";
    return null;
  }, [location.pathname]);

  const primaryOrg = useSelector(
    (state) => state?.setSelectedOrganization?.selectedOrg
  );
  const secondaryOrg = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  const selectedOrg = useMemo(() => {
    return userType === "primaryUser" ? primaryOrg : secondaryOrg;
  }, [userType, primaryOrg, secondaryOrg]);

  const pathUrl = useMemo(() => {
    return userType === "primaryUser" ? "pUsers" : "sUsers";
  }, [userType, primaryOrg, secondaryOrg]);

  useEffect(() => {
    if (selectedOrg && userType) {
      getUserAndCompany({ org: selectedOrg, userType, pathUrl });
    }
  }, [userType, selectedOrg]);

  return null;
}

export default FindUserAndCompany;
