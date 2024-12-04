/* eslint-disable react/jsx-key */
import TitleDiv from "../../../components/common/TitleDiv";
import SettingsCard from "../../../components/common/SettingsCard";
import { FiCalendar, FiCreditCard, FiDollarSign, FiMapPin, FiTag, FiUsers  } from "react-icons/fi";

const PartySettings = () => {
    const settingsOptions = [
        {
          title: "Party Settings",
          description: "Configure your party settings",
          icon: <FiUsers />,
          to: "/sUsers/partySettings",
          active: false,
          toggle: true,
        },
        {
          title: "Enable PAN",
          description: "Enable PAN for parties",
          icon: <FiCreditCard />,
          to: "/sUsers/enablePAN",
          active: false,
          toggle: true,

        },
        {
          title: "Enable Shipping Address",
          description: "Enable shipping address for parties",
          icon: <FiMapPin />,
          to: "/sUsers/enableShippingAddress",
          active: false,
          toggle: true,

        },
        {
          title: "Enable Credit Limit",
          description: "Enable credit limit for parties",
          icon: <FiDollarSign />,
          to: "/sUsers/enableCreditLimit",
          active: false,
          toggle: true,

        },
        {
          title: "Enable Credit Days",
          description: "Enable credit days for parties",
          icon: <FiCalendar />,
          to: "/sUsers/enableCreditDays",
          active: false,
          toggle: true,


        },
        {
          title: "Set Price Level",
          description: "Set price level for parties",
          icon: <FiTag />,
          to: "/sUsers/setPriceLevel",
          active: false,
          toggle: true,

        },
      ];

  return (
    <div className="bg-white">
      <TitleDiv title="Party Settings" from="/sUsers/settings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PartySettings;
