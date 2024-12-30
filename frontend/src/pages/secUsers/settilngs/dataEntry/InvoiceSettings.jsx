/* eslint-disable react/jsx-key */
import { TbSettings, TbDiscount2, TbReceiptTax, TbLock, TbFileText, TbTruck, TbEdit } from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";

const InvoiceSettings = () => {

    const settingsOptions = [
      {
        title: "Disable Rate for an Item",
        description: "Enable this to restrict users from editing the rate while adding an item in the invoice",
        icon: <TbLock />,
        to: "/invoiceSettings/disableRate",
       active: false,
        toggle: true,
      },
      {
        title: "Disable Discount for an Item",
        description: "Enable this to restrict users from editing the discount while adding an item in the invoice",
        icon: <TbDiscount2 />,
        to: "/invoiceSettings/disableDiscount",
       active: false,
        toggle: true,

      },
      {
        title: "Add Rate with Tax",
        description: "On selection, allows entering the rate with a tax field",
        icon: <TbReceiptTax />,
        to: "/invoiceSettings/addRateWithTax",
       active: false,
        toggle: true,

      },
      {
        title: "Allow Zero Values Entries",
        description: "Enable this to create invoices with zero values",
        icon: <TbSettings />,
        to: "/invoiceSettings/allowZeroValues",
       active: false,
        toggle: true,

      },
      {
        title: "Enable Ship to Bill on Invoice",
        description: "Enable this option to include 'Ship to Bill' details on the invoice",
        icon: <TbTruck />,
        to: "/invoiceSettings/enableShipToBill",
       active: false,
        toggle: true,

      },
      {
        title: "Terms & Conditions",
        description: "Define the terms and conditions for invoices and orders",
        icon: <TbFileText />,
        to: "/invoiceSettings/termsAndConditions",
       active: false,
      },
      {
        title: "Custom Despatch Title",
        description: "Add a custom title for despatch details in vouchers",
        icon: <TbEdit />,
        to: "/sUsers/invoice/customDespatchTitle",
        active: true,
      },
    ];
    
    

  return (
    <div className="bg-white">
      <TitleDiv title="Invoice Settings" from="/sUsers/dataEntrySettings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard key={index} option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default InvoiceSettings;
