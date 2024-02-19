/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import PrimaryUsers from "./PrimaryUsers";
import Organizations from "./Organizations";
import SecUsersListAdmin from "./SecUsersListAdmin";
import SecUsersListAdminBlocked from "./SecUsersListAdminBlocked";
import OrganisationsBlocked from "./OrganizationsBlocked";
const AdminHome = () => {
  const [tab, setTab] = useState("pUsers");

  const handleTabChange = (newTab) => {
    setTab(newTab);
  };

  console.log(tab);

  return (
    <div className="flex">
      <div className="overflow-y-hidden z-50" style={{ height: "100vh" }}>
        <AdminSidebar onTabChange={handleTabChange} />
      </div>

      <div className="flex-1 overflow-x-auto">
        {tab === "pUsers" && <PrimaryUsers    />}
        {tab === "secUsersLive" && <SecUsersListAdmin  />}
        {tab === "secUsersBlocked" && <SecUsersListAdminBlocked className="overflow-y-auto" />}
        {tab === "organizationListLive" && (
          <Organizations className="overflow-y-auto" />
        )}
        {tab === "organizationListBlocked" && (
          <OrganisationsBlocked className="overflow-y-auto" />
        )}
      </div>
    </div>
  );
};

export default AdminHome;
