/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */

import transactionImg from "../../assets/images/transactions.png";
import stockreRister from "../../assets/images/clipboard.png";
import vouchers from "../../assets/images/application.png";
import outStanding from "../../assets/images/outstanding.png";
import reportImg from "../../assets/images/reports.png";

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
        icon: reportImg,
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: "Reports",
        link: "/sUsers/reports",
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
            <div className="flex items-center   px-2 py-4  shadow-md rounded-md bg-slate-50  hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
              <div className="bg-white p-1.5 rounded-lg flex justify-center items-center w-12 h-12 md:w-14 md:h-14 shadow-lg">
                <img src={card.icon} alt={card.title} className="" />
              </div>
              <div className="mx-2 md:mx-5">
                {/* {card.title && (
                  <h4 className="sm:text-md md:text-lg font-semibold text-gray-700">
                    {card.title}
                  </h4>
                )} */}
                <div className="text-gray-500 text-[15px]">{card?.subtitle}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>


  );
};

export default DashboardCards;
