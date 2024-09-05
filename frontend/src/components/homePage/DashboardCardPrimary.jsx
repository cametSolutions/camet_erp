/* eslint-disable react/prop-types */
import { BiSolidAddToQueue } from "react-icons/bi";

import transactionImg from "../../assets/images/transactions.png";
import stockreRister from "../../assets/images/stockregister.png";
import vouchers from "../../assets/images/voucher.png";
import outStanding from "../../assets/images/outstanding.png";

const DashboardCards = ({ userType, receiptTotal, handleLinkClick }) => {
  const cardData = {
    primary: [
      {
        icon: transactionImg,
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: "Transactions",
        link: "/pUsers/transaction",
      },
      {
        icon: stockreRister,
        subtitle: "Stock Register",
        link: "/pUsers/Inventory",
      },
    ],
    secondary: [
      {
        icon: transactionImg,
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: "Transactions",
        link: "/sUsers/transaction",
      },
      {
        icon: outStanding,
        subtitle: "Outstanding",
        link: "/sUsers/outstanding",
      },
      {
        icon: stockreRister,
        subtitle: "Stock Register",
        link: "/sUsers/Inventory",
      },
      // {
      //   icon: <RiContactsFill />,
      //   bgColor: "bg-[#9b5de5]",
      //   subtitle: "Contacts",
      //   link: "/sUsers/contacts",
      // },
      // {
      //   icon: <BiTransfer />,
      //   bgColor: "bg-[#134074]",
      //   subtitle: "Stock Transfer",
      //   link: "/sUsers/stockTransfer",
      // },
      {
        icon: vouchers,
        subtitle: "Vouchers",
        link: "/sUsers/selectVouchers",
      },
    ],
  };

  const cards = cardData[userType];

  return (
    <div
      className={`grid grid-cols-2 p-6 lg:px-6 gap-4 md:gap-6 bg-white w-full md:w-6.5/12 sticky top-[100px] `}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleLinkClick(card.link)}
          className="flex flex-wrap  "
        >
          <div className="w-full  cursor-pointer ">
            <div className="flex items-center   px-2 py-4  shadow-sm rounded-md bg-slate-100  hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="bg-white p-2 rounded-lg flex justify-center items-center w-12 h-12 md:w-14 md:h-14 shadow-lg">
                <img src={card.icon} alt={card.title} className="" />
              </div>
              <div className="mx-2 md:mx-5">
                {card.title && (
                  <h4 className="sm:text-md md:text-lg font-semibold text-gray-700">
                    {card.title}
                  </h4>
                )}
                <div className="text-gray-500 text-[15px]">{card.subtitle}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
