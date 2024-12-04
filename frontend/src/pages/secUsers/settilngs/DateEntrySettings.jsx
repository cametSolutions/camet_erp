/* eslint-disable react/jsx-key */
import TitleDiv from "../../../components/common/TitleDiv";
import SettingsCard from "../../../components/common/SettingsCard";
import { FiFileText, FiShoppingCart, FiUser } from 'react-icons/fi';

const DateEntrySettings = () => {
  const settingsOptions = [
    {
        title: "Vouchers",
        description: "Configure fields you would like to show in your voucher entry",
        icon: <FiFileText />,
        to: "/sUsers/VoucherSettings",
        active: true
      },
      {
        title: "Orders",
        description: "Configure fields you would like to show in your order entry",
        icon: <FiShoppingCart />,
        to: "/sUsers/OrderSettings",
        active: true

      },
      {
        title: "Invoice",
        description: "Configure fields you would like to show in your invoice entry", 
        icon: <FiUser />,
        to: "/sUsers/InvoiceSettings",
        active: true

      }
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Date Entry Settings" />
      <div className="space-y-4 b-white p-4   mx-1">
        {settingsOptions.map((option, index) => (
          <SettingsCard option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default DateEntrySettings;
