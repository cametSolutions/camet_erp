import SettingsCard from "@/components/common/SettingsCard";
import TitleDiv from "@/components/common/TitleDiv";
import { 
  HiOfficeBuilding, 
  HiCurrencyDollar, 
  HiLocationMarker, 
  HiUserGroup, 
  HiTruck, 
  HiDocumentText, 
  HiUsers 
} from 'react-icons/hi';
import { useParams } from "react-router-dom";

export default function ConfigureRetailer() {

  const {userId}=useParams();

  



const tiles = [
  {
    title: "SET COMPANIES",
    description: "Configure and manage company profiles",
    icon: <HiOfficeBuilding />,
    to: "/sUsers/allocateCompany",
    active: true,
    data:{userId}
  },
  {
    title: "SET PRICE LEVEL",
    description: "Define pricing tiers and discount levels",
    icon: <HiCurrencyDollar />,
    to: "/sUsers/SetPriceLevel",
    active: true,
    
  },
  {
    title: "SET LOCATION",
    description: "Manage warehouse and branch locations",
    icon: <HiLocationMarker />,
    to: "/sUsers/SetLocation",
    active: true,
  },
  {
    title: "UPDATE CUSTOMER GROUP",
    description: "Organize customers into groups and categories",
    icon: <HiUserGroup />,
    to: "/sUsers/UpdateCustomerGroup",
    active: true,
  },
  {
    title: "SET VAN",
    description: "Configure delivery vehicles and routes",
    icon: <HiTruck />,
    to: "/sUsers/SetVan",
    active: true,
  },
  {
    title: "SET SERIES TYPE",
    description: "Define document series and numbering",
    icon: <HiDocumentText />,
    to: "/sUsers/SetSeriesType",
    active: true,
  },
  {
    title: "SET PAGES",
    description: "Configure staff roles and system permissions",
    icon: <HiUsers />,
    to: "/sUsers/SetPages",
    active: true,
  },
];


  return (
    <>
      <TitleDiv title="Configure User" />

      <section>
        <div className="space-y-4 b-white p-4   mx-1">
        {tiles.map((option, index) => (
          <SettingsCard key={index}  option={option} index={index} />
        ))}
      </div>
      </section>
    </>
  );
}
