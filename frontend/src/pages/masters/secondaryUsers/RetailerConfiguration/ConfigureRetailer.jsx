import SettingsCard from "@/components/common/SettingsCard";
import TitleDiv from "@/components/common/TitleDiv";
import {
  HiOfficeBuilding,
  HiCurrencyDollar,
  HiLocationMarker,
  HiUserGroup,
  HiTruck,
  HiDocumentText,
  HiUsers,
} from "react-icons/hi";
import { useLocation } from "react-router-dom";

export default function ConfigureRetailer() {
  const location = useLocation();
  const userData = location.state || {};

  const tiles = [
    {
      title: "SET COMPANIES",
      description: "Configure and manage company profiles",
      icon: <HiOfficeBuilding />,
      to: "/sUsers/allocateCompany",
      active: true,
      data: { userData },
    },
    {
      title: "SET PRICE LEVEL",
      description: "Define pricing tiers and discount levels",
      icon: <HiCurrencyDollar />,
      to: "/sUsers/allocatePriceLevel",
      active: true,
      data: { userData },
    },
    {
      title: "SET LOCATION",
      description: "Manage warehouse and branch locations",
      icon: <HiLocationMarker />,
      to: "/sUsers/allocateGodown",
      active: true,
      data: { userData },
    },
    {
      title: "SET VAN",
      description: "Configure delivery vehicles and routes",
      icon: <HiTruck />,
      to: "/sUsers/allocateVanSaleGodown",
      active: true,
      data: { userData },
    },

    {
      title: "SET SERIES TYPE",
      description: "Define document series and numbering",
      icon: <HiDocumentText />,
      to: "/sUsers/allocateSeries",
      active: true,
      data: { userData },
    },
    {
      title: "UPDATE CUSTOMER GROUP",
      description: "Organize customers into groups and categories",
      icon: <HiUserGroup />,
      to: "/sUsers/allocateSubGroups",
      active: true,
      data: { userData },
    },
    {
      title: "SET PAGES",
      description: "Configure staff roles and system permissions",
      icon: <HiUsers />,
      to: "/sUsers/SetPages",
      active: true,
      data: { userData },
    },
  ];

  return (
    <>
      <TitleDiv title="Configure User" />

      <section>
        <div className="space-y-4 b-white p-4   mx-1">
          {tiles.map((option, index) => (
            <SettingsCard key={index} option={option} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}
