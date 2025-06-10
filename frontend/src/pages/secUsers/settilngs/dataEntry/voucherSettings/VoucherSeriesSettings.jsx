import SettingsCard from "@/components/common/SettingsCard";
import TitleDiv from "@/components/common/TitleDiv";

import {
  TbFileInvoice,
  TbShoppingCart,
  TbTruckDelivery,
  TbShoppingBag,
  TbArrowBigUpLines,
  TbArrowBigDownLines,
  TbArrowsExchange,
} from "react-icons/tb";

const VoucherSeriesSettings = () => {
  const voucherOptions = [
    {
      title: "Sale Order",
      description: "Configure voucher series for Sale Orders",
      icon: <TbFileInvoice />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"saleOrder"
    },
    {
      title: "Sale",
      description: "Configure voucher series for Sales",
      icon: <TbShoppingCart />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"sales"

    },
    {
      title: "Van Sale",
      description: "Configure voucher series for Van Sales",
      icon: <TbTruckDelivery />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"vanSale"
    },
    {
      title: "Purchase",
      description: "Configure voucher series for Purchases",
      icon: <TbShoppingBag />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"purchase"
    },
    {
      title: "Credit Note",
      description: "Configure voucher series for Credit Notes",
      icon: <TbArrowBigUpLines />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"creditNote"
    },
    {
      title: "Debit Note",
      description: "Configure voucher series for Debit Notes",
      icon: <TbArrowBigDownLines />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"debitNote"
    },
    {
      title: "Stock Transfer",
      description: "Configure voucher series for Stock Transfers",
      icon: <TbArrowsExchange />,
      to: "/sUsers/voucherSeriesList",
      active: true,
      from:"stockTransfer"
    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Voucher Series" from="/sUsers/dataEntrySettings" />
      <div className={`space-y-4 bg-white p-4 mx-1`}>
        {voucherOptions.map((option, index) => (
          <SettingsCard key={index} option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default VoucherSeriesSettings;
