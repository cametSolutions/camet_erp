/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import AddOrganisation from "../../components/homePage/AddOrganisation";
import Sidebar from "../../components/homePage/Sidebar";
import OrganizationList from "../../components/homePage/OrganisationList";
import AddSecUsers from "../../components/homePage/AddSecUsers";
import SecUsersList from "../../components/homePage/SecUsersList";
import Outstanding from "./Outstanding";
import OutStandingDetails from "./OutStandingDetails";
import Payment from "./Payment";


const Home = () => {
  const [tab, setTab] = useState("addOrganizations");
  const [selectedOutstanding, setSelectedOutstanding] = useState("")
  const [cmp_id, setCmp_id] = useState("")
  const [total, setTotal] = useState("")

  const handleTabChange = (newTab,id,cmp_id,totalBill) => {
    setTab(newTab);
    if (id !== undefined) {
      setSelectedOutstanding(id);
    }
    if (cmp_id !== undefined) {
      setCmp_id(cmp_id);
    }
    if (totalBill !== undefined) {
      setTotal(totalBill);
    }
  };


  return (
    <div className="flex overflow-hidden">
      <div className="overflow-y-hidden" style={{ height: "100vh" }}>
        <Sidebar onTabChange={handleTabChange} />
      </div>

      <div className="flex-1 ">
        {tab === "addOrganizations" && <AddOrganisation className="overflow-y-auto" />}
        {tab === "organizationList" && (
          <div className="flex-grow">
            <OrganizationList className="overflow-y-auto" />
          </div>
        )}
        {tab === "addAgents" && <AddSecUsers />}
        {tab === "agentLIst" && <SecUsersList className="overflow-y-auto" />}
        {tab === "outstanding" && <Outstanding onTabChange={handleTabChange}    />}
        {tab === "outStandingDetails" && <OutStandingDetails onTabChange={handleTabChange} id={selectedOutstanding} cmp_id={cmp_id} total={total} />}
        {tab === "payment" && <Payment onTabChange={handleTabChange} />}
      </div>
    </div>
  );
};

export default Home;
