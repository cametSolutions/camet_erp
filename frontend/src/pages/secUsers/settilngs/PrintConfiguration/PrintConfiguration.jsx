/* eslint-disable react/jsx-key */
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { BiPurchaseTagAlt } from "react-icons/bi";



const PrintConfiguration = () => {
  const settingsOptions = [
    {
      title: "Sale Order",
      description:
        "Configure email list on which you need to send data entry email",
      icon: <BiPurchaseTagAlt />,
      to: "/sUsers/saleOrderPrintConfiguration",
      active: true,
      // modal: true,
    },
    {
      title: "Sale",
      description: "Enable it to add entries with custom voucher type",
      icon: <BiSolidPurchaseTag />,
      to: "/sUsers/salePrintConfiguration",
      active: true,
    },
  ];

  const modalHandler = () => {};

  return (
    <div className="bg-white">
      <TitleDiv title="Print Configurations" from="/sUsers/settings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard
            key={index}
            option={option}
            index={index}
            modalHandler={modalHandler}
          />
        ))}
      </div>
    </div>
  );
};

export default PrintConfiguration;
