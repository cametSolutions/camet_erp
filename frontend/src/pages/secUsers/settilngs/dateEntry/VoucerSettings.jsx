/* eslint-disable react/jsx-key */
import {
  TbMail,
  TbFileInvoice,
  TbBuildingBank,
  TbPhoto,
  TbEdit,
} from "react-icons/tb";
import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";

const VoucerSettings = () => {
  const settingsOptions = [
    {
      title: "Email",
      description:
        "Configure email list on which you need to send data entry email",
      icon: <TbMail />,
      to: "/voucherSettings/email",
      active: false,
    },
    {
      title: "Voucher Type",
      description: "Enable it to add entries with custom voucher type",
      icon: <TbFileInvoice />,
      to: "/voucherSettings/voucherType",
      active: false,
    },
    {
      title: "Select Bank Account",
      description:
        "On selection, it shows the bank account details in orders, invoices",
      icon: <TbBuildingBank />,
      to: "/voucherSettings/bankAccount",
      active: false,
    },
    {
      title: "Company Logo",
      description:
        "Add, edit or delete the company logo image that is attached to every shared voucher",
      icon: <TbPhoto />,
      to: "/voucherSettings/companyLogo",
      active: false,
    },
    {
      title: "Custom Despatch Title",
      description: "Add a custom title for despatch details in vouchers",
      icon: <TbEdit />,
      to: "/voucherSettings/customDespatchTitle",
      active: false,
    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Voucher Settings" from="/sUsers/dataEntrySettings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default VoucerSettings;
