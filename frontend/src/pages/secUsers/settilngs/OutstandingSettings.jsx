/* eslint-disable react/jsx-key */
import TitleDiv from "../../../components/common/TitleDiv";
import SettingsCard from "../../../components/common/SettingsCard";
import { TbMoneybag, TbCalendarTime, TbSettings } from "react-icons/tb";
const OutstandingSettings = () => {
    const settingsOptions = [
        {
          title: "Outstanding Settings",
          description: "Calculate your overdue days by bill date or due date",
          icon: <TbSettings />,
          to: "/sUsers/outstandingSettings",
          active: false,
        },
        {
          title: "View outstanding by",
          description: "Choose how to calculate overdue days, by bill date or due date",
          icon: <TbCalendarTime />,
          to: "/sUsers/outstandingSettings",
          active: false,
        },
        {
          title: "Aging Configuration",
          description: "Choose your custom aging period to be viewed in receivable & payable",
          icon: <TbMoneybag />,
          to: "/sUsers/outstandingSettings",
          active: false,
        },
      ];
  return (
    <div className="bg-white">
      <TitleDiv title="Outstanding Settings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default OutstandingSettings;
