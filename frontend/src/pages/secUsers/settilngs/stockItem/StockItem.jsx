/* eslint-disable react/jsx-key */
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import { FiDollarSign, FiMapPin, FiPlusCircle, FiSettings,FiTag  } from "react-icons/fi";

const StockItem = () => {
    const settingsOptions = [
        {
          title: "Stock Item Settings",
          description: "Filters only show product creation window if it's enabled",
          icon: <FiSettings />,
          to: "/sUsers/stockItemSettings",
          active: true,
        },
        {
          title: "Location",
          description: "Enable location tracking for all vouchers",
          icon: <FiMapPin />,
          to: "/sUsers/godown",
          active: true,
        },
     
        {
          title: "Price Level",
          description: "Enable Multiple Price level for invoice",
          icon: <FiDollarSign />,
          to: "/sUsers/pricelevel",
          active: true,
        },
        {
          title: "Tax Classification",
          description: "Enable it to adding HSN and Tax details when creating a new stock item",
          icon: <FiTag />,
          to: "/sUsers/hsnList",
          active: true,
        },
        {
          title: "Enable Batch",
          description: "Enable this to include batch while adding item in invoice",
          icon: <FiPlusCircle />,
          to: "/sUsers/addBatchSettings",
          active: false,
          toggle: true,
        },
      ];

  return (
    <div className="bg-white">
      <TitleDiv title="Stock Item " from="/sUsers/settings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StockItem;
