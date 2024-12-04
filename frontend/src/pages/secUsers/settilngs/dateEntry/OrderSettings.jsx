/* eslint-disable react/jsx-key */
import {  TbMail, TbReceiptTax, TbDiscount2, TbLock, TbFileText } from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";

const OrderSettings = () => {

  const settingsOptions = [
    {
      title: "Disable Rate for an Item",
      description: "Enable this to restrict users from editing the rate while adding an item in the invoice",
      icon: <TbLock />,
      to: "/orderSettings/disableRate",
      active: false,
      toggle: true,
    },
    {
      title: "Disable Discount for an Item",
      description: "Enable this to restrict users from editing the discount while adding an item in the invoice",
      icon: <TbDiscount2 />,
      to: "/orderSettings/disableDiscount",
      active: false,
      toggle: true,

    },
    {
      title: "Add Rate with Tax",
      description: "On selection, allows entering rate with tax field",
      icon: <TbReceiptTax />,
      to: "/orderSettings/addRateWithTax",
      active: false,
      toggle: true,

    },
    {
      title: "Allow Zero Values Entries",
      description: "Enable this to create invoices with zero values",
      icon: <TbMail />,
      to: "/orderSettings/allowZeroValues",
      active: false,
      toggle: true,

    },
    {
      title: "Terms & Conditions",
      description: "Define the terms and conditions for invoices and orders",
      icon: <TbFileText />,
      to: "/orderSettings/termsAndConditions",
      active: false,
    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Settings" from="/sUsers/dataEntrySettings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default OrderSettings;
