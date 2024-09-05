/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import sale from "../../../assets/images/sale.png";

import creditNote from "../../../assets/images/creditNote.png";
import PerformaInvoice from "../../../assets/images/bill.png";
import Quotation from "../../../assets/images/quotation.png";
import purchaseInvoice from "../../../assets/images/purchaseInvoice.png";
import paymentout from "../../../assets/images/paymentout.png";
import debitNote from "../../../assets/images/debitNote.png";
import expense from "../../../assets/images/expense.png";
import vanSale from "../../../assets/images/vanSale.png";
import stockTransfer from "../../../assets/images/stockTransfer.png";

import paymentIn from "../../../assets/images/paymentIn.png";
import { IoAlertCircle } from "react-icons/io5";

const salesTiles = [
  {
    title: "Sales",
    icon: sale,
    to: "/sUsers/sales",
    active: true,
    subtitle: "Record sales transactions",
  },
  {
    title: "Payment In",
    icon: paymentIn,
    to: "/sUsers/receipt ",
    active: true,
    subtitle: "Track received payments",
  },
  {
    title: "Credit Note",
    icon: creditNote,
    to: "/sUsers/creditnote",
    active: false,
    subtitle: "Issue and track credit adjustments",
  },
  {
    title: "Perfoma Invoice",
    icon: PerformaInvoice,
    to: "/sUsers/creditnote",
    active: false,
    subtitle: "Draft pre-invoice documents",
  },
  {
    title: "Quotation",
    icon: Quotation,
    to: "/sUsers/invoice",
    active: true,
    subtitle: "Document and track client quotations",
  },
  // Commented out tiles can be uncommented if needed
];

const purchaseTiles = [
  {
    title: "Purchase Invoice",
    icon: purchaseInvoice,
    to: "/sUsers/purchase",
    active: true,
    subtitle: "Track and document your purchases",
  },
  {
    title: "Payment Out",
    icon: paymentout,
    to: "/sUsers/creditnote",
    active: false,
    subtitle: "Record all payment outflows",
  },
  {
    title: "Debit Note",
    icon: debitNote,
    to: "/sUsers/creditnote",
    active: false,
    subtitle: "Adjust and manage account debits",
  },

  // Commented out tiles can be uncommented if needed
];
const others = [
  {
    title: "Expence",
    icon: expense,
    to: "/sUsers/sales",
    active: false,
    subtitle: "Track and document your purchases",
  },
  {
    title: "Van Sale",
    icon: vanSale,
    to: "/sUsers/vanSale",
    active: true,
    subtitle: "Document sales made during van routes",
  },
  {
    title: "Stock Transfer",
    icon: stockTransfer,
    to: "/sUsers/stockTransfer",
    active: true,
    subtitle: "Track inventory transfers between locations",
  },

  // Commented out tiles can be uncommented if needed
];

const VoucherCards = ({ tab }) => {
  const [selectedTab, setSelectedTab] = useState(null);

  useEffect(() => {
    if (tab === "sales") {
      setSelectedTab(salesTiles);
    } else if (tab === "purchase") {
      setSelectedTab(purchaseTiles);
    } else {
      setSelectedTab(others);
    }
    // Add more conditions here if you have other tabs
  }, [tab]);

  const CardContent = ({ item }) => (
    <div className="bg-slate-50 cursor-pointer flex gap-6 items-center p-3 md:p-4 hover:bg-slate-100 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
      {!item.active && (
        <div className="absolute top-0 right-0 bg-[#7ecbaa] text-white  text-xs  font-bold px-1 py-1  md:px-2 md:py-1 rounded-bl-md flex justify-center items-center">
          <IoAlertCircle className="w-4 h-4 inline-block " />
        </div>
      )}

      <aside>
        <div className="bg-white p-2 rounded-lg flex justify-center items-center w-12 h-12 md:w-16 md:h-16 shadow-lg">
          <img src={item.icon} alt={item.title} className="" />
        </div>
      </aside>
      <main className="">
        <h1 className="text-gray-700 md:text-lg font-medium">{item.title}</h1>
        <p className="text-sm md:text-md text-gray-500">{item.subtitle}</p>
      </main>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4 md:gap-y-8  p-2 md:p-4">
      {selectedTab &&
        selectedTab.map((item, index) =>
          item.active ? (
            <Link key={index} to={item.to}>
              <CardContent item={item} />
            </Link>
          ) : (
            <div key={index} className="">
              <CardContent item={item} />
            </div>
          )
        )}
    </div>
  );
};

export default VoucherCards;
