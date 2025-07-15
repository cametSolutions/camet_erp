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
import { IoReceiptSharp } from "react-icons/io5";
import { MdReceipt } from "react-icons/md";
import { useLocation } from "react-router-dom";



const AllocationSeriesList = () => {
  const location=useLocation();
  const userData=location.state?.data?.userData;
  
  const voucherOptions = [
    {
      title: "Sale Order",
      description: "Configure voucher series for Sale Orders",
      icon: <TbFileInvoice />,
      to: "/sUsers/allocateSeries/saleOrder",
      active: true,
      from: "saleOrder",
      data:{userData}

    },
    {
      title: "Sale",
      description: "Configure voucher series for Sales",
      icon: <TbShoppingCart />,
      to: "/sUsers/allocateSeries/sales",
      active: true,
      from: "sales",
      data:{userData}

    },
    {
      title: "Van Sale",
      description: "Configure voucher series for Van Sales",
      icon: <TbTruckDelivery />,
      to: "/sUsers/allocateSeries/vanSale",
      active: true,
      from: "vanSale",
      data:{userData}

    },
    {
      title: "Purchase",
      description: "Configure voucher series for Purchases",
      icon: <TbShoppingBag />,
      to: "/sUsers/allocateSeries/purchase",
      active: true,
      from: "purchase",
      data:{userData}

    },
    {
      title: "Credit Note",
      description: "Configure voucher series for Credit Notes",
      icon: <TbArrowBigUpLines />,
      to: "/sUsers/allocateSeries/creditNote",
      active: true,
      from: "creditNote",
      data:{userData}

    },
    {
      title: "Debit Note",
      description: "Configure voucher series for Debit Notes",
      icon: <TbArrowBigDownLines />,
      to: "/sUsers/allocateSeries/debitNote",
      active: true,
      from: "debitNote",
      data:{userData}

    },
    {
      title: "Receipt",
      description: "Configure voucher series for Receipts",
      icon: <IoReceiptSharp />,
      to: "/sUsers/allocateSeries/receipt",
      active: true,
      from: "receipt",
      data:{userData}

    },
    {
      title: "Payment",
      description: "Configure voucher series for payments",
      icon: <MdReceipt />,
      to: "/sUsers/allocateSeries/payment",
      active: true,
      from: "payment",
      data:{userData}

    },
    {
      title: "Stock Transfer",
      description: "Configure voucher series for Stock Transfers",
      icon: <TbArrowsExchange />,
      to: "/sUsers/allocateSeries/stockTransfer",
      active: true,
      from: "stockTransfer",
      data:{userData}

    },
  ];

  return (
    <div className="bg-white">
      <TitleDiv title="Allocation Voucher Series"  />
      <div className={`space-y-4 bg-white p-4 mx-1`}>
        {voucherOptions.map((option, index) => (
          <SettingsCard key={index} option={option} index={index} />
        ))}
      </div>
    </div>
  );
};

export default AllocationSeriesList;
